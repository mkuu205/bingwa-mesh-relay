"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolHandler = void 0;
const types_js_1 = require("./types.js");
class ProtocolHandler {
    static CURRENT_VERSION = '1.0.0';
    static validateMessage(data) {
        const result = types_js_1.BaseMessageSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Invalid protocol message: ${result.error.message}`);
        }
        if (result.data.protocolVersion !== this.CURRENT_VERSION) {
            // For now we only support 1.0.0, but we could handle version migration here
            // throw new Error(`Unsupported protocol version: ${result.data.protocolVersion}`);
        }
        return result.data;
    }
    static createMessage(type, payload, refId) {
        return {
            protocolVersion: this.CURRENT_VERSION,
            messageId: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            type,
            payload: refId ? { ...payload, refId } : payload,
        };
    }
    static isTransactionMessage(type) {
        const transactionTypes = [
            types_js_1.MessageType.ASSIGN_TRANSACTION,
            types_js_1.MessageType.EXECUTION_PROGRESS,
            types_js_1.MessageType.VERIFIED,
            types_js_1.MessageType.COMPLETED,
            types_js_1.MessageType.FAILED,
            types_js_1.MessageType.CANCELLED,
        ];
        return transactionTypes.includes(type);
    }
}
exports.ProtocolHandler = ProtocolHandler;
//# sourceMappingURL=handler.js.map