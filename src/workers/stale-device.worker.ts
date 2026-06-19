import { HeartbeatService } from '../heartbeat/heartbeat.service.js';
import { ConnectionManager } from '../websocket/manager.js';
import { PresenceStatus } from '@prisma/client';
import pino from 'pino';

const logger = pino();

export class StaleDeviceWorker {
  private interval: NodeJS.Timeout | null = null;

  start(intervalMs: number = 60000) {
    logger.info('Starting StaleDeviceWorker...');
    this.interval = setInterval(async () => {
      try {
        const staleDevices = await HeartbeatService.getStaleDevices();
        for (const device of staleDevices) {
          logger.info({ deviceId: device.deviceId }, 'Marking device as offline due to inactivity');
          await ConnectionManager.updatePresence(device.deviceId, PresenceStatus.OFFLINE);
        }
      } catch (err) {
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
