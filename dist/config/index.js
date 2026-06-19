"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000').transform(Number),
    HOST: zod_1.z.string().default('0.0.0.0'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string(),
    REDIS_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string().default('1h'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    WS_PROTOCOL_VERSION: zod_1.z.string().default('1.0.0'),
});
exports.config = envSchema.parse(process.env);
//# sourceMappingURL=index.js.map