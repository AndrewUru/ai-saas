import { randomBytes } from "node:crypto";

export function generateAgentApiKey() {
  return `agt_${randomBytes(24).toString("base64url")}`;
}
