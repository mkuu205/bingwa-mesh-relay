import Redis from 'ioredis';
import { config } from '../config/index.js';
import pino from 'pino';

const logger = pino();

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

export const getPresenceKey = (deviceId: string) => `presence:${deviceId}`;
export const getHeartbeatKey = (deviceId: string) => `heartbeat:${deviceId}`;
export const getPairingTokenKey = (token: string) => `pairing:${token}`;
export const getAckCacheKey = (messageId: string) => `ack:${messageId}`;
