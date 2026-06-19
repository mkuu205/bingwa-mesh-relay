"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const client_js_1 = require("../redis/client.js");
const client_js_2 = require("../database/client.js");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
class AuthService {
    static generateTokens(payload) {
        const jti = Math.random().toString(36).substring(7);
        const accessToken = jsonwebtoken_1.default.sign({ ...payload, jti }, index_js_1.config.JWT_SECRET, {
            expiresIn: index_js_1.config.JWT_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ ...payload, jti }, index_js_1.config.JWT_REFRESH_SECRET, {
            expiresIn: index_js_1.config.JWT_REFRESH_EXPIRES_IN,
        });
        return { accessToken, refreshToken, jti };
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, index_js_1.config.JWT_SECRET);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, index_js_1.config.JWT_REFRESH_SECRET);
    }
    static async storeRefreshToken(deviceId, token, jti) {
        const ttl = 7 * 24 * 60 * 60; // 7 days
        await client_js_1.redis.set(`refresh_token:${deviceId}`, JSON.stringify({ token, jti }), 'EX', ttl);
    }
    static async isRefreshTokenValid(deviceId, token) {
        const stored = await client_js_1.redis.get(`refresh_token:${deviceId}`);
        if (!stored)
            return false;
        const { token: storedToken } = JSON.parse(stored);
        return storedToken === token;
    }
    static async revokeRefreshToken(deviceId) {
        await client_js_1.redis.del(`refresh_token:${deviceId}`);
    }
    static async logAuthAction(deviceId, action, success, reason) {
        await client_js_2.prisma.auditLog.create({
            data: {
                deviceId: (await client_js_2.prisma.device.findUnique({ where: { deviceId } }))?.id,
                action: `AUTH_${action}`,
                payload: { success, reason, timestamp: new Date().toISOString() },
            },
        });
        if (!success) {
            logger.warn({ deviceId, action, reason }, 'Authentication failure');
        }
    }
    static async isReplay(jti) {
        const key = `jti:${jti}`;
        const exists = await client_js_1.redis.get(key);
        if (exists)
            return true;
        await client_js_1.redis.set(key, '1', 'EX', 3600); // 1 hour replay window
        return false;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map