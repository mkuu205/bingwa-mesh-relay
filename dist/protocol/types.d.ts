import { z } from 'zod';
export declare enum MessageType {
    HELLO = "HELLO",
    AUTH = "AUTH",
    PAIR_REQUEST = "PAIR_REQUEST",
    PAIR_ACCEPT = "PAIR_ACCEPT",
    PAIR_REJECT = "PAIR_REJECT",
    DISCOVERY = "DISCOVERY",
    DISCOVERY_RESPONSE = "DISCOVERY_RESPONSE",
    HEARTBEAT = "HEARTBEAT",
    ASSIGN_TRANSACTION = "ASSIGN_TRANSACTION",
    ACK = "ACK",
    EXECUTION_PROGRESS = "EXECUTION_PROGRESS",
    VERIFYING = "VERIFYING",
    VERIFIED = "VERIFIED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    EXECUTION_LOST = "EXECUTION_LOST",
    DEVICE_STATUS = "DEVICE_STATUS",
    ROUTING_UPDATE = "ROUTING_UPDATE",
    SYNC = "SYNC",
    PING = "PING",
    PONG = "PONG",
    ERROR = "ERROR",
    DISCONNECT = "DISCONNECT"
}
export declare const BaseMessageSchema: z.ZodObject<{
    protocolVersion: z.ZodString;
    messageId: z.ZodString;
    timestamp: z.ZodNumber;
    type: z.ZodNativeEnum<typeof MessageType>;
    payload: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: MessageType;
    timestamp: number;
    messageId: string;
    protocolVersion: string;
    payload?: any;
}, {
    type: MessageType;
    timestamp: number;
    messageId: string;
    protocolVersion: string;
    payload?: any;
}>;
export type BaseMessage = z.infer<typeof BaseMessageSchema>;
export declare const TransactionMessageSchema: z.ZodObject<{
    protocolVersion: z.ZodString;
    messageId: z.ZodString;
    timestamp: z.ZodNumber;
    type: z.ZodNativeEnum<typeof MessageType>;
    payload: z.ZodAny;
} & {
    transactionId: z.ZodString;
    assignmentId: z.ZodString;
    executionToken: z.ZodString;
    workerId: z.ZodString;
    controllerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: MessageType;
    timestamp: number;
    messageId: string;
    transactionId: string;
    controllerId: string;
    protocolVersion: string;
    assignmentId: string;
    executionToken: string;
    workerId: string;
    payload?: any;
}, {
    type: MessageType;
    timestamp: number;
    messageId: string;
    transactionId: string;
    controllerId: string;
    protocolVersion: string;
    assignmentId: string;
    executionToken: string;
    workerId: string;
    payload?: any;
}>;
export type TransactionMessage = z.infer<typeof TransactionMessageSchema>;
