"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hashSecret = hashSecret;
exports.generateHmac = generateHmac;
exports.generateToken = generateToken;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
function getKey(secret, salt) {
    return crypto_1.default.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
}
function encrypt(plaintext, secret) {
    const key = secret ?? process.env.ENCRYPTION_KEY ?? 'fallback-key-32-chars-minimum!!';
    const salt = crypto_1.default.randomBytes(SALT_LENGTH);
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const derivedKey = getKey(key, salt);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, derivedKey, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}
function decrypt(ciphertext, secret) {
    const key = secret ?? process.env.ENCRYPTION_KEY ?? 'fallback-key-32-chars-minimum!!';
    const data = Buffer.from(ciphertext, 'base64');
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const derivedKey = getKey(key, salt);
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final('utf8');
}
function hashSecret(secret) {
    return crypto_1.default.createHash('sha256').update(secret).digest('hex');
}
function generateHmac(payload, secret) {
    return crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
}
function generateToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
