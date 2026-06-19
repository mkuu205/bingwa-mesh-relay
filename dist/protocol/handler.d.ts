import { MessageType } from './types.js';
export declare class ProtocolHandler {
    private static readonly CURRENT_VERSION;
    static validateMessage(data: any): {
        type: MessageType;
        timestamp: number;
        messageId: string;
        protocolVersion: string;
        payload?: any;
    };
    static createMessage(type: MessageType, payload: any, refId?: string): {
        protocolVersion: string;
        messageId: string;
        timestamp: number;
        type: MessageType;
        payload: any;
    };
    static isTransactionMessage(type: MessageType): boolean;
}
