"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatService = void 0;
const client_js_1 = require("../database/client.js");
const client_js_2 = require("../redis/client.js");
const client_1 = require("@prisma/client");
class HeartbeatService {
    static async processHeartbeat(deviceId, data) {
        const key = (0, client_js_2.getHeartbeatKey)(deviceId);
        await client_js_2.redis.set(key, JSON.stringify(data), 'EX', 60); // 1 min cache
        const device = await client_js_1.prisma.device.findUnique({ where: { deviceId } });
        if (!device)
            return;
        // Update Metadata
        await client_js_1.prisma.deviceMetadata.upsert({
            where: { deviceId: device.id },
            update: {
                batteryLevel: data.batteryLevel,
                isCharging: data.isCharging,
                signalStrength: data.signalStrength,
                accessibility: data.accessibility,
                automationActive: data.automationActive,
                queueSize: data.queueSize,
                currentTask: data.currentTask,
                version: data.version,
                latency: data.latency,
            },
            create: {
                deviceId: device.id,
                batteryLevel: data.batteryLevel,
                isCharging: data.isCharging,
                signalStrength: data.signalStrength,
                accessibility: data.accessibility,
                automationActive: data.automationActive,
                queueSize: data.queueSize,
                currentTask: data.currentTask,
                version: data.version,
                latency: data.latency,
            },
        });
        // Update Presence in Redis
        const status = data.status || client_1.PresenceStatus.ONLINE;
        await client_js_2.redis.set((0, client_js_2.getPresenceKey)(deviceId), status, 'EX', 300);
        // Update last seen in DB
        await client_js_1.prisma.device.update({
            where: { id: device.id },
            data: { lastSeenAt: new Date() },
        });
    }
    static async getStaleDevices(thresholdSeconds = 300) {
        const threshold = new Date(Date.now() - thresholdSeconds * 1000);
        return client_js_1.prisma.device.findMany({
            where: {
                lastSeenAt: { lt: threshold },
                NOT: { lastSeenAt: { equals: null } }
            },
        });
    }
    static async markDeviceOffline(deviceId) {
        await client_js_1.prisma.device.update({
            where: { deviceId },
            data: { lastSeenAt: new Date() }
        });
        await client_js_2.redis.set((0, client_js_2.getPresenceKey)(deviceId), client_1.PresenceStatus.OFFLINE, 'EX', 300);
    }
}
exports.HeartbeatService = HeartbeatService;
//# sourceMappingURL=heartbeat.service.js.map