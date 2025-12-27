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

type EncryptedPayloadJson = {
  iv: string;
  tag: string;
  data: string;
};

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

function encodePayload(iv: Buffer, tag: Buffer, data: Buffer): string {
  return Buffer.concat([iv, tag, data]).toString("base64"); // [IV||TAG||DATA]
}

function decodePayload(payload: string) {
  const trimmed = payload.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<EncryptedPayloadJson>;
      if (parsed.iv && parsed.tag && parsed.data) {
        return {
          iv: Buffer.from(parsed.iv, "base64"),
          tag: Buffer.from(parsed.tag, "base64"),
          data: Buffer.from(parsed.data, "base64"),
        };
      }
    } catch {
      // fall back to combined base64
    }
  }

  const raw = Buffer.from(trimmed, "base64");
  return {
    iv: raw.subarray(0, 12),
    tag: raw.subarray(12, 28),
    data: raw.subarray(28),
  };
}

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return encodePayload(iv, tag, enc);
}

export function decrypt(payload: string): string {
  const { iv, tag, data } = decodePayload(payload);
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
