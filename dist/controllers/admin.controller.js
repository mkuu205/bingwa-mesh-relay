"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_js_1 = require("../database/client.js");
const mesh_manager_service_js_1 = require("../groups/mesh-manager.service.js");
class AdminController {
    static async getStats(request, reply) {
        const [devices, groups, workers, controllers] = await Promise.all([
            client_js_1.prisma.device.count(),
            client_js_1.prisma.meshGroup.count(),
            client_js_1.prisma.device.count({ where: { type: 'WORKER' } }),
            client_js_1.prisma.device.count({ where: { type: 'CONTROLLER' } }),
        ]);
        const activeConnections = await mesh_manager_service_js_1.MeshManager.getConnectedDevicesCount();
        return {
            totalDevices: devices,
            totalGroups: groups,
            totalWorkers: workers,
            totalControllers: controllers,
            activeConnections,
            timestamp: new Date().toISOString()
        };
    }
    static async getLogs(request, reply) {
        const { limit = 50 } = request.query;
        const logs = await client_js_1.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            include: { device: true }
        });
        return logs;
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map