import { WidgetConfig } from "./types";
import { STATIC_STYLES } from "./styles";

/**
 * Versión simplificada para preview - no hace fetch, solo usa overrides
 */
export function renderWidgetScriptPreview(overrides: Partial<WidgetConfig>) {
  const configJson = JSON.stringify(overrides);

  return `
(function() {
  if (document.getElementById("ai-saas-anchor")) return;

  const config = ${configJson};
  const { appearance = {}, brandName = "AI", brandInitial = "AI", collapsedLabel = "Chat", humanSupportText = "Support", position = "right" } = config;

  // Inject CSS
  const styleTag = document.createElement("style");
  styleTag.innerHTML = \`${STATIC_STYLES}\`;
  document.head.appendChild(styleTag);

  // Create Widget
  const anchor = document.createElement("div");
  anchor.id = "ai-saas-anchor";
  anchor.classList.add(position === "left" ? "ai-pos-left" : "ai-pos-right");
  
  // Apply CSS Variables
  const vars = {
    '--ai-accent': appearance.accent || '#34d399',
    '--ai-accent-contrast': appearance.accentContrast || '#0b1220',
    '--ai-header-bg': appearance.colorHeaderBg || '#1e293b',
    '--ai-header-text': appearance.colorHeaderText || '#ffffff',
    '--ai-chat-bg': appearance.colorChatBg || '#ffffff',
    '--ai-user-bg': appearance.colorUserBubbleBg || '#34d399',
    '--ai-user-text': appearance.colorUserBubbleText || '#ffffff',
    '--ai-bot-bg': appearance.colorBotBubbleBg || '#f1f5f9',
    '--ai-bot-text': appearance.colorBotBubbleText || '#0f172a',
    '--ai-toggle-bg': appearance.colorToggleBg || '#34d399',
    '--ai-toggle-text': appearance.colorToggleText || '#ffffff'
  };
  
  Object.entries(vars).forEach(([name, value]) => {
    anchor.style.setProperty(name, value);
  });

  // Build DOM
  anchor.innerHTML = \`
    <div id="ai-saas-toggle" role="button" tabindex="0">
      <div class="ai-saas-icon"><span>\${brandInitial}</span></div>
      <div class="ai-saas-label">\${collapsedLabel}</div>
    </div>
    <div id="ai-saas-widget">
      <div id="ai-saas-header">
        <div class="ai-saas-brand">
          <div class="ai-saas-brand-icon">\${brandInitial}</div>
          <div class="ai-saas-brand-text">
            <strong>\${brandName}</strong>
            <span>\${humanSupportText}</span>
          </div>
        </div>
        <button id="ai-saas-close">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div id="ai-saas-chat-box">
        <div class="ai-saas-bubble bot">👋 ¡Hola! Esta es una vista previa del widget.</div>
      </div>

      <div class="ai-saas-form">
        <div class="ai-saas-input-wrapper">
          <input type="text" id="ai-input" placeholder="Escribe un mensaje..." />
          <button id="ai-send">Enviar</button>
        </div>
      </div>
    </div>
  \`;

  document.body.appendChild(anchor);

  // Event Listeners
  const toggle = document.getElementById("ai-saas-toggle");
  const close = document.getElementById("ai-saas-close");
  const widget = document.getElementById("ai-saas-widget");
  const input = document.getElementById("ai-input");
  const send = document.getElementById("ai-send");
  const chatBox = document.getElementById("ai-saas-chat-box");
  
  const setOpen = (open) => {
    anchor.classList.toggle("open", open);
    if (open) input.focus();
  };

  toggle.onclick = () => setOpen(true);
  close.onclick = () => setOpen(false);

  const addMessage = (text, isUser) => {
    const div = document.createElement("div");
    div.className = \`ai-saas-bubble \${isUser ? 'user' : 'bot'}\`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const handleSend = () => {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, true);
    input.value = "";
    
    setTimeout(() => {
      addMessage("Esta es una vista previa. El widget responderá cuando esté activo.", false);
    }, 500);
  };

  send.onclick = handleSend;
  input.onkeypress = (e) => e.key === 'Enter' && handleSend();

  // Auto-open para preview
  setTimeout(() => setOpen(true), 500);
})();
`;
}

/**
 * Versión completa con fetch para producción
 */
export function renderWidgetScript(
  key: string,
  siteUrl: string,
  overrides: Partial<WidgetConfig> = {}
) {
  // Si hay overrides completos, usar versión simplificada (preview mode)
  if (overrides.appearance && Object.keys(overrides).length > 2) {
    return renderWidgetScriptPreview(overrides);
  }

  const overridesJson = JSON.stringify(overrides);

  return `
(function() {
  if (document.getElementById("ai-saas-anchor")) return;

  const CONFIG_KEY = "${key}";
  const API_BASE = "${siteUrl}";
  const OVERRIDES = ${overridesJson};

  async function init() {
    try {
      // Fetch config
      let config = {};
      try {
        const res = await fetch(\`\${API_BASE}/api/widget/config?key=\${CONFIG_KEY}\`);
        if (res.ok) config = await res.json();
      } catch (err) {
        console.warn("Widget: Using defaults", err);
      }

      // Merge config
      const fullConfig = {
        ...config,
        ...OVERRIDES,
        appearance: { ...config.appearance, ...OVERRIDES.appearance }
      };

      // Resto del código igual que antes...
      // (Tu código completo aquí)
      
    } catch (err) {
      console.error("Widget Error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
`;
}
