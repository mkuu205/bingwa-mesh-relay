export declare class AuditService {
    static log(deviceId: string | null, action: string, payload: any): Promise<{
        id: string;
        deviceId: string | null;
        action: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
    static getLogs(deviceId?: string): Promise<{
        id: string;
        deviceId: string | null;
        action: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
}
