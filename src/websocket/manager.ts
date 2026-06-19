import { WebSocket } from 'ws';
import { redis, getPresenceKey } from '../redis/client.js';
import { PresenceStatus } from '@prisma/client';
import pino from 'pino';

const logger = pino();

export class ConnectionManager {
  private static connections: Map<string, WebSocket> = new Map();
  private static subscriber: any = null;

  static async init(redisUrl: string) {
    const Redis = (await import('ioredis')).default as any;
    this.subscriber = new Redis(redisUrl);
    this.subscriber.psubscribe('device_messages:*');
    this.subscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
      const deviceId = channel.split(':')[1];
      const localWs = this.connections.get(deviceId);
      if (localWs && localWs.readyState === 1) {
        localWs.send(message);
      }
    });
  }

  static async addConnection(deviceId: string, ws: WebSocket) {
    // Handle duplicate sessions: close old one
    const existing = this.connections.get(deviceId);
    if (existing) {
      existing.close(1000, 'Duplicate session');
    }

    this.connections.set(deviceId, ws);
    await this.updatePresence(deviceId, PresenceStatus.ONLINE);
    logger.info({ deviceId }, 'Device connected');
  }

  static async removeConnection(deviceId: string) {
    const ws = this.connections.get(deviceId);
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Connection removed');
      }
      this.connections.delete(deviceId);
    }
    await this.updatePresence(deviceId, PresenceStatus.OFFLINE);
    logger.info({ deviceId }, 'Device disconnected');
  }

  static async updatePresence(deviceId: string, status: PresenceStatus) {
    const key = getPresenceKey(deviceId);
    await redis.set(key, status, 'EX', 300); // 5 mins TTL
    // In a distributed setup, we would use Redis Pub/Sub here
    await redis.publish('presence_updates', JSON.stringify({ deviceId, status }));
  }

  static getConnection(deviceId: string): WebSocket | undefined {
    return this.connections.get(deviceId);
  }

  static async sendMessage(deviceId: string, message: any) {
    const ws = this.connections.get(deviceId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    // If not local, we could publish to Redis for other nodes to pick up
    await redis.publish(`device_messages:${deviceId}`, JSON.stringify(message));
    return false;
  }
}
