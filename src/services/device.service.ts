import { prisma } from '../database/client.js';
import { DeviceType } from '@prisma/client';

export class DeviceService {
  static async registerDevice(data: {
    deviceId: string;
    type: DeviceType;
    name?: string;
    publicKey?: string;
  }) {
    return prisma.device.upsert({
      where: { deviceId: data.deviceId },
      update: {
        name: data.name,
        publicKey: data.publicKey,
        lastSeenAt: new Date(),
      },
      create: {
        deviceId: data.deviceId,
        type: data.type,
        name: data.name,
        publicKey: data.publicKey,
        isTrusted: false,
      },
    });
  }

  static async getDeviceByDeviceId(deviceId: string) {
    return prisma.device.findUnique({
      where: { deviceId },
      include: { meshGroup: true },
    });
  }

  static async updateLastSeen(deviceId: string) {
    return prisma.device.update({
      where: { deviceId },
      data: { lastSeenAt: new Date() },
    });
  }

  static async setDeviceTrust(deviceId: string, isTrusted: boolean) {
    return prisma.device.update({
      where: { deviceId },
      data: { isTrusted },
    });
  }
}
