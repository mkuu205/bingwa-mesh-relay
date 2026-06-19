"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const index_js_1 = require("./config/index.js");
const auth_routes_js_1 = require("./api/auth.routes.js");
const admin_routes_js_1 = require("./api/admin.routes.js");
const metrics_js_1 = require("./metrics/metrics.js");
const stale_device_worker_js_1 = require("./workers/stale-device.worker.js");
const mesh_routes_js_1 = require("./api/mesh.routes.js");
const handler_js_1 = require("./websocket/handler.js");
const manager_js_1 = require("./websocket/manager.js");
const client_js_1 = require("./database/client.js");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({
    transport: {
        target: 'pino-pretty',
    },
});
const fastify = (0, fastify_1.default)({
    logger: true,
});
// Plugins
fastify.register(cors_1.default);
fastify.register(rate_limit_1.default, {
    max: 100,
    timeWindow: '1 minute',
});
fastify.register(jwt_1.default, {
    secret: index_js_1.config.JWT_SECRET,
});
fastify.register(websocket_1.default);
// Routes
fastify.register(auth_routes_js_1.authRoutes, { prefix: '/api/auth' });
fastify.register(async (instance) => {
    (0, metrics_js_1.registerMetricsRoute)(instance);
});
fastify.register(mesh_routes_js_1.meshRoutes, { prefix: '/api/mesh' });
fastify.register(admin_routes_js_1.adminRoutes, { prefix: '/api/admin' });
// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));
fastify.get('/ready', async () => ({ status: 'ready' }));
fastify.get('/live', async () => ({ status: 'alive' }));
// WebSocket Handler
fastify.register(async (instance) => {
    (0, handler_js_1.registerWebSocketHandler)(instance);
});
const staleDeviceWorker = new stale_device_worker_js_1.StaleDeviceWorker();
const start = async () => {
    try {
        await (0, client_js_1.connectDb)();
        await manager_js_1.ConnectionManager.init(index_js_1.config.REDIS_URL);
        staleDeviceWorker.start();
        await fastify.listen({ port: index_js_1.config.PORT, host: index_js_1.config.HOST });
        logger.info(`Server listening on ${index_js_1.config.HOST}:${index_js_1.config.PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
// Graceful shutdown
const shutdown = async () => {
    logger.info('Shutting down server...');
    // 1. Stop workers
    staleDeviceWorker.stop();
    // 2. Close Fastify (stops accepting new connections)
    await fastify.close();
    // 3. Close DB and Redis
    const { redis } = await import('./redis/client.js');
    await redis.quit();
    await (0, client_js_1.disconnectDb)();
    logger.info('Shutdown complete.');
    process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
start();
//# sourceMappingURL=index.js.map