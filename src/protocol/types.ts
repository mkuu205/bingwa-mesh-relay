import { z } from 'zod';

export enum MessageType {
  HELLO = 'HELLO',

  AUTH = 'AUTH',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILED = 'AUTH_FAILED',

  PAIR_REQUEST = 'PAIR_REQUEST',
  PAIR_ACCEPT = 'PAIR_ACCEPT',
  PAIR_REJECT = 'PAIR_REJECT',

  DISCOVERY = 'DISCOVERY',
  DISCOVERY_RESPONSE = 'DISCOVERY_RESPONSE',

  HEARTBEAT = 'HEARTBEAT',

  ASSIGN_TRANSACTION = 'ASSIGN_TRANSACTION',

  ACK = 'ACK',

  EXECUTION_PROGRESS = 'EXECUTION_PROGRESS',
  VERIFYING = 'VERIFYING',
  VERIFIED = 'VERIFIED',

  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',

  EXECUTION_LOST = 'EXECUTION_LOST',

  DEVICE_STATUS = 'DEVICE_STATUS',

  ROUTING_UPDATE = 'ROUTING_UPDATE',

  SYNC = 'SYNC',

  PING = 'PING',
  PONG = 'PONG',

  ERROR = 'ERROR',

  DISCONNECT = 'DISCONNECT',
}

export const BaseMessageSchema = z.object({
  protocolVersion: z.string(),
  messageId: z.string(),
  timestamp: z.number(),

  type: z.nativeEnum(MessageType),

  senderId: z.string(),

  targetId: z.string().optional(),

  payload: z.any(),

  signature: z.string().optional(),

  transactionId: z.string().optional(),

  assignmentId: z.string().optional(),

  workerId: z.string().optional(),

  controllerId: z.string().optional(),
});

export type BaseMessage = z.infer<typeof BaseMessageSchema>;

export const TransactionMessageSchema = BaseMessageSchema.extend({
  transactionId: z.string(),
  assignmentId: z.string(),
  executionToken: z.string(),
  workerId: z.string(),
  controllerId: z.string(),
});

export type TransactionMessage = z.infer<typeof TransactionMessageSchema>;
