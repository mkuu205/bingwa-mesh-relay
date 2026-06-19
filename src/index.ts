import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/index.js';
import { authRoutes } from './api/auth.routes.js';
import { adminRoutes } from './api/admin.routes.js';
import { registerMetricsRoute } from './metrics/metrics.js';
import { StaleDeviceWorker } from './workers/stale-device.worker.js';
import { meshRoutes } from './api/mesh.routes.js';
import { registerWebSocketHandler } from './websocket/handler.js';
import { ConnectionManager } from './websocket/manager.js';
import { connectDb, disconnectDb } from './database/client.js';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

const fastify = Fastify({
  logger: true,
});

// Plugins
fastify.register(cors);
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
fastify.register(jwt, {
  secret: config.JWT_SECRET,
});
fastify.register(websocket);

// Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(async (instance) => {
  registerMetricsRoute(instance);
});
fastify.register(meshRoutes, { prefix: '/api/mesh' });
fastify.register(adminRoutes, { prefix: '/api/admin' });

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));
fastify.get('/readiness', async () => ({ status: 'ready' }));
fastify.get('/liveness', async () => ({ status: 'alive' }));

// WebSocket Handler
fastify.register(async (instance) => {
  registerWebSocketHandler(instance);
});

const staleDeviceWorker = new StaleDeviceWorker();

const start = async () => {
  try {
    await connectDb();
    await ConnectionManager.init(config.REDIS_URL);
    staleDeviceWorker.start();
    await fastify.listen({ port: config.PORT, host: config.HOST });
    logger.info(`Server listening on ${config.HOST}:${config.PORT}`);
  } catch (err) {
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
  await disconnectDb();
  
  logger.info('Shutdown complete.');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
