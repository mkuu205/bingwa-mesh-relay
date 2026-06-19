"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebSocketHandler = registerWebSocketHandler;
const ws_1 = require("ws");
const manager_js_1 = require("./manager.js");
const service_js_1 = require("../auth/service.js");
const types_js_1 = require("../protocol/types.js");
const mesh_service_js_1 = require("../mesh/mesh.service.js");
const routing_service_js_1 = require("../routing/routing.service.js");
const sync_service_js_1 = require("../services/sync.service.js");
const heartbeat_service_js_1 = require("../heartbeat/heartbeat.service.js");
const client_js_1 = require("../redis/client.js");
const client_js_2 = require("../database/client.js");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
function registerWebSocketHandler(fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        let authenticatedDeviceId = null;
        connection.on('message', async (data) => {
            try {
                const rawMessage = JSON.parse(data);
                const message = types_js_1.BaseMessageSchema.parse(rawMessage);
                // Idempotency check for all messages
                const isDuplicate = await checkIdempotency(message.messageId);
                if (isDuplicate) {
                    logger.warn({ messageId: message.messageId }, 'Duplicate message received, skipping');
                    return;
                }
                if (message.type === types_js_1.MessageType.AUTH) {
                    const { token } = message.payload;
                    try {
                        const payload = service_js_1.AuthService.verifyAccessToken(token);
                        // Replay protection
                        if (await service_js_1.AuthService.isReplay(payload.jti)) {
                            connection.terminate();
                            return;
                        }
                        authenticatedDeviceId = payload.deviceId;
                        await manager_js_1.ConnectionManager.addConnection(authenticatedDeviceId, connection);
                        await sendResponse(connection, types_js_1.MessageType.ACK, message.messageId, { status: 'authenticated' });
                        await service_js_1.AuthService.logAuthAction(authenticatedDeviceId, 'WS_AUTH', true);
                    }
                    catch (err) {
                        await service_js_1.AuthService.logAuthAction(message.payload.deviceId || 'unknown', 'WS_AUTH', false, 'Invalid token');
                        connection.terminate();
                    }
                    return;
                }
                if (!authenticatedDeviceId) {
                    connection.terminate();
                    return;
                }
                await handleMessage(authenticatedDeviceId, message, connection);
            }
            catch (err) {
                logger.error({ err }, 'WebSocket message error');
                if (connection.readyState === ws_1.WebSocket.OPEN) {
                    connection.send(JSON.stringify({
                        type: types_js_1.MessageType.ERROR,
                        payload: { message: 'Invalid message format or error processing' }
                    }));
                }
            }
        });
        connection.on('close', async () => {
            if (authenticatedDeviceId) {
                await manager_js_1.ConnectionManager.removeConnection(authenticatedDeviceId);
            }
        });
    });
}
async function checkIdempotency(messageId) {
    const key = (0, client_js_1.getAckCacheKey)(messageId);
    const exists = await client_js_1.redis.get(key);
    if (exists)
        return true;
    await client_js_1.redis.set(key, '1', 'EX', 3600); // 1 hour cache
    return false;
}
async function sendResponse(ws, type, refId, payload) {
    if (ws.readyState === ws_1.WebSocket.OPEN) {
        ws.send(JSON.stringify({
            protocolVersion: '1.0.0',
            messageId: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            type,
            payload: { ...payload, refId }
        }));
    }
}
async function validateOwnership(deviceId, message) {
    // Real logic: Check if the device sending the message is the one assigned to the transaction
    // or the controller that initiated it.
    const { transactionId } = message.payload;
    if (!transactionId)
        return true; // Not a transaction message or missing ID
    const event = await client_js_2.prisma.relayEvent.findFirst({
        where: { transactionId, eventType: types_js_1.MessageType.ASSIGN_TRANSACTION },
        include: { device: true }
    });
    if (!event)
        return true; // First time seeing this transaction
    const device = await client_js_2.prisma.device.findUnique({ where: { deviceId } });
    if (!device)
        return false;
    // Controller who assigned it or Worker it was assigned to
    return event.deviceId === device.id || message.payload.workerId === deviceId;
}
async function handleMessage(deviceId, message, ws) {
    logger.info({ deviceId, type: message.type }, 'Received message');
    // Log event to DB
    await client_js_2.prisma.relayEvent.create({
        data: {
            deviceId: (await client_js_2.prisma.device.findUnique({ where: { deviceId } }))?.id || '',
            eventType: message.type,
            messageId: message.messageId,
            transactionId: message.payload.transactionId,
            payload: message.payload,
        }
    });
    switch (message.type) {
        case types_js_1.MessageType.HELLO:
            await sendResponse(ws, types_js_1.MessageType.ACK, message.messageId, { status: 'ready', serverTime: Date.now() });
            break;
        case types_js_1.MessageType.PING:
            await sendResponse(ws, types_js_1.MessageType.PONG, message.messageId, { timestamp: Date.now() });
            break;
        case types_js_1.MessageType.HEARTBEAT:
            await heartbeat_service_js_1.HeartbeatService.processHeartbeat(deviceId, message.payload);
            await sendResponse(ws, types_js_1.MessageType.ACK, message.messageId, { status: 'heartbeat_received' });
            break;
        case types_js_1.MessageType.DISCOVERY:
            const devices = await mesh_service_js_1.MeshService.discoverDevices(deviceId);
            await sendResponse(ws, types_js_1.MessageType.DISCOVERY_RESPONSE, message.messageId, { devices });
            break;
        case types_js_1.MessageType.PAIR_REQUEST:
            const { targetDeviceId, pairingToken } = message.payload;
            const isValid = await mesh_service_js_1.MeshService.validatePairingToken(pairingToken);
            if (isValid) {
                await manager_js_1.ConnectionManager.sendMessage(targetDeviceId, message);
            }
            else {
                await sendResponse(ws, types_js_1.MessageType.PAIR_REJECT, message.messageId, { reason: 'Invalid or expired pairing token' });
            }
            break;
        case types_js_1.MessageType.ASSIGN_TRANSACTION:
        case types_js_1.MessageType.ACK:
        case types_js_1.MessageType.EXECUTION_PROGRESS:
        case types_js_1.MessageType.VERIFYING:
        case types_js_1.MessageType.VERIFIED:
        case types_js_1.MessageType.COMPLETED:
        case types_js_1.MessageType.FAILED:
        case types_js_1.MessageType.CANCELLED:
        case types_js_1.MessageType.EXECUTION_LOST:
        case types_js_1.MessageType.DEVICE_STATUS:
        case types_js_1.MessageType.ROUTING_UPDATE:
        case types_js_1.MessageType.DISCOVERY_RESPONSE:
        case types_js_1.MessageType.PAIR_REQUEST:
        case types_js_1.MessageType.PAIR_ACCEPT:
        case types_js_1.MessageType.PAIR_REJECT:
            // Forward to target using RoutingService for global delivery
            const targetId = message.payload.targetDeviceId || message.payload.workerId || message.payload.controllerId;
            // Ownership validation for transaction messages
            if ([types_js_1.MessageType.ASSIGN_TRANSACTION, types_js_1.MessageType.COMPLETED, types_js_1.MessageType.FAILED].includes(message.type)) {
                const isValidOwner = await validateOwnership(deviceId, message);
                if (!isValidOwner) {
                    await sendResponse(ws, types_js_1.MessageType.ERROR, message.messageId, { reason: 'Unauthorized: Device does not own this transaction' });
                    return;
                }
            }
            if (targetId) {
                const forwarded = await routing_service_js_1.RoutingService.routeMessage(targetId, message);
                if (!forwarded) {
                    await sendResponse(ws, types_js_1.MessageType.ERROR, message.messageId, { reason: 'Target device offline or unreachable' });
                }
            }
            break;
        case types_js_1.MessageType.SYNC:
            const syncData = await sync_service_js_1.SyncService.getDeviceState(deviceId);
            await sendResponse(ws, types_js_1.MessageType.ACK, message.messageId, { status: 'sync_completed', data: syncData });
            break;
        case types_js_1.MessageType.PONG:
            // Client-side pong, no action needed but could be used for latency tracking
            break;
        case types_js_1.MessageType.DISCONNECT:
            ws.close(1000, 'Client requested disconnect');
            break;
        default:
            logger.warn({ type: message.type }, 'Unhandled message type');
            await sendResponse(ws, types_js_1.MessageType.ERROR, message.messageId, { reason: `Unhandled message type: ${message.type}` });
            break;
    }
}
//# sourceMappingURL=handler.js.map