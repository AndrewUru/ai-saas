// lib/crypto.ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const ENC_KEY = process.env.CRED_ENC_KEY!;
const KEY = scryptSync(ENC_KEY, "ai-saas-salt", 32); // 256-bit
const ALGO = "aes-256-gcm";

export function encrypt(text: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64"); // [IV||TAG||DATA]
}

export function decrypt(payload: string) {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
