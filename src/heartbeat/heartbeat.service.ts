import { prisma } from '../database/client.js';
import { redis, getHeartbeatKey, getPresenceKey } from '../redis/client.js';
import { PresenceStatus } from '@prisma/client';

export interface HeartbeatData {
  batteryLevel?: number;
  isCharging?: boolean;
  signalStrength?: number;
  accessibility?: boolean;
  automationActive?: boolean;
  queueSize?: number;
  currentTask?: string;
  version?: string;
  latency?: number;
  status?: PresenceStatus; // Allow device to report its specific status
}

export class HeartbeatService {
  static async processHeartbeat(deviceId: string, data: HeartbeatData) {
    const key = getHeartbeatKey(deviceId);
    await redis.set(key, JSON.stringify(data), 'EX', 60); // 1 min cache

    const device = await prisma.device.findUnique({ where: { deviceId } });
    if (!device) return;

    // Update Metadata
    await prisma.deviceMetadata.upsert({
      where: { deviceId: device.id },
      update: {
        batteryLevel: data.batteryLevel,
        isCharging: data.isCharging,
        signalStrength: data.signalStrength,
        accessibility: data.accessibility,
        automationActive: data.automationActive,
        queueSize: data.queueSize,
        currentTask: data.currentTask,
        version: data.version,
        latency: data.latency,
      },
      create: {
        deviceId: device.id,
        batteryLevel: data.batteryLevel,
        isCharging: data.isCharging,
        signalStrength: data.signalStrength,
        accessibility: data.accessibility,
        automationActive: data.automationActive,
        queueSize: data.queueSize,
        currentTask: data.currentTask,
        version: data.version,
        latency: data.latency,
      },
    });

    // Update Presence in Redis
    const status = data.status || PresenceStatus.ONLINE;
    await redis.set(getPresenceKey(deviceId), status, 'EX', 300);
    
    // Update last seen in DB
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });
  }

  static async getStaleDevices(thresholdSeconds: number = 300) {
    const threshold = new Date(Date.now() - thresholdSeconds * 1000);
    return prisma.device.findMany({
      where: {
        lastSeenAt: { lt: threshold },
      },
    });
  }

  static async markDeviceOffline(deviceId: string) {
    await prisma.device.update({
      where: { deviceId },
      data: { lastSeenAt: new Date() }
    });
    await redis.set(getPresenceKey(deviceId), PresenceStatus.OFFLINE, 'EX', 300);
  }
}
