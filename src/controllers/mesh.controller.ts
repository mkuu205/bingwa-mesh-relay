import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database/client.js';
import { MeshService } from '../mesh/mesh.service.js';

export class MeshController {
  static async getDevices(request: FastifyRequest, reply: FastifyReply) {
    const devices = await prisma.device.findMany({
      include: { metadata: true, meshGroup: true }
    });
    return devices;
  }

  static async getGroups(request: FastifyRequest, reply: FastifyReply) {
    const groups = await prisma.meshGroup.findMany({
      include: { devices: true }
    });
    return groups;
  }

  static async createGroup(request: FastifyRequest, reply: FastifyReply) {
    const { name, controllerId } = request.body as { name: string, controllerId: string };
    const group = await MeshService.createGroup(name, controllerId);
    return group;
  }
}
