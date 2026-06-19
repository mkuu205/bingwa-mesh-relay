"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaleDeviceWorker = void 0;
const heartbeat_service_js_1 = require("../heartbeat/heartbeat.service.js");
const manager_js_1 = require("../websocket/manager.js");
const client_1 = require("@prisma/client");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
class StaleDeviceWorker {
    interval = null;
    start(intervalMs = 60000) {
        logger.info('Starting StaleDeviceWorker...');
        this.interval = setInterval(async () => {
            try {
                const staleDevices = await heartbeat_service_js_1.HeartbeatService.getStaleDevices();
                for (const device of staleDevices) {
                    logger.info({ deviceId: device.deviceId }, 'Marking device as offline due to inactivity');
                    await manager_js_1.ConnectionManager.updatePresence(device.deviceId, client_1.PresenceStatus.OFFLINE);
                }
            }
            catch (err) {
                logger.error({ err }, 'Error in StaleDeviceWorker');
            }
        }, intervalMs);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
exports.StaleDeviceWorker = StaleDeviceWorker;
//# sourceMappingURL=stale-device.worker.js.map