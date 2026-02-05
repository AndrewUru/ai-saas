// C:\ai-saas\lib\get-current-host.ts
export type HeaderGetter = { get(name: string): string | null };

export function getCurrentHost(headersList: HeaderGetter) {
  return (
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000"
  );
}
