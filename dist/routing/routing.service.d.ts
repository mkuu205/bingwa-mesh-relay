export declare class RoutingService {
    static routeMessage(targetDeviceId: string, message: any): Promise<boolean>;
    static broadcastToGroup(groupId: string, senderDeviceId: string, message: any): Promise<void>;
}
