"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meshRoutes = meshRoutes;
const mesh_service_js_1 = require("../mesh/mesh.service.js");
const client_js_1 = require("../database/client.js");
async function meshRoutes(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader)
                throw new Error();
            const token = authHeader.split(' ')[1];
            request.user = fastify.jwt.verify(token);
        }
        catch (err) {
            reply.status(401).send({ error: 'Unauthorized' });
        }
    });
    fastify.get('/devices', async (request) => {
        return client_js_1.prisma.device.findMany({
            include: { metadata: true, meshGroup: true }
        });
    });
    fastify.get('/groups', async () => {
        return client_js_1.prisma.meshGroup.findMany({
            include: { devices: true }
        });
    });
    fastify.post('/groups', async (request) => {
        const { name } = request.body;
        const user = request.user;
        const device = await client_js_1.prisma.device.findUnique({ where: { deviceId: user.deviceId } });
        if (!device)
            throw new Error('Device not found');
        return mesh_service_js_1.MeshService.createGroup(name, device.id);
    });
    fastify.get('/discovery', async (request) => {
        const user = request.user;
        return mesh_service_js_1.MeshService.discoverDevices(user.deviceId);
    });
}
//# sourceMappingURL=mesh.routes.js.map