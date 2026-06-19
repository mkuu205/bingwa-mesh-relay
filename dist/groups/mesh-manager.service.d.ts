import { PresenceStatus } from '@prisma/client';
export declare class MeshManager {
    static getGroupController(groupId: string): Promise<{
        type: import("@prisma/client").$Enums.DeviceType;
        id: string;
        deviceId: string;
        name: string | null;
        publicKey: string | null;
        registeredAt: Date;
        lastSeenAt: Date;
        isTrusted: boolean;
        meshGroupId: string | null;
    } | null>;
    static getGroupWorkers(groupId: string): Promise<{
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
    static updateDeviceStatus(deviceId: string, status: PresenceStatus): Promise<void>;
    static getConnectedDevicesCount(): Promise<number>;
}
