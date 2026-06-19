"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
class SecurityUtils {
    static ALGORITHM = 'aes-256-gcm';
    static IV_LENGTH = 12;
    static hash(data) {
        return crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
    static generateRandomToken(bytes = 32) {
        return crypto_1.default.randomBytes(bytes).toString('hex');
    }
    static encrypt(text, key) {
        const iv = crypto_1.default.randomBytes(this.IV_LENGTH);
        const cipher = crypto_1.default.createCipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }
    static decrypt(data, key) {
        const [ivHex, authTagHex, encryptedText] = data.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.SecurityUtils = SecurityUtils;
//# sourceMappingURL=security.js.map