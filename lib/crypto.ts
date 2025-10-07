// lib/crypto.ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const SALT = "ai-saas-salt";
const ALGO = "aes-256-gcm";

let cachedKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env.CRED_ENC_KEY;
  if (!secret) {
    throw new Error(
      "Missing CRED_ENC_KEY env var. Set it to enable credential encryption."
    );
  }
  cachedKey = scryptSync(secret, SALT, 32); // 256-bit
  return cachedKey;
}

export function encrypt(text: string) {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64"); // [IV||TAG||DATA]
}

export function decrypt(payload: string) {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
