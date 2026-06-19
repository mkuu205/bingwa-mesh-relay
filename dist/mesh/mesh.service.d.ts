export declare class MeshService {
    static createGroup(name: string, controllerId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        controllerId: string;
    }>;
    static addWorkerToGroup(groupId: string, workerId: string): Promise<{
        type: import("@prisma/client").$Enums.DeviceType;
        id: string;
        deviceId: string;
        name: string | null;
        publicKey: string | null;
        registeredAt: Date;
        lastSeenAt: Date;
        isTrusted: boolean;
        meshGroupId: string | null;
    }>;
    static generatePairingToken(controllerId: string): Promise<{
        token: string;
        qrCode: string;
        expiresAt: string;
    }>;
    static validatePairingToken(token: string): Promise<string | null>;
    static getGroupDevices(groupId: string): Promise<({
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
    static discoverDevices(deviceId: string): Promise<({
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
    static recordPairing(initiatorId: string, targetId: string, status: 'ACCEPTED' | 'REJECTED' | 'EXPIRED'): Promise<void>;
}
