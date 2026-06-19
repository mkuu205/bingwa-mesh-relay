import { prisma } from '../database/client.js';
import { DeviceType, PresenceStatus } from '@prisma/client';
import { redis } from '../redis/client.js';

export class MeshManager {
  static async getGroupController(groupId: string) {
    return prisma.device.findFirst({
      where: { meshGroupId: groupId, type: DeviceType.CONTROLLER }
    });
  }

  static async getGroupWorkers(groupId: string) {
    return prisma.device.findMany({
      where: { meshGroupId: groupId, type: DeviceType.WORKER }
    });
  }

  static async updateDeviceStatus(deviceId: string, status: PresenceStatus) {
    const device = await prisma.device.findUnique({ where: { deviceId } });
    if (!device) return;

    // Update Redis presence
    await redis.set(`presence:${deviceId}`, status, 'EX', 300);

    // If status is a significant change, log it
    if (status === PresenceStatus.OFFLINE || status === PresenceStatus.HEARTBEAT_LOST) {
      await prisma.auditLog.create({
        data: {
          deviceId: device.id,
          action: 'STATUS_CHANGE',
          payload: { status, timestamp: new Date().toISOString() }
        }
      });
    }
  }

  static async getConnectedDevicesCount() {
    // Count active keys in Redis for presence
    const keys = await redis.keys('presence:*');
    return keys.length;
  }
}
