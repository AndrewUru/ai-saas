import {
  createThreeAssetResponse,
  resolveThreeAsset,
} from "@/lib/widget/threeAssets";

export const runtime = "nodejs";
export const dynamic = "force-static";

type WidgetAssetRouteContext = {
  params: Promise<{ asset: string }>;
};

export function generateStaticParams() {
  return [{ asset: "three.core.min.js" }];
}

export async function GET(_req: Request, context: WidgetAssetRouteContext) {
  const { asset } = await context.params;

  if (asset !== "three.core.min.js") {
    return new Response("Not found", { status: 404 });
  }

  return createThreeAssetResponse(resolveThreeAsset(asset));
}
