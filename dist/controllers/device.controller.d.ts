import { FastifyRequest, FastifyReply } from 'fastify';
export declare class DeviceController {
    static getDevice(request: FastifyRequest, reply: FastifyReply): Promise<{
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
    }>;
    static getWorkers(request: FastifyRequest, reply: FastifyReply): Promise<({
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
    static getControllers(request: FastifyRequest, reply: FastifyReply): Promise<({
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
