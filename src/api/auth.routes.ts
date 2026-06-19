import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DeviceService } from '../services/device.service.js';
import { AuthService } from '../auth/service.js';
import { DeviceType } from '@prisma/client';

const RegisterSchema = z.object({
  deviceId: z.string(),
  type: z.nativeEnum(DeviceType),
  name: z.string().optional(),
  publicKey: z.string().optional(),
});

const LoginSchema = z.object({
  deviceId: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const data = RegisterSchema.parse(request.body);
    const device = await DeviceService.registerDevice(data);
    return { success: true, device };
  });

  fastify.post('/login', async (request, reply) => {
    const { deviceId } = LoginSchema.parse(request.body);
    const device = await DeviceService.getDeviceByDeviceId(deviceId);
    
    if (!device) {
      return reply.status(401).send({ error: 'Device not registered' });
    }

    const tokens = AuthService.generateTokens({
      deviceId: device.deviceId,
      type: device.type,
    });

    await AuthService.storeRefreshToken(device.deviceId, tokens.refreshToken, tokens.jti);
    await AuthService.logAuthAction(device.deviceId, 'LOGIN', true);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  });

  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    try {
      const payload = AuthService.verifyRefreshToken(refreshToken);
      const isValid = await AuthService.isRefreshTokenValid(payload.deviceId, refreshToken);
      
      if (!isValid) {
        await AuthService.logAuthAction(payload.deviceId, 'REFRESH', false, 'Invalid refresh token');
        throw new Error('Invalid refresh token');
      }

      const tokens = AuthService.generateTokens({
        deviceId: payload.deviceId,
        type: payload.type,
      });

      await AuthService.storeRefreshToken(payload.deviceId, tokens.refreshToken, tokens.jti);
      await AuthService.logAuthAction(payload.deviceId, 'REFRESH', true);
      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }
  });
}
