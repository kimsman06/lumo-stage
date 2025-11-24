const crypto = require("node:crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

const resolveEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY 환경변수가 설정되어 있지 않습니다.");
  }

  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, "hex");
  }

  if (key.length === 32) {
    return Buffer.from(key, "utf8");
  }

  throw new Error("ENCRYPTION_KEY는 32바이트 문자열 또는 64자리 hex여야 합니다.");
};

const encryptApiKey = (apiKey) => {
  if (!apiKey) {
    throw new Error("암호화할 API 키가 없습니다.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, resolveEncryptionKey(), iv);

  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptApiKey = (payload) => {
  if (!payload) {
    throw new Error("복호화할 API 키가 없습니다.");
  }

  const [ivHex, authTagHex, encryptedHex] = payload.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("암호화된 API 키 형식이 올바르지 않습니다.");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, resolveEncryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};

module.exports = {
  decryptApiKey,
  encryptApiKey
};
