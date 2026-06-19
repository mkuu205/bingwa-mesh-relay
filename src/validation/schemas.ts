import { z } from 'zod';

export const DeviceRegistrationSchema = z.object({
  deviceId: z.string().min(1),
  type: z.enum(['CONTROLLER', 'WORKER']),
  name: z.string().optional(),
});

export const MeshGroupCreateSchema = z.object({
  name: z.string().min(1),
  controllerId: z.string().min(1),
});

export const HeartbeatSchema = z.object({
  batteryLevel: z.number().min(0).max(100).optional(),
  isCharging: z.boolean().optional(),
  signalStrength: z.number().optional(),
  accessibility: z.boolean().optional(),
  automationActive: z.boolean().optional(),
  queueSize: z.number().optional(),
  currentTask: z.string().optional(),
  version: z.string().optional(),
  latency: z.number().optional(),
});
