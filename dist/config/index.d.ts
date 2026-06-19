import 'dotenv/config';
export declare const config: {
    PORT: number;
    HOST: string;
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    WS_PROTOCOL_VERSION: string;
};
