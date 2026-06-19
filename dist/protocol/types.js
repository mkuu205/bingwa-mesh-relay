"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMessageSchema = exports.BaseMessageSchema = exports.MessageType = void 0;
const zod_1 = require("zod");
var MessageType;
(function (MessageType) {
    MessageType["HELLO"] = "HELLO";
    MessageType["AUTH"] = "AUTH";
    MessageType["PAIR_REQUEST"] = "PAIR_REQUEST";
    MessageType["PAIR_ACCEPT"] = "PAIR_ACCEPT";
    MessageType["PAIR_REJECT"] = "PAIR_REJECT";
    MessageType["DISCOVERY"] = "DISCOVERY";
    MessageType["DISCOVERY_RESPONSE"] = "DISCOVERY_RESPONSE";
    MessageType["HEARTBEAT"] = "HEARTBEAT";
    MessageType["ASSIGN_TRANSACTION"] = "ASSIGN_TRANSACTION";
    MessageType["ACK"] = "ACK";
    MessageType["EXECUTION_PROGRESS"] = "EXECUTION_PROGRESS";
    MessageType["VERIFYING"] = "VERIFYING";
    MessageType["VERIFIED"] = "VERIFIED";
    MessageType["COMPLETED"] = "COMPLETED";
    MessageType["FAILED"] = "FAILED";
    MessageType["CANCELLED"] = "CANCELLED";
    MessageType["EXECUTION_LOST"] = "EXECUTION_LOST";
    MessageType["DEVICE_STATUS"] = "DEVICE_STATUS";
    MessageType["ROUTING_UPDATE"] = "ROUTING_UPDATE";
    MessageType["SYNC"] = "SYNC";
    MessageType["PING"] = "PING";
    MessageType["PONG"] = "PONG";
    MessageType["ERROR"] = "ERROR";
    MessageType["DISCONNECT"] = "DISCONNECT";
})(MessageType || (exports.MessageType = MessageType = {}));
exports.BaseMessageSchema = zod_1.z.object({
    protocolVersion: zod_1.z.string(),
    messageId: zod_1.z.string(),
    timestamp: zod_1.z.number(),
    type: zod_1.z.nativeEnum(MessageType),
    payload: zod_1.z.any(),
});
exports.TransactionMessageSchema = exports.BaseMessageSchema.extend({
    transactionId: zod_1.z.string(),
    assignmentId: zod_1.z.string(),
    executionToken: zod_1.z.string(),
    workerId: zod_1.z.string(),
    controllerId: zod_1.z.string(),
});
//# sourceMappingURL=types.js.map