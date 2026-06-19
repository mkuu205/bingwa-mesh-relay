import { z } from 'zod';
export declare const DeviceRegistrationSchema: z.ZodObject<{
    deviceId: z.ZodString;
    type: z.ZodEnum<["CONTROLLER", "WORKER"]>;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CONTROLLER" | "WORKER";
    deviceId: string;
    name?: string | undefined;
}, {
    type: "CONTROLLER" | "WORKER";
    deviceId: string;
    name?: string | undefined;
}>;
export declare const MeshGroupCreateSchema: z.ZodObject<{
    name: z.ZodString;
    controllerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    controllerId: string;
}, {
    name: string;
    controllerId: string;
}>;
export declare const HeartbeatSchema: z.ZodObject<{
    batteryLevel: z.ZodOptional<z.ZodNumber>;
    isCharging: z.ZodOptional<z.ZodBoolean>;
    signalStrength: z.ZodOptional<z.ZodNumber>;
    accessibility: z.ZodOptional<z.ZodBoolean>;
    automationActive: z.ZodOptional<z.ZodBoolean>;
    queueSize: z.ZodOptional<z.ZodNumber>;
    currentTask: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    latency: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    version?: string | undefined;
    batteryLevel?: number | undefined;
    isCharging?: boolean | undefined;
    signalStrength?: number | undefined;
    accessibility?: boolean | undefined;
    automationActive?: boolean | undefined;
    queueSize?: number | undefined;
    currentTask?: string | undefined;
    latency?: number | undefined;
}, {
    version?: string | undefined;
    batteryLevel?: number | undefined;
    isCharging?: boolean | undefined;
    signalStrength?: number | undefined;
    accessibility?: boolean | undefined;
    automationActive?: boolean | undefined;
    queueSize?: number | undefined;
    currentTask?: string | undefined;
    latency?: number | undefined;
}>;
