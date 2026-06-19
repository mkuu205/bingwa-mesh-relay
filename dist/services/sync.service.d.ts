export declare class SyncService {
    static getDeviceState(deviceId: string): Promise<{
        deviceId: string;
        lastSeenAt: Date | undefined;
        group: {
            id: string;
            name: string;
            devices: {
                deviceId: string;
                type: import("@prisma/client").$Enums.DeviceType;
                metadata: {
                    id: string;
                    deviceId: string;
                    version: string | null;
                    batteryLevel: number | null;
                    isCharging: boolean | null;
                    signalStrength: number | null;
                    accessibility: boolean | null;
                    automationActive: boolean | null;
                    queueSize: number | null;
                    currentTask: string | null;
                    latency: number | null;
                    updatedAt: Date;
                } | null;
            }[];
        } | null;
        metadata: {
            id: string;
            deviceId: string;
            version: string | null;
            batteryLevel: number | null;
            isCharging: boolean | null;
            signalStrength: number | null;
            accessibility: boolean | null;
            automationActive: boolean | null;
            queueSize: number | null;
            currentTask: string | null;
            latency: number | null;
            updatedAt: Date;
        } | null | undefined;
    }>;
    static syncGroup(groupId: string): Promise<({
        metadata: {
            id: string;
            deviceId: string;
            version: string | null;
            batteryLevel: number | null;
            isCharging: boolean | null;
            signalStrength: number | null;
            accessibility: boolean | null;
            automationActive: boolean | null;
            queueSize: number | null;
            currentTask: string | null;
            latency: number | null;
            updatedAt: Date;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.DeviceType;
        id: string;
        deviceId: string;
        name: string | null;
        publicKey: string | null;
        registeredAt: Date;
        lastSeenAt: Date;
        isTrusted: boolean;
        meshGroupId: string | null;
    })[]>;
}
