"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const ws_1 = require("ws");
const client_js_1 = require("../redis/client.js");
const client_1 = require("@prisma/client");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
class ConnectionManager {
    static connections = new Map();
    static subscriber = null;
    static async init(redisUrl) {
        const Redis = (await import('ioredis')).default;
        this.subscriber = new Redis(redisUrl);
        this.subscriber.psubscribe('device_messages:*');
        this.subscriber.on('pmessage', (pattern, channel, message) => {
            const deviceId = channel.split(':')[1];
            const localWs = this.connections.get(deviceId);
            if (localWs && localWs.readyState === 1) {
                localWs.send(message);
            }
        });
    }
    static async addConnection(deviceId, ws) {
        // Handle duplicate sessions: close old one
        const existing = this.connections.get(deviceId);
        if (existing) {
            existing.close(1000, 'Duplicate session');
        }
        this.connections.set(deviceId, ws);
        await this.updatePresence(deviceId, client_1.PresenceStatus.ONLINE);
        logger.info({ deviceId }, 'Device connected');
    }
    static async removeConnection(deviceId) {
        const ws = this.connections.get(deviceId);
        if (ws) {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.close(1000, 'Connection removed');
            }
            this.connections.delete(deviceId);
        }
        await this.updatePresence(deviceId, client_1.PresenceStatus.OFFLINE);
        logger.info({ deviceId }, 'Device disconnected');
    }
    static async updatePresence(deviceId, status) {
        const key = (0, client_js_1.getPresenceKey)(deviceId);
        await client_js_1.redis.set(key, status, 'EX', 300); // 5 mins TTL
        // In a distributed setup, we would use Redis Pub/Sub here
        await client_js_1.redis.publish('presence_updates', JSON.stringify({ deviceId, status }));
    }
    static getConnection(deviceId) {
        return this.connections.get(deviceId);
    }
    static async sendMessage(deviceId, message) {
        const ws = this.connections.get(deviceId);
        if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        // If not local, we could publish to Redis for other nodes to pick up
        await client_js_1.redis.publish(`device_messages:${deviceId}`, JSON.stringify(message));
        return false;
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=manager.js.map