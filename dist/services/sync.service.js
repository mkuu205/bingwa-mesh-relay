"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const client_js_1 = require("../database/client.js");
const client_js_2 = require("../redis/client.js");
class SyncService {
    static async getDeviceState(deviceId) {
        const device = await client_js_1.prisma.device.findUnique({
            where: { deviceId },
            include: {
                meshGroup: {
                    include: {
                        devices: {
                            include: { metadata: true }
                        }
                    }
                },
                metadata: true
            }
        });
        return {
            deviceId,
            lastSeenAt: device?.lastSeenAt,
            group: device?.meshGroup ? {
                id: device.meshGroup.id,
                name: device.meshGroup.name,
                devices: device.meshGroup.devices.map(d => ({
                    deviceId: d.deviceId,
                    type: d.type,
                    metadata: d.metadata
                }))
            } : null,
            metadata: device?.metadata
        };
    }
    static async syncGroup(groupId) {
        const devices = await client_js_1.prisma.device.findMany({
            where: { meshGroupId: groupId },
            include: { metadata: true }
        });
        // Store group state in Redis for fast access
        await client_js_2.redis.set(`group_state:${groupId}`, JSON.stringify(devices), 'EX', 3600);
        return devices;
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=sync.service.js.map