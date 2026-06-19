import { FastifyRequest, FastifyReply } from 'fastify';
export declare class MeshController {
    static getDevices(request: FastifyRequest, reply: FastifyReply): Promise<({
        meshGroup: {
            id: string;
            name: string;
            createdAt: Date;
            controllerId: string;
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
    static getGroups(request: FastifyRequest, reply: FastifyReply): Promise<({
        devices: {
            type: import("@prisma/client").$Enums.DeviceType;
            id: string;
            deviceId: string;
            name: string | null;
            publicKey: string | null;
            registeredAt: Date;
            lastSeenAt: Date;
            isTrusted: boolean;
            meshGroupId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        controllerId: string;
    })[]>;
    static createGroup(request: FastifyRequest, reply: FastifyReply): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        controllerId: string;
    }>;
}
