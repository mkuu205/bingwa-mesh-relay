import { FastifyRequest, FastifyReply } from 'fastify';
import { DeviceService } from '../services/device.service.js';
import { prisma } from '../database/client.js';

export class DeviceController {
  static async getDevice(request: FastifyRequest, reply: FastifyReply) {
    const { deviceId } = request.params as { deviceId: string };
    const device = await DeviceService.getDeviceByDeviceId(deviceId);
    if (!device) return reply.status(404).send({ error: 'Device not found' });
    return device;
  }

  static async getWorkers(request: FastifyRequest, reply: FastifyReply) {
    const workers = await prisma.device.findMany({
      where: { type: 'WORKER' },
      include: { metadata: true }
    });
    return workers;
  }

  static async getControllers(request: FastifyRequest, reply: FastifyReply) {
    const controllers = await prisma.device.findMany({
      where: { type: 'CONTROLLER' },
      include: { metadata: true }
    });
    return controllers;
  }
}
