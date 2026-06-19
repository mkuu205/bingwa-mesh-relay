"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const client_js_1 = require("../database/client.js");
class AuditService {
    static async log(deviceId, action, payload) {
        let dbDeviceId;
        if (deviceId) {
            const device = await client_js_1.prisma.device.findUnique({ where: { deviceId } });
            dbDeviceId = device?.id;
        }
        return client_js_1.prisma.auditLog.create({
            data: {
                deviceId: dbDeviceId,
                action,
                payload,
            },
        });
    }
    static async getLogs(deviceId) {
        if (deviceId) {
            const device = await client_js_1.prisma.device.findUnique({ where: { deviceId } });
            return client_js_1.prisma.auditLog.findMany({
                where: { deviceId: device?.id },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
        }
        return client_js_1.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map