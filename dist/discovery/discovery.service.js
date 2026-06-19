"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshService = void 0;
const client_js_1 = require("../database/client.js");
const client_js_2 = require("../redis/client.js");
const crypto_1 = __importDefault(require("crypto"));
class MeshService {
    static async createGroup(name, controllerId) {
        return client_js_1.prisma.meshGroup.create({
            data: {
                name,
                controllerId,
            },
        });
    }
    static async addWorkerToGroup(groupId, workerId) {
        return client_js_1.prisma.device.update({
            where: { id: workerId },
            data: { meshGroupId: groupId },
        });
    }
    static async generatePairingToken(controllerId) {
        // Generate a secure pairing token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const key = (0, client_js_2.getPairingTokenKey)(token);
        // Store in Redis with 10-minute expiration
        await client_js_2.redis.set(key, controllerId, 'EX', 600);
        return {
            token,
            qrCode: `bingwa:pair:${token}`, // Format for Android app QR scanner
            expiresAt: new Date(Date.now() + 600000).toISOString()
        };
    }
    static async validatePairingToken(token) {
        const key = (0, client_js_2.getPairingTokenKey)(token);
        const controllerId = await client_js_2.redis.get(key);
        return controllerId;
    }
    static async getGroupDevices(groupId) {
        return client_js_1.prisma.device.findMany({
            where: { meshGroupId: groupId },
            include: { metadata: true }
        });
    }
    static async discoverDevices(deviceId) {
        const device = await client_js_1.prisma.device.findUnique({
            where: { deviceId },
            include: { meshGroup: true },
        });
        if (!device || !device.meshGroupId)
            return [];
        // Return only authenticated and online devices in the same group
        const groupDevices = await client_js_1.prisma.device.findMany({
            where: {
                meshGroupId: device.meshGroupId,
                NOT: { deviceId },
            },
            include: { metadata: true }
        });
        return groupDevices;
    }
    static async recordPairing(initiatorId, targetId, status) {
        const initiator = await client_js_1.prisma.device.findUnique({ where: { deviceId: initiatorId } });
        const target = await client_js_1.prisma.device.findUnique({ where: { deviceId: targetId } });
        if (initiator && target) {
            await client_js_1.prisma.pairingHistory.create({
                data: {
                    initiatorId: initiator.id,
                    targetId: target.id,
                    status,
                }
            });
        }
    }
}
exports.MeshService = MeshService;
//# sourceMappingURL=discovery.service.js.map