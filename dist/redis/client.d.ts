import Redis from 'ioredis';
export declare const redis: Redis;
export declare const getPresenceKey: (deviceId: string) => string;
export declare const getHeartbeatKey: (deviceId: string) => string;
export declare const getPairingTokenKey: (token: string) => string;
export declare const getAckCacheKey: (messageId: string) => string;
