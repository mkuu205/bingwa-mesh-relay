# Bingwa Mesh Cloud Relay Server

Production-ready Cloud Relay Server for Bingwa Mesh Android devices. This server facilitates secure, real-time communication between Controller and Worker devices in a mesh network.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with Refresh Token rotation and Replay protection.
- **WebSocket Protocol**: Custom protocol supporting `HELLO`, `AUTH`, `DISCOVERY`, `PAIRING`, `HEARTBEATS`, and `TRANSACTIONS`.
- **Distributed Safety**: Idempotency checks and message forwarding with delivery guarantees.
- **Presence Management**: Real-time tracking of device status (Online, Offline, Busy, etc.).
- **Monitoring & Metrics**: Integrated Prometheus metrics, health/readiness/liveness endpoints, and structured logging.
- **Production Deployment**: Optimized Docker containers and ready-to-use Render deployment configuration.

## 🛠 Tech Stack

- **Runtime**: Node.js LTS (v22)
- **Language**: TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Pub/Sub**: Redis
- **Security**: JWT, Zod validation, Replay protection
- **Monitoring**: Prometheus, Pino

## 📦 Installation & Setup

### Prerequisites

- Node.js v22+
- Docker & Docker Compose
- PostgreSQL & Redis (if not using Docker)

### Local Development

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Update .env with your local database and redis credentials
   ```

3. **Infrastructure**:
   ```bash
   docker compose up -d postgres redis
   ```

4. **Database Migration**:
   ```bash
   npx prisma migrate dev
   ```

5. **Run**:
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

To run the entire stack (Relay + DB + Redis) using Docker:

```bash
docker compose up --build -d
```

The server will be available at `http://localhost:3000`.

## ☁️ Render Deployment

This project is pre-configured for [Render](https://render.com).

1. Connect your GitHub repository to Render.
2. Render will automatically detect the `render.yaml` file.
3. Provisioning of the Web Service, PostgreSQL database, and Redis instance will happen automatically.
4. Ensure environment variables are correctly set in the Render dashboard.

## 📖 Documentation

### WebSocket Protocol

Connect to `/ws`. Authentication is required via an `AUTH` message immediately after connection.

**Message Format**:
```json
{
  "protocolVersion": "1.0.0",
  "messageId": "unique-uuid",
  "timestamp": 1625097600000,
  "type": "MESSAGE_TYPE",
  "payload": { ... }
}
```

### REST API

- `POST /api/auth/register`: Device registration.
- `POST /api/auth/login`: Authentication and token issuance.
- `POST /api/auth/refresh`: Token rotation.
- `GET /api/mesh/devices`: List registered devices.
- `GET /api/mesh/groups`: List mesh groups.
- `GET /metrics`: Prometheus metrics.
- `GET /health`: Service health status.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📜 License

MIT
