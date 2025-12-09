import { headers } from "next/headers";

export function getCurrentHost() {
  const headerList = headers();
  const getHeader = (name: string) => {
    const h = headerList as unknown as { get?: (key: string) => string | null };
    return typeof h.get === "function" ? h.get(name) : null;
  };

  return (
    getHeader("x-forwarded-host") ||
    getHeader("host") ||
    "localhost:3000"
  );
}
