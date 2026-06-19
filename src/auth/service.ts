import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { redis } from '../redis/client.js';
import { prisma } from '../database/client.js';
import pino from 'pino';

const logger = pino();

export interface TokenPayload {
  deviceId: string;
  type: string;
  jti: string; // Add JWT ID for replay protection
}

export class AuthService {
  static generateTokens(payload: Omit<TokenPayload, 'jti'>) {
    const jti = Math.random().toString(36).substring(7);
    const accessToken = jwt.sign({ ...payload, jti }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as any,
    });
    const refreshToken = jwt.sign({ ...payload, jti }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
    });
    return { accessToken, refreshToken, jti };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
  }

  static async storeRefreshToken(deviceId: string, token: string, jti: string) {
    const ttl = 7 * 24 * 60 * 60; // 7 days
    await redis.set(`refresh_token:${deviceId}`, JSON.stringify({ token, jti }), 'EX', ttl);
  }

  static async isRefreshTokenValid(deviceId: string, token: string) {
    const stored = await redis.get(`refresh_token:${deviceId}`);
    if (!stored) return false;
    const { token: storedToken } = JSON.parse(stored);
    return storedToken === token;
  }

  static async revokeRefreshToken(deviceId: string) {
    await redis.del(`refresh_token:${deviceId}`);
  }

  static async logAuthAction(deviceId: string, action: string, success: boolean, reason?: string) {
    await prisma.auditLog.create({
      data: {
        deviceId: (await prisma.device.findUnique({ where: { deviceId } }))?.id,
        action: `AUTH_${action}`,
        payload: { success, reason, timestamp: new Date().toISOString() },
      },
    });
    if (!success) {
      logger.warn({ deviceId, action, reason }, 'Authentication failure');
    }
  }

  static async isReplay(jti: string): Promise<boolean> {
    const key = `jti:${jti}`;
    const exists = await redis.get(key);
    if (exists) return true;
    await redis.set(key, '1', 'EX', 3600); // 1 hour replay window
    return false;
  }
}
