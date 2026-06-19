"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const device_service_js_1 = require("../services/device.service.js");
const client_js_1 = require("../database/client.js");
class DeviceController {
    static async getDevice(request, reply) {
        const { deviceId } = request.params;
        const device = await device_service_js_1.DeviceService.getDeviceByDeviceId(deviceId);
        if (!device)
            return reply.status(404).send({ error: 'Device not found' });
        return device;
    }
    static async getWorkers(request, reply) {
        const workers = await client_js_1.prisma.device.findMany({
            where: { type: 'WORKER' },
            include: { metadata: true }
        });
        return workers;
    }
    static async getControllers(request, reply) {
        const controllers = await client_js_1.prisma.device.findMany({
            where: { type: 'CONTROLLER' },
            include: { metadata: true }
        });
        return controllers;
    }
}
exports.DeviceController = DeviceController;
//# sourceMappingURL=device.controller.js.map