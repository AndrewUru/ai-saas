import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const THREE_BUILD_DIR = path.join(process.cwd(), "node_modules", "three", "build");
const CORE_IMPORT_SPECIFIER = "./three.core.min.js";
const CORE_ENDPOINT = "/api/widget/three.core.min.js";

const assetFiles = {
  module: "three.module.min.js",
  core: "three.core.min.js",
} as const;

type ThreeAsset = keyof typeof assetFiles;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=31536000, immutable",
  "Content-Type": "application/javascript; charset=utf-8",
};

export function resolveThreeAsset(value: string | null | undefined): ThreeAsset {
  return value === assetFiles.core || value === "core" ? "core" : "module";
}

export async function getThreeAssetSource(asset: ThreeAsset) {
  const fileName = assetFiles[asset];
  const source = await readFile(path.join(THREE_BUILD_DIR, fileName), "utf8");

  if (asset === "module") {
    return source.replaceAll(CORE_IMPORT_SPECIFIER, CORE_ENDPOINT);
  }

  return source;
}

export async function createThreeAssetResponse(asset: ThreeAsset) {
  try {
    const source = await getThreeAssetSource(asset);

    return new NextResponse(source, { headers });
  } catch {
    return new NextResponse("// Three.js module not available", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/javascript; charset=utf-8",
      },
      status: 404,
    });
  }
}
