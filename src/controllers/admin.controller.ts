import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database/client.js';
import { MeshManager } from '../groups/mesh-manager.service.js';

export class AdminController {
  static async getStats(request: FastifyRequest, reply: FastifyReply) {
    const [devices, groups, workers, controllers] = await Promise.all([
      prisma.device.count(),
      prisma.meshGroup.count(),
      prisma.device.count({ where: { type: 'WORKER' } }),
      prisma.device.count({ where: { type: 'CONTROLLER' } }),
    ]);

    const activeConnections = await MeshManager.getConnectedDevicesCount();

    return {
      totalDevices: devices,
      totalGroups: groups,
      totalWorkers: workers,
      totalControllers: controllers,
      activeConnections,
      timestamp: new Date().toISOString()
    };
  }

  static async getLogs(request: FastifyRequest, reply: FastifyReply) {
    const { limit = 50 } = request.query as { limit?: number };
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      include: { device: true }
    });
    return logs;
  }
}
