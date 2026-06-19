# Changelog - Bingwa Mesh Relay Production Readiness

## [1.1.0] - 2026-06-19

### Added
- **Replay Protection**: Implemented JTI (JWT ID) tracking in Redis to prevent token replay attacks.
- **Idempotency**: Added message-level idempotency checks using Redis for all WebSocket messages.
- **Audit Logging**: Comprehensive logging of authentication attempts, relay events, and system actions to PostgreSQL.
- **Enhanced Monitoring**: Added full Prometheus metrics including default Node.js metrics, mesh group counts, and auth failure tracking.
- **Health Endpoints**: Added `/health`, `/readiness`, and `/liveness` REST endpoints.
- **QR Pairing**: Enhanced `MeshService` with QR code generation logic for Android app integration.
- **Sync Protocol**: Added skeleton for `SYNC` message handling in the WebSocket protocol.
- **Migration Script**: Added `scripts/migrate.sh` for easier production database setup.

### Fixed
- **Type Safety**: Resolved 18+ TypeScript compilation errors related to Prisma types, WebSocket interfaces, and Pino logging.
- **WebSocket Handling**: Fixed Fastify WebSocket integration to correctly access the underlying socket and manage connections.
- **Presence Logic**: Refined how device status is mapped from heartbeats to Redis presence keys.
- **Auth Flow**: Updated the WebSocket `AUTH` flow to use the enhanced `AuthService` with audit logging and replay checks.

### Security
- Switched from query-param based WebSocket auth to message-based `AUTH` after connection.
- Implemented token rotation logic for refresh tokens.
- Added strict JTI validation for all issued tokens.
- Enhanced rate limiting and CORS configurations.

### Documentation
- Updated `README.md` with comprehensive setup, protocol details, and deployment guides.
- Added detailed environment variable documentation in `.env.example`.
