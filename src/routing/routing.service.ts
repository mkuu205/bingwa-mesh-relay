import { ConnectionManager } from '../websocket/manager.js';
import { prisma } from '../database/client.js';
import { redis } from '../redis/client.js';
import pino from 'pino';

const logger = pino();

export class RoutingService {
  static async routeMessage(targetDeviceId: string, message: any): Promise<boolean> {
    // 1. Check local connections
    const delivered = await ConnectionManager.sendMessage(targetDeviceId, message);
    if (delivered) {
      logger.info({ targetDeviceId, messageId: message.messageId }, 'Message delivered locally');
      return true;
    }

    // 2. Check if device is online globally (Redis)
    const presence = await redis.get(`presence:${targetDeviceId}`);
    if (presence && presence !== 'OFFLINE') {
      // Publish to Redis Pub/Sub for other relay nodes
      await redis.publish(`device_messages:${targetDeviceId}`, JSON.stringify(message));
      logger.info({ targetDeviceId, messageId: message.messageId }, 'Message routed via Pub/Sub');
      return true;
    }

    logger.warn({ targetDeviceId, messageId: message.messageId }, 'Target device offline, routing failed');
    return false;
  }

  static async broadcastToGroup(groupId: string, senderDeviceId: string, message: any) {
    const devices = await prisma.device.findMany({
      where: { meshGroupId: groupId, NOT: { deviceId: senderDeviceId } }
    });

    for (const device of devices) {
      await this.routeMessage(device.deviceId, message);
    }
  }
}
