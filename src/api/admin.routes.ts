import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller.js';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    const user = (request as any).user;
    if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  });

  fastify.get('/stats', AdminController.getStats);
  fastify.get('/logs', AdminController.getLogs);
  fastify.get('/events', async (request) => {
    const { limit = 50 } = request.query as { limit?: number };
    const { prisma } = await import('../database/client.js');
    return prisma.relayEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      include: { device: true }
    });
  });
}
