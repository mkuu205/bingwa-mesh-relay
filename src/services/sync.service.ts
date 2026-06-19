import { prisma } from '../database/client.js';
import { redis } from '../redis/client.js';

export class SyncService {
  static async getDeviceState(deviceId: string) {
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        meshGroup: {
          include: {
            devices: {
              include: { metadata: true }
            }
          }
        },
        metadata: true
      }
    });

    return {
      deviceId,
      lastSeenAt: device?.lastSeenAt,
      group: device?.meshGroup ? {
        id: device.meshGroup.id,
        name: device.meshGroup.name,
        devices: device.meshGroup.devices.map(d => ({
          deviceId: d.deviceId,
          type: d.type,
          metadata: d.metadata
        }))
      } : null,
      metadata: device?.metadata
    };
  }

  static async syncGroup(groupId: string) {
    const devices = await prisma.device.findMany({
      where: { meshGroupId: groupId },
      include: { metadata: true }
    });
    
    // Store group state in Redis for fast access
    await redis.set(`group_state:${groupId}`, JSON.stringify(devices), 'EX', 3600);
    return devices;
  }
}
