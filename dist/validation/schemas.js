"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatSchema = exports.MeshGroupCreateSchema = exports.DeviceRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.DeviceRegistrationSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1),
    type: zod_1.z.enum(['CONTROLLER', 'WORKER']),
    name: zod_1.z.string().optional(),
});
exports.MeshGroupCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    controllerId: zod_1.z.string().min(1),
});
exports.HeartbeatSchema = zod_1.z.object({
    batteryLevel: zod_1.z.number().min(0).max(100).optional(),
    isCharging: zod_1.z.boolean().optional(),
    signalStrength: zod_1.z.number().optional(),
    accessibility: zod_1.z.boolean().optional(),
    automationActive: zod_1.z.boolean().optional(),
    queueSize: zod_1.z.number().optional(),
    currentTask: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    latency: zod_1.z.number().optional(),
});
//# sourceMappingURL=schemas.js.map