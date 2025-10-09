import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

// ---------------------------------------------------------------
// Utilidades
function extractHostFromHeader(headerValue: string | null): string | null {
  if (!headerValue) return null;
  try {
    const url = new URL(headerValue);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// Handler principal GET /widget?key=AGT_XXXX
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return new NextResponse("// Falta la API key del agente", {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    });
  }

  const supabase = await createServer();

  // Buscar el agente por su API key
  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, is_active, allowed_domains, messages_limit")
    .eq("api_key", apiKey)
    .single();

  if (error || !agent) {
    return new NextResponse("// Agente no encontrado o API key inválida", {
      headers: { "Content-Type": "application/javascript" },
      status: 404,
    });
  }

  if (!agent.is_active) {
    return new NextResponse("// Este agente está inactivo", {
      headers: { "Content-Type": "application/javascript" },
      status: 403,
    });
  }

  // Validar dominio de origen
  const referer = req.headers.get("referer");
  const origin = req.headers.get("origin");
  const host = extractHostFromHeader(origin) || extractHostFromHeader(referer);

  if (
    Array.isArray(agent.allowed_domains) &&
    agent.allowed_domains.length > 0
  ) {
    const allowed = agent.allowed_domains.map((d) => d.toLowerCase());
    if (!host || !allowed.includes(host)) {
      return new NextResponse(
        `// Dominio no autorizado: ${host ?? "desconocido"}`,
        {
          headers: { "Content-Type": "application/javascript" },
          status: 403,
        }
      );
    }
  }

  // -------------------------------------------------------------
  // Generar el script del widget (frontend)
  const js = `
(function(){
  try {
    const ready = (fn)=>{ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); };
    ready(function(){
      if (document.getElementById('ai-saas-chat')) return;

      const w = document.createElement('div');
      w.id = 'ai-saas-chat';
      w.style.cssText = 'position:fixed;right:16px;bottom:16px;width:320px;max-width:90vw;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);overflow:hidden;font:14px/1.4 system-ui;z-index:999999';
      w.innerHTML = '<div style="padding:10px 12px;background:#111827;color:#fff;font-weight:600">Asistente</div><div id="aiChatBox" style="padding:10px;height:280px;overflow:auto;background:#f9fafb"></div><form id="aiChatForm" style="display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb"><input id="aiChatInput" placeholder="Escribe..." style="flex:1;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px"/><button type="submit" style="padding:8px 12px;border:0;border-radius:8px;background:#111827;color:#fff;cursor:pointer">Enviar</button></form>';
      document.body.appendChild(w);

      function bubble(text, who){
        const box = document.getElementById('aiChatBox');
        const div = document.createElement('div');
        div.style.cssText = 'padding:8px 10px;margin:6px 0;border-radius:12px;max-width:85%;' + (who==='user' ? 'margin-left:auto;background:#d1fae5' : 'margin-right:auto;background:#e5e7eb');
        div.textContent = text; box.appendChild(div); box.scrollTop = box.scrollHeight;
      }

      const form = document.getElementById('aiChatForm');
      const input = document.getElementById('aiChatInput');

      form.addEventListener('submit', async function(e){
        e.preventDefault();
        var msg = input.value.trim(); if(!msg) return;
        bubble(msg, 'user'); input.value = '';
        bubble('Pensando...', 'bot');
        try {
          const res = await fetch('https://ai-saas-nine-omega.vercel.app/api/agent/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: '${apiKey}', message: msg })
          });
          const data = await res.json();
          const box = document.getElementById('aiChatBox');
          box.lastChild.textContent = data.reply || data.error || 'Sin respuesta';
        } catch(err) {
          console.error("[AI SaaS] Error en fetch:", err);
          const box = document.getElementById('aiChatBox');
          box.lastChild.textContent = 'Error conectando con el agente.';
        }
      });
    });
  } catch(e){ console.error("[AI SaaS] Fallo en inicializacion:", e); }
})();`;

  // -------------------------------------------------------------
  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}
