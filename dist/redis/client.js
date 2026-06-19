"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAckCacheKey = exports.getPairingTokenKey = exports.getHeartbeatKey = exports.getPresenceKey = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_js_1 = require("../config/index.js");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
exports.redis = new ioredis_1.default(index_js_1.config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});
exports.redis.on('connect', () => logger.info('Redis connected'));
exports.redis.on('error', (err) => logger.error({ err }, 'Redis error'));
const getPresenceKey = (deviceId) => `presence:${deviceId}`;
exports.getPresenceKey = getPresenceKey;
const getHeartbeatKey = (deviceId) => `heartbeat:${deviceId}`;
exports.getHeartbeatKey = getHeartbeatKey;
const getPairingTokenKey = (token) => `pairing:${token}`;
exports.getPairingTokenKey = getPairingTokenKey;
const getAckCacheKey = (messageId) => `ack:${messageId}`;
exports.getAckCacheKey = getAckCacheKey;
//# sourceMappingURL=client.js.map