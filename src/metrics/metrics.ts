import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';
import { FastifyInstance } from 'fastify';

export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

export const wsConnectionsTotal = new Gauge({
  name: 'ws_connections_total',
  help: 'Total number of active WebSocket connections',
  registers: [registry],
});

export const messagesProcessedTotal = new Counter({
  name: 'messages_processed_total',
  help: 'Total number of WebSocket messages processed',
  labelNames: ['type'],
  registers: [registry],
});

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  registers: [registry],
});

export const meshGroupsTotal = new Gauge({
  name: 'mesh_groups_total',
  help: 'Total number of mesh groups',
  registers: [registry],
});

export const authFailuresTotal = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['reason'],
  registers: [registry],
});

export function registerMetricsRoute(fastify: FastifyInstance) {
  fastify.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', registry.contentType);
    return registry.metrics();
  });
}
