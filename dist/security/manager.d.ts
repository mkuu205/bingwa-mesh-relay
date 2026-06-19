export declare class SecurityManager {
    static validateRequest(deviceId: string, nonce: string): Promise<boolean>;
    static detectDuplicateSession(deviceId: string, socketId: string): Promise<boolean>;
}
