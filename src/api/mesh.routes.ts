import { FastifyInstance } from 'fastify';
import { MeshService } from '../mesh/mesh.service.js';
import { prisma } from '../database/client.js';

export async function meshRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) throw new Error();
      const token = authHeader.split(' ')[1];
      (request as any).user = fastify.jwt.verify(token);
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.get('/devices', async (request) => {
    return prisma.device.findMany({
      include: { metadata: true, meshGroup: true }
    });
  });

  fastify.get('/groups', async () => {
    return prisma.meshGroup.findMany({
      include: { devices: true }
    });
  });

  fastify.post('/groups', async (request) => {
    const { name } = request.body as { name: string };
    const user = (request as any).user;
    const device = await prisma.device.findUnique({ where: { deviceId: user.deviceId } });
    if (!device) throw new Error('Device not found');
    return MeshService.createGroup(name, device.id);
  });

  fastify.get('/discovery', async (request) => {
    const user = (request as any).user;
    return MeshService.discoverDevices(user.deviceId);
  });
}
