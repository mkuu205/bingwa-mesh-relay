import { PresenceStatus } from '@prisma/client';
export interface HeartbeatData {
    batteryLevel?: number;
    isCharging?: boolean;
    signalStrength?: number;
    accessibility?: boolean;
    automationActive?: boolean;
    queueSize?: number;
    currentTask?: string;
    version?: string;
    latency?: number;
    status?: PresenceStatus;
}
export declare class HeartbeatService {
    static processHeartbeat(deviceId: string, data: HeartbeatData): Promise<void>;
    static getStaleDevices(thresholdSeconds?: number): Promise<{
        type: import("@prisma/client").$Enums.DeviceType;
        id: string;
        deviceId: string;
        name: string | null;
        publicKey: string | null;
        registeredAt: Date;
        lastSeenAt: Date;
        isTrusted: boolean;
        meshGroupId: string | null;
    }[]>;
}
