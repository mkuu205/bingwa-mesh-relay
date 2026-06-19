"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const device_service_js_1 = require("../services/device.service.js");
const service_js_1 = require("../auth/service.js");
const client_1 = require("@prisma/client");
const RegisterSchema = zod_1.z.object({
    deviceId: zod_1.z.string(),
    type: zod_1.z.nativeEnum(client_1.DeviceType),
    name: zod_1.z.string().optional(),
    publicKey: zod_1.z.string().optional(),
});
const LoginSchema = zod_1.z.object({
    deviceId: zod_1.z.string(),
});
async function authRoutes(fastify) {
    fastify.post('/register', async (request, reply) => {
        const data = RegisterSchema.parse(request.body);
        const device = await device_service_js_1.DeviceService.registerDevice(data);
        return { success: true, device };
    });
    fastify.post('/login', async (request, reply) => {
        const { deviceId } = LoginSchema.parse(request.body);
        const device = await device_service_js_1.DeviceService.getDeviceByDeviceId(deviceId);
        if (!device) {
            return reply.status(401).send({ error: 'Device not registered' });
        }
        const tokens = service_js_1.AuthService.generateTokens({
            deviceId: device.deviceId,
            type: device.type,
        });
        await service_js_1.AuthService.storeRefreshToken(device.deviceId, tokens.refreshToken, tokens.jti);
        await service_js_1.AuthService.logAuthAction(device.deviceId, 'LOGIN', true);
        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    });
    fastify.post('/refresh', async (request, reply) => {
        const { refreshToken } = request.body;
        try {
            const payload = service_js_1.AuthService.verifyRefreshToken(refreshToken);
            const isValid = await service_js_1.AuthService.isRefreshTokenValid(payload.deviceId, refreshToken);
            if (!isValid) {
                await service_js_1.AuthService.logAuthAction(payload.deviceId, 'REFRESH', false, 'Invalid refresh token');
                throw new Error('Invalid refresh token');
            }
            const tokens = service_js_1.AuthService.generateTokens({
                deviceId: payload.deviceId,
                type: payload.type,
            });
            await service_js_1.AuthService.storeRefreshToken(payload.deviceId, tokens.refreshToken, tokens.jti);
            await service_js_1.AuthService.logAuthAction(payload.deviceId, 'REFRESH', true);
            return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
        }
        catch (err) {
            return reply.status(401).send({ error: 'Invalid refresh token' });
        }
    });
}
//# sourceMappingURL=auth.routes.js.map