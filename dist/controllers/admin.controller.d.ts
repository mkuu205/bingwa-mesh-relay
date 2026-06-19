import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminController {
    static getStats(request: FastifyRequest, reply: FastifyReply): Promise<{
        totalDevices: number;
        totalGroups: number;
        totalWorkers: number;
        totalControllers: number;
        activeConnections: number;
        timestamp: string;
    }>;
    static getLogs(request: FastifyRequest, reply: FastifyReply): Promise<({
        device: {
            type: import("@prisma/client").$Enums.DeviceType;
            id: string;
            deviceId: string;
            name: string | null;
            publicKey: string | null;
            registeredAt: Date;
            lastSeenAt: Date;
            isTrusted: boolean;
            meshGroupId: string | null;
        } | null;
    } & {
        id: string;
        deviceId: string | null;
        action: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    })[]>;
}
