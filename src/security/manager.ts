import { SecurityUtils } from './security.js';
import { redis } from '../redis/client.js';

export class SecurityManager {
  static async validateRequest(deviceId: string, nonce: string): Promise<boolean> {
    const key = `nonce:${deviceId}:${nonce}`;
    const exists = await redis.get(key);
    if (exists) return false;
    
    // Store nonce for 5 minutes to prevent replay
    await redis.set(key, '1', 'EX', 300);
    return true;
  }

  static async detectDuplicateSession(deviceId: string, socketId: string): Promise<boolean> {
    const key = `active_session:${deviceId}`;
    const currentSocketId = await redis.get(key);
    if (currentSocketId && currentSocketId !== socketId) {
      return true;
    }
    await redis.set(key, socketId, 'EX', 3600);
    return false;
  }
}
