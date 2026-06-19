import { WebSocket } from 'ws';
import { PresenceStatus } from '@prisma/client';
export declare class ConnectionManager {
    private static connections;
    private static subscriber;
    static init(redisUrl: string): Promise<void>;
    static addConnection(deviceId: string, ws: WebSocket): Promise<void>;
    static removeConnection(deviceId: string): Promise<void>;
    static updatePresence(deviceId: string, status: PresenceStatus): Promise<void>;
    static getConnection(deviceId: string): WebSocket | undefined;
    static sendMessage(deviceId: string, message: any): Promise<boolean>;
}
