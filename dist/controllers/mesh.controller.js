"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshController = void 0;
const client_js_1 = require("../database/client.js");
const mesh_service_js_1 = require("../mesh/mesh.service.js");
class MeshController {
    static async getDevices(request, reply) {
        const devices = await client_js_1.prisma.device.findMany({
            include: { metadata: true, meshGroup: true }
        });
        return devices;
    }
    static async getGroups(request, reply) {
        const groups = await client_js_1.prisma.meshGroup.findMany({
            include: { devices: true }
        });
        return groups;
    }
    static async createGroup(request, reply) {
        const { name, controllerId } = request.body;
        const group = await mesh_service_js_1.MeshService.createGroup(name, controllerId);
        return group;
    }
}
exports.MeshController = MeshController;
//# sourceMappingURL=mesh.controller.js.map