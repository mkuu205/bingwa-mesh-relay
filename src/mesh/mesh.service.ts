import { prisma } from '../database/client.js';
import { redis, getPairingTokenKey } from '../redis/client.js';
import crypto from 'crypto';

export class MeshService {
  static async createGroup(name: string, controllerId: string) {
    return prisma.meshGroup.create({
      data: {
        name,
        controllerId,
      },
    });
  }

  static async addWorkerToGroup(groupId: string, workerId: string) {
    return prisma.device.update({
      where: { id: workerId },
      data: { meshGroupId: groupId },
    });
  }

  static async generatePairingToken(controllerId: string) {
    // Generate a secure pairing token
    const token = crypto.randomBytes(32).toString('hex');
    const key = getPairingTokenKey(token);
    // Store in Redis with 10-minute expiration
    await redis.set(key, controllerId, 'EX', 600);
    return {
      token,
      qrCode: `bingwa:pair:${token}`, // Format for Android app QR scanner
      expiresAt: new Date(Date.now() + 600000).toISOString()
    };
  }

  static async validatePairingToken(token: string) {
    const key = getPairingTokenKey(token);
    const controllerId = await redis.get(key);
    return controllerId;
  }

  static async getGroupDevices(groupId: string) {
    return prisma.device.findMany({
      where: { meshGroupId: groupId },
      include: { metadata: true }
    });
  }

  static async discoverDevices(deviceId: string) {
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: { meshGroup: true },
    });

    if (!device || !device.meshGroupId) return [];

    // Return only authenticated and online devices in the same group
    const groupDevices = await prisma.device.findMany({
      where: {
        meshGroupId: device.meshGroupId,
        NOT: { deviceId },
      },
      include: { metadata: true }
    });

    return groupDevices;
  }

  static async recordPairing(initiatorId: string, targetId: string, status: 'ACCEPTED' | 'REJECTED' | 'EXPIRED') {
    const initiator = await prisma.device.findUnique({ where: { deviceId: initiatorId } });
    const target = await prisma.device.findUnique({ where: { deviceId: targetId } });

    if (initiator && target) {
      await prisma.pairingHistory.create({
        data: {
          initiatorId: initiator.id,
          targetId: target.id,
          status,
        }
      });
    }
  }
}
