import { DeviceType } from '@prisma/client';
export declare class DeviceService {
    static registerDevice(data: {
        deviceId: string;
        type: DeviceType;
        name?: string;
        publicKey?: string;
    }): Promise<{
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
    static getDeviceByDeviceId(deviceId: string): Promise<({
        meshGroup: {
            id: string;
            name: string;
            createdAt: Date;
            controllerId: string;
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
    }) | null>;
    static updateLastSeen(deviceId: string): Promise<{
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
    static setDeviceTrust(deviceId: string, isTrusted: boolean): Promise<{
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
}
