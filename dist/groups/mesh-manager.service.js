"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshManager = void 0;
const client_js_1 = require("../database/client.js");
const client_1 = require("@prisma/client");
const client_js_2 = require("../redis/client.js");
class MeshManager {
    static async getGroupController(groupId) {
        return client_js_1.prisma.device.findFirst({
            where: { meshGroupId: groupId, type: client_1.DeviceType.CONTROLLER }
        });
    }
    static async getGroupWorkers(groupId) {
        return client_js_1.prisma.device.findMany({
            where: { meshGroupId: groupId, type: client_1.DeviceType.WORKER }
        });
    }
    static async updateDeviceStatus(deviceId, status) {
        const device = await client_js_1.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            return;
        // Update Redis presence
        await client_js_2.redis.set(`presence:${deviceId}`, status, 'EX', 300);
        // If status is a significant change, log it
        if (status === client_1.PresenceStatus.OFFLINE || status === client_1.PresenceStatus.HEARTBEAT_LOST) {
            await client_js_1.prisma.auditLog.create({
                data: {
                    deviceId: device.id,
                    action: 'STATUS_CHANGE',
                    payload: { status, timestamp: new Date().toISOString() }
                }
            });
        }
    }
    static async getConnectedDevicesCount() {
        // Count active keys in Redis for presence
        const keys = await client_js_2.redis.keys('presence:*');
        return keys.length;
    }
}
exports.MeshManager = MeshManager;
//# sourceMappingURL=mesh-manager.service.js.map