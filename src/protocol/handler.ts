import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import crypto from 'node:crypto';
import { ConnectionManager } from './manager.js';
import { AuthService } from '../auth/service.js';
import { MessageType, BaseMessageSchema } from '../protocol/types.js';
import { DeviceService } from '../services/device.service.js';
import { MeshService } from '../mesh/mesh.service.js';
import { RoutingService } from '../routing/routing.service.js';
import { SyncService } from '../services/sync.service.js';
import { HeartbeatService } from '../heartbeat/heartbeat.service.js';
import { redis, getAckCacheKey } from '../redis/client.js';
import { prisma } from '../database/client.js';
import { DeviceType } from '@prisma/client';
import pino from 'pino';

const logger = pino();

export function registerWebSocketHandler(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    let authenticatedDeviceId: string | null = null;

    connection.on('message', async (data: string) => {
      try {
        const rawMessage = JSON.parse(data);
        const message = BaseMessageSchema.parse(rawMessage);

        // Idempotency check for all messages
        const isDuplicate = await checkIdempotency(message.messageId);
        if (isDuplicate) {
          logger.warn({ messageId: message.messageId }, 'Duplicate message received, skipping');
          return;
        }

        if (message.type === MessageType.AUTH) {
          const { token } = message.payload;

          try {
            const payload = AuthService.verifyAccessToken(token);

            if (await AuthService.isReplay(payload.jti)) {
              connection.terminate();
              return;
            }

            authenticatedDeviceId = payload.deviceId;

            await ConnectionManager.addConnection(
              authenticatedDeviceId,
              connection as any
            );

            // Ensure device exists in database
            await prisma.device.upsert({
              where: {
                deviceId: authenticatedDeviceId,
              },
              update: {
                lastSeenAt: new Date(),
              },
              create: {
                deviceId: authenticatedDeviceId,
                name: authenticatedDeviceId,
                type: DeviceType.WORKER,
                lastSeenAt: new Date(),
              },
            });

            await sendResponse(
              connection as any,
              MessageType.AUTH_SUCCESS,
              message.messageId,
              { status: "authenticated" },
              "relay"
            );

            await AuthService.logAuthAction(
              authenticatedDeviceId,
              "WS_AUTH",
              true
            );

          } catch {
            connection.terminate();
          }

          return;
        }

        /*
         * ADD THIS ENTIRE BLOCK
         */
        if (
          message.type === MessageType.HELLO &&
          !authenticatedDeviceId
        ) {
          authenticatedDeviceId = message.senderId;

          await ConnectionManager.addConnection(
            authenticatedDeviceId,
            connection as any
          );

          // Ensure device exists in database
          await prisma.device.upsert({
            where: {
              deviceId: authenticatedDeviceId,
            },
            update: {
              lastSeenAt: new Date(),
            },
            create: {
              deviceId: authenticatedDeviceId,
              name: authenticatedDeviceId,
              type: DeviceType.WORKER,
              lastSeenAt: new Date(),
            },
          });

          await sendResponse(
            connection as any,
            MessageType.AUTH_SUCCESS,
            message.messageId,
            {
              status: "authenticated"
            },
            "relay"
          );

          logger.info(
            { deviceId: authenticatedDeviceId },
            "HELLO authentication accepted"
          );

          return;
        }

        if (!authenticatedDeviceId) {
          connection.terminate();
          return;
        }

        await handleMessage(authenticatedDeviceId, message, connection as any);

      } catch (err) {
        logger.error({ err }, 'WebSocket message error');
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            protocolVersion: "1",
            messageId: crypto.randomUUID(),
            timestamp: Date.now(),
            senderId: "relay",
            type: MessageType.ERROR,
            payload: { message: 'Invalid message format or error processing' }
          }));
        }
      }
    });

    connection.on('close', async () => {
      if (authenticatedDeviceId) {
        await ConnectionManager.removeConnection(authenticatedDeviceId);
      }
    });
  });
}

async function checkIdempotency(messageId: string): Promise<boolean> {
  const key = getAckCacheKey(messageId);
  const exists = await redis.get(key);
  if (exists) return true;
  await redis.set(key, '1', 'EX', 3600); // 1 hour cache
  return false;
}

async function sendResponse(
  ws: WebSocket,
  type: MessageType,
  refId: string,
  payload: any,
  senderId: string = "relay"
) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      protocolVersion: "1",
      messageId: crypto.randomUUID(),
      timestamp: Date.now(),
      senderId,
      type,
      payload: {
        ...payload,
        refId
      }
    }));
  }
}

async function validateOwnership(deviceId: string, message: any): Promise<boolean> {
  // Real logic: Check if the device sending the message is the one assigned to the transaction
  // or the controller that initiated it.
  const { transactionId } = message.payload;
  if (!transactionId) return true; // Not a transaction message or missing ID

  const event = await prisma.relayEvent.findFirst({
    where: { transactionId, eventType: MessageType.ASSIGN_TRANSACTION },
    include: { device: true }
  });

  if (!event) return true; // First time seeing this transaction

  const device = await prisma.device.findUnique({ where: { deviceId } });
  if (!device) return false;

  // Controller who assigned it or Worker it was assigned to
  return event.deviceId === device.id || (message.workerId ?? message.payload?.workerId) === deviceId;
}

