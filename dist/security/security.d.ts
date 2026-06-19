export declare class SecurityUtils {
    private static readonly ALGORITHM;
    private static readonly IV_LENGTH;
    static hash(data: string): string;
    static generateRandomToken(bytes?: number): string;
    static encrypt(text: string, key: string): string;
    static decrypt(data: string, key: string): string;
}
