"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const client_js_1 = require("../database/client.js");
class DeviceService {
    static async registerDevice(data) {
        return client_js_1.prisma.device.upsert({
            where: { deviceId: data.deviceId },
            update: {
                name: data.name,
                publicKey: data.publicKey,
                lastSeenAt: new Date(),
            },
            create: {
                deviceId: data.deviceId,
                type: data.type,
                name: data.name,
                publicKey: data.publicKey,
                isTrusted: false,
            },
        });
    }
    static async getDeviceByDeviceId(deviceId) {
        return client_js_1.prisma.device.findUnique({
            where: { deviceId },
            include: { meshGroup: true },
        });
    }
    static async updateLastSeen(deviceId) {
        return client_js_1.prisma.device.update({
            where: { deviceId },
            data: { lastSeenAt: new Date() },
        });
    }
    static async setDeviceTrust(deviceId, isTrusted) {
        return client_js_1.prisma.device.update({
            where: { deviceId },
            data: { isTrusted },
        });
    }
}
exports.DeviceService = DeviceService;
//# sourceMappingURL=device.service.js.map