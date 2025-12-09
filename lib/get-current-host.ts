import { headers } from "next/headers";

export function getCurrentHost() {
  const h = headers();
  return h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
}
