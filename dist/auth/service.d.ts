export interface TokenPayload {
    deviceId: string;
    type: string;
    jti: string;
}
export declare class AuthService {
    static generateTokens(payload: Omit<TokenPayload, 'jti'>): {
        accessToken: string;
        refreshToken: string;
        jti: string;
    };
    static verifyAccessToken(token: string): TokenPayload;
    static verifyRefreshToken(token: string): TokenPayload;
    static storeRefreshToken(deviceId: string, token: string, jti: string): Promise<void>;
    static isRefreshTokenValid(deviceId: string, token: string): Promise<boolean>;
    static revokeRefreshToken(deviceId: string): Promise<void>;
    static logAuthAction(deviceId: string, action: string, success: boolean, reason?: string): Promise<void>;
    static isReplay(jti: string): Promise<boolean>;
}
