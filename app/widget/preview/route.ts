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
        background: #eef2f7;
        color: #0f172a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        overflow: hidden;
      }
      #preview-viewport {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgba(255,255,255,.9), rgba(248,250,252,.78)),
          radial-gradient(circle at 14% 16%, rgba(37,99,235,.12), transparent 28%),
          radial-gradient(circle at 86% 10%, rgba(16,185,129,.13), transparent 24%),
          #eef2f7;
      }
      .preview-shell {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
      }
      .preview-nav {
        height: 68px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 0 clamp(20px, 5vw, 64px);
        border-bottom: 1px solid rgba(15,23,42,.08);
        background: rgba(255,255,255,.78);
        backdrop-filter: blur(16px);
      }
      .preview-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
      }
      .preview-mark {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #0f172a;
      }
      .preview-links {
        display: flex;
        gap: 18px;
        color: #64748b;
        font-size: 13px;
        font-weight: 700;
      }
      .preview-main {
        width: min(1120px, calc(100% - 40px));
        margin: 0 auto;
        padding: clamp(28px, 6vh, 58px) 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
        gap: clamp(24px, 5vw, 64px);
        align-items: start;
      }
      .preview-copy {
        padding-top: 18px;
      }
      .preview-kicker {
        color: #2563eb;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      .preview-title {
        max-width: 620px;
        margin: 12px 0 14px;
        font-size: clamp(38px, 7vw, 76px);
        line-height: .94;
        font-weight: 900;
      }
      .preview-text {
        max-width: 540px;
        color: #475569;
        font-size: clamp(15px, 2vw, 18px);
        line-height: 1.65;
      }
      .preview-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 24px;
      }
      .preview-button {
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 0 16px;
        font-size: 13px;
        font-weight: 800;
      }
      .preview-button.primary {
        background: #0f172a;
        color: #fff;
      }
      .preview-button.secondary {
        border: 1px solid rgba(15,23,42,.14);
        color: #334155;
        background: rgba(255,255,255,.64);
      }
      .preview-grid {
        display: grid;
        gap: 14px;
      }
      .preview-product {
        min-height: 142px;
        border: 1px solid rgba(15,23,42,.08);
        border-radius: 20px;
        background: rgba(255,255,255,.82);
        box-shadow: 0 18px 45px rgba(15,23,42,.08);
        padding: 14px;
      }
      .preview-image {
        height: 80px;
        border-radius: 14px;
        background:
          linear-gradient(135deg, rgba(37,99,235,.18), rgba(16,185,129,.18)),
          #e2e8f0;
      }
      .preview-line {
        height: 10px;
        margin-top: 12px;
        border-radius: 999px;
        background: #cbd5e1;
      }
      .preview-line.short {
        width: 64%;
      }
      @media (max-width: 760px) {
        .preview-links {
          display: none;
        }
        .preview-main {
          grid-template-columns: 1fr;
          padding-top: 24px;
        }
        .preview-grid {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div id="preview-viewport" aria-label="Widget preview viewport">
      <main class="preview-shell" aria-hidden="true">
        <nav class="preview-nav">
          <div class="preview-brand"><span class="preview-mark"></span><span>Northstar Goods</span></div>
          <div class="preview-links"><span>Catalog</span><span>Journal</span><span>Support</span></div>
        </nav>
        <section class="preview-main">
          <div class="preview-copy">
            <div class="preview-kicker">New season</div>
            <h1 class="preview-title">Everyday tools for better work.</h1>
            <p class="preview-text">Durable essentials, refined materials, and quick answers whenever shoppers need a hand.</p>
            <div class="preview-actions">
              <span class="preview-button primary">Shop arrivals</span>
              <span class="preview-button secondary">View guide</span>
            </div>
          </div>
          <div class="preview-grid">
            <article class="preview-product"><div class="preview-image"></div><div class="preview-line"></div><div class="preview-line short"></div></article>
            <article class="preview-product"><div class="preview-image"></div><div class="preview-line"></div><div class="preview-line short"></div></article>
          </div>
        </section>
      </main>
    </div>
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
