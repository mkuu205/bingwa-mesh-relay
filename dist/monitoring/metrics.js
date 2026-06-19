"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authFailuresTotal = exports.meshGroupsTotal = exports.dbQueryDuration = exports.messagesProcessedTotal = exports.wsConnectionsTotal = exports.httpRequestsTotal = exports.registry = void 0;
exports.registerMetricsRoute = registerMetricsRoute;
const prom_client_1 = require("prom-client");
exports.registry = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: exports.registry });
exports.httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.registry],
});
exports.wsConnectionsTotal = new prom_client_1.Gauge({
    name: 'ws_connections_total',
    help: 'Total number of active WebSocket connections',
    registers: [exports.registry],
});
exports.messagesProcessedTotal = new prom_client_1.Counter({
    name: 'messages_processed_total',
    help: 'Total number of WebSocket messages processed',
    labelNames: ['type'],
    registers: [exports.registry],
});
exports.dbQueryDuration = new prom_client_1.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation'],
    registers: [exports.registry],
});
exports.meshGroupsTotal = new prom_client_1.Gauge({
    name: 'mesh_groups_total',
    help: 'Total number of mesh groups',
    registers: [exports.registry],
});
exports.authFailuresTotal = new prom_client_1.Counter({
    name: 'auth_failures_total',
    help: 'Total number of authentication failures',
    labelNames: ['reason'],
    registers: [exports.registry],
});
function registerMetricsRoute(fastify) {
    fastify.get('/metrics', async (request, reply) => {
        reply.header('Content-Type', exports.registry.contentType);
        return exports.registry.metrics();
    });
    fastify.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }));
    fastify.get('/readiness', async () => ({ status: 'ready' }));
    fastify.get('/liveness', async () => ({ status: 'alive' }));
}
//# sourceMappingURL=metrics.js.map