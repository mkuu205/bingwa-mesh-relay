import { prisma } from '../database/client.js';

export class AuditService {
  static async log(deviceId: string | null, action: string, payload: any) {
    let dbDeviceId: string | undefined;
    
    if (deviceId) {
      const device = await prisma.device.findUnique({ where: { deviceId } });
      dbDeviceId = device?.id;
    }

    return prisma.auditLog.create({
      data: {
        deviceId: dbDeviceId,
        action,
        payload,
      },
    });
  }

  static async getLogs(deviceId?: string) {
    if (deviceId) {
      const device = await prisma.device.findUnique({ where: { deviceId } });
      return prisma.auditLog.findMany({
        where: { deviceId: device?.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
