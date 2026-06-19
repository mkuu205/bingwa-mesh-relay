import { MessageType, BaseMessageSchema } from './types.js';
import { z } from 'zod';

export class ProtocolHandler {
  private static readonly CURRENT_VERSION = '1.0.0';

  static validateMessage(data: any) {
    const result = BaseMessageSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid protocol message: ${result.error.message}`);
    }
    
    if (result.data.protocolVersion !== this.CURRENT_VERSION) {
      // For now we only support 1.0.0, but we could handle version migration here
      // throw new Error(`Unsupported protocol version: ${result.data.protocolVersion}`);
    }

    return result.data;
  }

  static createMessage(type: MessageType, payload: any, refId?: string) {
    return {
      protocolVersion: this.CURRENT_VERSION,
      messageId: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type,
      payload: refId ? { ...payload, refId } : payload,
    };
  }

  static isTransactionMessage(type: MessageType): boolean {
    const transactionTypes = [
      MessageType.ASSIGN_TRANSACTION,
      MessageType.EXECUTION_PROGRESS,
      MessageType.VERIFIED,
      MessageType.COMPLETED,
      MessageType.FAILED,
      MessageType.CANCELLED,
    ];
    return transactionTypes.includes(type);
  }
}
