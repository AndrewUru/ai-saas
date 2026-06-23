import {
  createThreeAssetResponse,
  resolveThreeAsset,
} from "@/lib/widget/threeAssets";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const asset = resolveThreeAsset(url.searchParams.get("file"));

  return createThreeAssetResponse(asset);
}
