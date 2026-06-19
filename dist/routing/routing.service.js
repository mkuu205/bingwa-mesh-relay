"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingService = void 0;
const manager_js_1 = require("../websocket/manager.js");
const client_js_1 = require("../database/client.js");
const client_js_2 = require("../redis/client.js");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
class RoutingService {
    static async routeMessage(targetDeviceId, message) {
        // 1. Check local connections
        const delivered = await manager_js_1.ConnectionManager.sendMessage(targetDeviceId, message);
        if (delivered) {
            logger.info({ targetDeviceId, messageId: message.messageId }, 'Message delivered locally');
            return true;
        }
        // 2. Check if device is online globally (Redis)
        const presence = await client_js_2.redis.get(`presence:${targetDeviceId}`);
        if (presence && presence !== 'OFFLINE') {
            // Publish to Redis Pub/Sub for other relay nodes
            await client_js_2.redis.publish(`device_messages:${targetDeviceId}`, JSON.stringify(message));
            logger.info({ targetDeviceId, messageId: message.messageId }, 'Message routed via Pub/Sub');
            return true;
        }
        logger.warn({ targetDeviceId, messageId: message.messageId }, 'Target device offline, routing failed');
        return false;
    }
    static async broadcastToGroup(groupId, senderDeviceId, message) {
        const devices = await client_js_1.prisma.device.findMany({
            where: { meshGroupId: groupId, NOT: { deviceId: senderDeviceId } }
        });
        for (const device of devices) {
            await this.routeMessage(device.deviceId, message);
        }
    }
}
exports.RoutingService = RoutingService;
//# sourceMappingURL=routing.service.js.map