// C:\ai-saas\app\widget\preview\route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function buildScriptSrc(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  params.set("preview", "1");
  const query = params.toString();
  return `/api/widget${query ? `?${query}` : ""}`;
}

function renderPreviewHtml(scriptSrc: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Widget Preview</title>
    <style>
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e9e9e9;
        overflow: hidden;
      }
      #preview-viewport {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: #dfdfdf;
      }
    </style>
  </head>
  <body>
    <div id="preview-viewport" aria-label="Widget preview viewport"></div>
    <script async src="${scriptSrc}"></script>
  </body>
</html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scriptSrc = buildScriptSrc(url.searchParams);
  const html = renderPreviewHtml(scriptSrc);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
