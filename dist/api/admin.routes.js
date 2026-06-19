"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = adminRoutes;
const admin_controller_js_1 = require("../controllers/admin.controller.js");
async function adminRoutes(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        const user = request.user;
        if (!user)
            return reply.status(401).send({ error: 'Unauthorized' });
    });
    fastify.get('/stats', admin_controller_js_1.AdminController.getStats);
    fastify.get('/logs', admin_controller_js_1.AdminController.getLogs);
    fastify.get('/events', async (request) => {
        const { limit = 50 } = request.query;
        const { prisma } = await import('../database/client.js');
        return prisma.relayEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            include: { device: true }
        });
    });
}
//# sourceMappingURL=admin.routes.js.map