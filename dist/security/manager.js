"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = void 0;
const client_js_1 = require("../redis/client.js");
class SecurityManager {
    static async validateRequest(deviceId, nonce) {
        const key = `nonce:${deviceId}:${nonce}`;
        const exists = await client_js_1.redis.get(key);
        if (exists)
            return false;
        // Store nonce for 5 minutes to prevent replay
        await client_js_1.redis.set(key, '1', 'EX', 300);
        return true;
    }
    static async detectDuplicateSession(deviceId, socketId) {
        const key = `active_session:${deviceId}`;
        const currentSocketId = await client_js_1.redis.get(key);
        if (currentSocketId && currentSocketId !== socketId) {
            return true;
        }
        await client_js_1.redis.set(key, socketId, 'EX', 3600);
        return false;
    }
}
exports.SecurityManager = SecurityManager;
//# sourceMappingURL=manager.js.map