async function handleMessage(deviceId: string, message: any, ws: WebSocket) {
  logger.info({ deviceId, type: message.type }, 'Received message');
  
  // Find device first
  const device = await prisma.device.findUnique({
    where: { deviceId }
  });

  if (!device) {
    logger.warn(
      { deviceId },
      "Unknown device, cannot log event"
    );
    // Continue processing even if device not found for logging
    // The device might be in the process of registering
  }

  // Log event to DB if device exists
  if (device) {
    await prisma.relayEvent.create({
      data: {
        deviceId: device.id,
        eventType: message.type,
        messageId: message.messageId,
        transactionId: message.payload?.transactionId,
        payload: message.payload,
      }
    });
  }

  switch (message.type) {
    case MessageType.HELLO:
      await sendResponse(
        ws,
        MessageType.ACK,
        message.messageId,
        {
          status: "ready",
          serverTime: Date.now()
        },
        "relay"
      );
      break;

    case MessageType.PING:
      await sendResponse(
        ws,
        MessageType.PONG,
        message.messageId,
        { timestamp: Date.now() },
        "relay"
      );
      break;

    case MessageType.HEARTBEAT:
      await HeartbeatService.processHeartbeat(deviceId, message.payload);
      await sendResponse(
        ws,
        MessageType.ACK,
        message.messageId,
        { status: 'heartbeat_received' },
        "relay"
      );
      break;

    case MessageType.DISCOVERY:
      const devices = await MeshService.discoverDevices(deviceId);
      await sendResponse(
        ws,
        MessageType.DISCOVERY_RESPONSE,
        message.messageId,
        { devices },
        "relay"
      );
      break;

    case MessageType.PAIR_REQUEST: {
      const targetDeviceId =
        message.targetId ??
        message.payload?.targetDeviceId;

      const pairingToken = message.payload?.pairingToken;

      const isValid =
        await MeshService.validatePairingToken(pairingToken);

      if (isValid && targetDeviceId) {
        await ConnectionManager.sendMessage(
          targetDeviceId,
          message
        );
      } else {
        await sendResponse(
          ws,
          MessageType.PAIR_REJECT,
          message.messageId,
          {
            reason: "Invalid or expired pairing token"
          },
          "relay"
        );
      }

      break;
    }

    case MessageType.ASSIGN_TRANSACTION:
    case MessageType.ACK:
    case MessageType.EXECUTION_PROGRESS:
    case MessageType.VERIFYING:
    case MessageType.VERIFIED:
    case MessageType.COMPLETED:
    case MessageType.FAILED:
    case MessageType.CANCELLED:
    case MessageType.EXECUTION_LOST:
    case MessageType.DEVICE_STATUS:
    case MessageType.ROUTING_UPDATE:
    case MessageType.DISCOVERY_RESPONSE:
    case MessageType.PAIR_ACCEPT:
    case MessageType.PAIR_REJECT:
      // Forward to target using RoutingService for global delivery
      const targetId =
        message.targetId ||
        message.workerId ||
        message.controllerId ||
        message.payload?.targetDeviceId ||
        message.payload?.workerId ||
        message.payload?.controllerId;
      
      // Ownership validation for transaction messages
      if ([MessageType.ASSIGN_TRANSACTION, MessageType.COMPLETED, MessageType.FAILED].includes(message.type)) {
        const isValidOwner = await validateOwnership(deviceId, message);
        if (!isValidOwner) {
          await sendResponse(
            ws,
            MessageType.ERROR,
            message.messageId,
            { reason: 'Unauthorized: Device does not own this transaction' },
            "relay"
          );
          return;
        }
      }

      if (targetId) {
        const forwarded = await RoutingService.routeMessage(targetId, message);
        if (!forwarded) {
          await sendResponse(
            ws,
            MessageType.ERROR,
            message.messageId,
            { reason: 'Target device offline or unreachable' },
            "relay"
          );
        }
      }
      break;

    case MessageType.SYNC:
      const syncData = await SyncService.getDeviceState(deviceId);
      await sendResponse(
        ws,
        MessageType.ACK,
        message.messageId,
        { status: 'sync_completed', data: syncData },
        "relay"
      );
      break;

    case MessageType.PONG:
      // Client-side pong, no action needed but could be used for latency tracking
      break;

    case MessageType.DISCONNECT:
      ws.close(1000, 'Client requested disconnect');
      break;

    default:
      logger.warn({ type: message.type }, 'Unhandled message type');
      await sendResponse(
        ws,
        MessageType.ERROR,
        message.messageId,
        { reason: `Unhandled message type: ${message.type}` },
        "relay"
      );
      break;
  }
}
