// C:\ai-saas\lib\get-current-host.ts
import type { ReadonlyHeaders } from "next/headers";

export function getCurrentHost(headersList: ReadonlyHeaders) {
  return (
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000"
  );
}
