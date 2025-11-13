import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { getSiteHost, getSiteUrl } from "@/lib/site";
import {
  widgetDefaults,
  widgetLimits,
  sanitizeHex,
  sanitizePosition,
} from "@/lib/widget/defaults";

const ACCENT_DEFAULT = widgetDefaults.accent;
const BRAND_DEFAULT = widgetDefaults.brand;
const LABEL_DEFAULT = widgetDefaults.label;
const GREETING_DEFAULT = widgetDefaults.greeting;
const POSITION_DEFAULT = widgetDefaults.position;
const SITE_URL = getSiteUrl();
const SITE_HOST = getSiteHost(SITE_URL);

function hostFrom(h: string | null) {
  if (!h) return null;
  try {
    return new URL(h).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return { r, g, b };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = channel(r);
  const G = channel(g);
  const B = channel(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastTextColor(hex: string) {
  return relativeLuminance(hex) > 0.55 ? "#0f172a" : "#f8fafc";
}

function sanitizeText(value: string | null, fallback: string, max = 60) {
  if (!value) return fallback;
  const trimmed = value.replace(/[<>]/g, "").trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const chatEndpoint = `${url.origin}/api/agent/chat`;

  if (!key) {
    return new NextResponse("// Falta key", {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    });
  }

  const supabase = createAdmin();

  const { data: agent, error } = await supabase
    .from("agents")
    .select(
      "id, is_active, allowed_domains, widget_accent, widget_brand, widget_label, widget_greeting, widget_position",
    )
    .eq("api_key", key)
    .maybeSingle();

  if (error) {
    return new NextResponse(`// Error DB: ${error.message}`, {
      headers: { "Content-Type": "application/javascript" },
      status: 500,
    });
  }
  if (!agent) {
    return new NextResponse("// Agente no encontrado", {
      headers: { "Content-Type": "application/javascript" },
      status: 404,
    });
  }
  if (!agent.is_active) {
    return new NextResponse("// Agente inactivo", {
      headers: { "Content-Type": "application/javascript" },
      status: 403,
    });
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = hostFrom(origin) || hostFrom(referer);
  const allowed =
    Array.isArray(agent.allowed_domains) && agent.allowed_domains.length > 0
      ? agent.allowed_domains.map((d) => d.toLowerCase())
      : [];
  if (allowed.length > 0) {
    const isDashboardPreview =
      typeof host === "string" &&
      (host.includes("localhost") ||
        host.includes("dashboard") ||
        (SITE_HOST && host === SITE_HOST));

    if (!isDashboardPreview) {
      if (!host || !allowed.includes(host)) {
        return new NextResponse("Domain not allowed", {
          headers: { "Content-Type": "application/javascript" },
          status: 403,
        });
      }
    }
  }

  const accent = sanitizeHex(
    url.searchParams.get("accent") ?? agent.widget_accent ?? ACCENT_DEFAULT
  );
  const accentContrast = contrastTextColor(accent);
  const accentShadow = rgba(accent, 0.32);
  const accentLight = rgba(accent, 0.16);
  const accentGradient = `linear-gradient(135deg, ${rgba(
    accent,
    0.18
  )}, ${rgba(accent, 0.4)})`;

  const storedBrand = agent.widget_brand?.trim() || null;
  const storedLabel = agent.widget_label?.trim() || null;
  const storedGreeting = agent.widget_greeting?.trim() || null;

  const brandName = sanitizeText(
    url.searchParams.get("brand") ?? storedBrand,
    storedBrand ?? BRAND_DEFAULT,
    widgetLimits.brand
  );
  const collapsedLabel = sanitizeText(
    url.searchParams.get("label") ?? storedLabel,
    storedLabel ?? LABEL_DEFAULT,
    widgetLimits.label
  );
  const greeting = sanitizeText(
    url.searchParams.get("greeting") ?? storedGreeting,
    storedGreeting ?? GREETING_DEFAULT,
    widgetLimits.greeting
  );
  const position = sanitizePosition(
    url.searchParams.get("position") ??
      agent.widget_position ??
      POSITION_DEFAULT
  );
  const brandInitial = (brandName.charAt(0).toUpperCase() || "A").slice(0, 1);

  const styleContent = `
#ai-saas-anchor{position:fixed;bottom:18px;${
    position === "left" ? "left:18px;right:auto;" : "right:18px;left:auto;"
  }z-index:2147483000;font-family:"Inter","Helvetica Neue",Arial,sans-serif;}
#ai-saas-anchor[data-position="left"]{left:18px;right:auto;}
#ai-saas-anchor[data-position="right"]{right:18px;left:auto;}
#ai-saas-toggle{display:flex;align-items:center;gap:10px;background:${accent};color:${accentContrast};padding:12px 16px;border-radius:999px;border:none;font-weight:600;cursor:pointer;box-shadow:0 12px 32px ${accentShadow};transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease;}
#ai-saas-toggle:hover{transform:translateY(-1px);box-shadow:0 18px 38px ${accentShadow};}
#ai-saas-toggle:focus-visible{outline:2px solid #fff;outline-offset:3px;}
#ai-saas-toggle .ai-saas-icon{width:26px;height:26px;border-radius:999px;background:#ffffff;color:${accent};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;}
#ai-saas-toggle .ai-saas-label{font-size:13px;}
#ai-saas-anchor.open #ai-saas-toggle{opacity:0;transform:translateY(10px);pointer-events:none;}
#ai-saas-widget{width:360px;max-width:calc(100vw - 40px);max-height:calc(100vh - 60px);background:#0b1120;border:1px solid rgba(148,163,184,.22);border-radius:24px;overflow:hidden;box-shadow:0 28px 70px rgba(2,6,23,.5);display:flex;flex-direction:column;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s ease,transform .2s ease;}
#ai-saas-anchor.open #ai-saas-widget{opacity:1;transform:translateY(0);pointer-events:auto;}
#ai-saas-header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:${accentGradient};color:${accentContrast};}
.ai-saas-brand{display:flex;align-items:center;gap:12px;}
.ai-saas-brand-icon{width:44px;height:44px;border-radius:16px;background:${accentLight};color:${accent};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;}
.ai-saas-brand-text strong{display:block;font-size:15px;color:${accentContrast};}
.ai-saas-brand-text span{display:block;font-size:12px;opacity:.8;color:${accentContrast};}
#ai-saas-close{background:rgba(255,255,255,.24);color:${accentContrast};border:none;width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .2s ease;}
#ai-saas-close:hover{opacity:.85;}
#ai-saas-close svg{width:18px;height:18px;}
#ai-saas-chat-box{padding:18px;flex:1;overflow-y:auto;overflow-x:hidden;background:linear-gradient(180deg,rgba(15,23,42,.55) 0%,rgba(15,23,42,.82) 100%);}
#ai-saas-chat-box::-webkit-scrollbar{width:6px;}
#ai-saas-chat-box::-webkit-scrollbar-thumb{background:rgba(148,163,184,.28);border-radius:999px;}
.ai-saas-bubble{max-width:85%;padding:10px 14px;margin:6px 0;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;}
.ai-saas-bubble.user{margin-left:auto;background:${accent};color:${accentContrast};}
.ai-saas-bubble.bot{margin-right:auto;background:rgba(148,163,184,.16);color:#e2e8f0;border:1px solid rgba(148,163,184,.2);}
.ai-saas-bubble.ai-saas-error{border-color:rgba(248,113,113,.5);color:#fca5a5;}
.ai-saas-bubble.typing{display:flex;align-items:center;gap:6px;}
.ai-saas-typing{display:inline-flex;align-items:center;gap:4px;}
.ai-saas-typing span{width:6px;height:6px;border-radius:999px;background:${accent};animation:ai-saas-typing 1s infinite ease-in-out;}
.ai-saas-typing span:nth-child(2){animation-delay:.15s;}
.ai-saas-typing span:nth-child(3){animation-delay:.3s;}
@keyframes ai-saas-typing{0%,60%,100%{opacity:.25;transform:translateY(0);}30%{opacity:1;transform:translateY(-2px);}}
#ai-saas-form{padding:16px;border-top:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.85);}
.ai-saas-input-wrapper{display:flex;gap:10px;align-items:center;}
.ai-saas-input-wrapper input{flex:1;background:rgba(15,23,42,.6);color:#e2e8f0;border:1px solid rgba(148,163,184,.25);border-radius:16px;padding:12px 14px;font-size:14px;transition:border-color .2s;}
.ai-saas-input-wrapper input:focus{border-color:${accent};outline:none;}
.ai-saas-input-wrapper input::placeholder{color:rgba(148,163,184,.65);}
.ai-saas-input-wrapper button{background:${accent};color:${accentContrast};border:none;border-radius:14px;padding:10px 18px;font-weight:600;cursor:pointer;transition:opacity .2s ease,transform .2s ease;}
.ai-saas-input-wrapper button:hover{opacity:.9;}
.ai-saas-input-wrapper button:disabled{opacity:.55;cursor:not-allowed;}
.ai-saas-fallback{display:inline-flex;align-items:center;gap:6px;margin:4px 0 0;background:rgba(148,163,184,.16);color:#e2e8f0;padding:8px 12px;border-radius:12px;font-size:13px;text-decoration:none;}
.ai-saas-fallback svg{width:16px;height:16px;}
@media (max-width: 480px){#ai-saas-widget{width:calc(100vw - 32px);}}
`;

const config = {
  key,
  chatEndpoint,
  accent,
  brandName,
  brandInitial,
  collapsedLabel,
  greeting,
  position,
};

  const js = `
(function(){
  const CONFIG = ${JSON.stringify(config)};
  const STYLE = ${JSON.stringify(styleContent)};
  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();
  ready(() => {
    if (document.getElementById("ai-saas-anchor")) return;
    if (!document.getElementById("ai-saas-style")) {
      const styleTag = document.createElement("style");
      styleTag.id = "ai-saas-style";
      styleTag.textContent = STYLE;
      document.head.appendChild(styleTag);
    }

    const anchor = document.createElement("div");
    anchor.id = "ai-saas-anchor";
    anchor.dataset.position = CONFIG.position;
    document.body.appendChild(anchor);

    const toggle = document.createElement("button");
    toggle.id = "ai-saas-toggle";
    toggle.type = "button";
    toggle.innerHTML = '<span class="ai-saas-icon">' + CONFIG.brandInitial + '</span><span class="ai-saas-label">' + CONFIG.collapsedLabel + '</span>';
    anchor.appendChild(toggle);

    const widget = document.createElement("section");
    widget.id = "ai-saas-widget";
    widget.setAttribute("role", "dialog");
    widget.setAttribute("aria-label", CONFIG.brandName + " chat");
    widget.innerHTML =
      '<header id="ai-saas-header">' +
        '<div class="ai-saas-brand">' +
          '<span class="ai-saas-brand-icon">' + CONFIG.brandInitial + '</span>' +
          '<div class="ai-saas-brand-text"><strong>' + CONFIG.brandName + '</strong><span>' + CONFIG.greeting + '</span></div>' +
        '</div>' +
        '<button type="button" id="ai-saas-close" aria-label="Minimizar">' +
          '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</header>' +
      '<div id="ai-saas-chat-box" aria-live="polite"></div>' +
      '<form id="ai-saas-form">' +
        '<div class="ai-saas-input-wrapper">' +
          '<input id="ai-saas-input" type="text" placeholder="Escribe tu mensaje..." autocomplete="off" />' +
          '<button type="submit">Enviar</button>' +
        '</div>' +
      '</form>';
    anchor.appendChild(widget);
    widget.style.display = "none";

    const chatBox = widget.querySelector("#ai-saas-chat-box");
    const form = widget.querySelector("#ai-saas-form");
    const input = widget.querySelector("#ai-saas-input");
    const closeBtn = widget.querySelector("#ai-saas-close");
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!chatBox || !form || !input || !closeBtn || !submitBtn) return;

    let isSending = false;
    const defaultButtonLabel = submitBtn.textContent || "Enviar";

    let hideTimeout;

    function setSending(state){
      isSending = state;
      submitBtn.disabled = state;
      submitBtn.textContent = state ? "Enviando..." : defaultButtonLabel;
      input.disabled = state;
    }

    function openWidget(){
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      const focusInput = () => {
        setTimeout(() => {
          input.focus();
        }, 120);
      };
      if (widget.style.display !== "flex") {
        widget.style.display = "flex";
        requestAnimationFrame(() => {
          anchor.classList.add("open");
          focusInput();
        });
      } else {
        anchor.classList.add("open");
        focusInput();
      }
    }

    function closeWidget(){
      anchor.classList.remove("open");
      hideTimeout = window.setTimeout(() => {
        widget.style.display = "none";
      }, 220);
    }

    toggle.addEventListener("click", openWidget);
    closeBtn.addEventListener("click", closeWidget);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && anchor.classList.contains("open")) {
        closeWidget();
      }
    });

    function appendBubble(content, role){
      const bubble = document.createElement("div");
      bubble.className = "ai-saas-bubble " + role;
      bubble.textContent = content;
      chatBox.appendChild(bubble);
      chatBox.scrollTop = chatBox.scrollHeight;
      return bubble;
    }

    function appendTyping(){
      const bubble = document.createElement("div");
      bubble.className = "ai-saas-bubble bot typing";
      bubble.innerHTML = '<div class="ai-saas-typing"><span></span><span></span><span></span></div>';
      chatBox.appendChild(bubble);
      chatBox.scrollTop = chatBox.scrollHeight;
      return bubble;
    }

    function showFallback(url){
      if (!url) return;
      try{
        const link = document.createElement("a");
        link.className = "ai-saas-fallback";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-4a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 00-1 1v3a1 1 0 002 0v-3a1 1 0 00-1-1z" fill="currentColor"/></svg><span>Hablar con una persona</span>';
        chatBox.appendChild(link);
        chatBox.scrollTop = chatBox.scrollHeight;
      }catch(err){
        console.error("[AI SaaS] fallback link error", err);
      }
    }

    form.addEventListener("submit", async function(event){
      event.preventDefault();
      if (isSending) return;

      const value = input.value.trim();
      if (!value) return;

      appendBubble(value, "user");
      input.value = "";
      setSending(true);

      const typingBubble = appendTyping();

      try{
        const response = await fetch(CONFIG.chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: CONFIG.key, message: value })
        });

        const data = await response.json().catch(() => ({}));

        typingBubble.classList.remove("typing");

        if (response.ok && data.reply) {
          typingBubble.textContent = data.reply;
        } else {
          typingBubble.textContent = data.error || "No fue posible obtener una respuesta.";
          typingBubble.classList.add("ai-saas-error");
          if (data.fallback_url) {
            showFallback(data.fallback_url);
          }
        }
      } catch (err){
        console.error("[AI SaaS] fetch error", err);
        typingBubble.classList.remove("typing");
        typingBubble.textContent = "Error conectando con el agente.";
        typingBubble.classList.add("ai-saas-error");
      } finally {
        setSending(false);
        input.focus();
      }
    });

    window.aiSaasWidget = {
      open: openWidget,
      close: closeWidget,
    };
  });
})();
`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}
