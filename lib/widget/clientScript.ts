import { WidgetConfig } from "./types"; // We use types for type safety in the generator, but the client script is a string.
import { STATIC_STYLES } from "./styles";

/**
 * Generates the pure JS code that runs in the browser.
 * This now uses a fetch-based approach for config.
 */
export function renderWidgetScript(
  key: string,
  siteUrl: string,
  overrides: Partial<WidgetConfig> = {}
) {
  // We serialize overrides to be injected into the script if any (e.g. preview mode)
  const overridesJson = JSON.stringify(overrides);

  return `
(function() {
  if (document.getElementById("ai-saas-anchor")) return;

  const CONFIG_KEY = "${key}";
  const API_BASE = "${siteUrl}";
  const OVERRIDES = ${overridesJson};

  // Helper to safely serialize text
  const escapeHtml = (unsafe) => {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const safeJsonParse = (raw) => {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!trimmed || (trimmed[0] !== "{" && trimmed[0] !== "[")) return null;
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      return null;
    }
  };

  const isProductList = (obj) => {
    return !!obj && obj.type === "product_list" && Array.isArray(obj.items);
  };

  const sanitizeUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    try {
      const parsed = new URL(url, API_BASE);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch (err) {
      return null;
    }
    return null;
  };

  const normalizeHex = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    let hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return \`#\${hex.toLowerCase()}\`;
  };

  const hexToRgb = (hex) => {
    const value = parseInt(hex.slice(1), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  };

  const rgba = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex);
    return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
  };

  const relativeLuminance = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const channel = (value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const R = channel(r);
    const G = channel(g);
    const B = channel(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const buildAccentVars = (accent) => {
    const baseAccent = normalizeHex(accent) || "#34d399";
    const luminance = relativeLuminance(baseAccent);
    const accentContrast = luminance > 0.55 ? "#0f172a" : "#f8fafc";
    const accentShadow = rgba(baseAccent, 0.32);
    const accentLight = rgba(baseAccent, 0.16);
    const accentGradient =
      "linear-gradient(135deg, " +
      rgba(baseAccent, 0.18) +
      ", " +
      rgba(baseAccent, 0.4) +
      ")";
    const closeColor = luminance > 0.8 ? "#0f172a" : "#fff";
    const closeBg =
      luminance > 0.8 ? "rgba(15,23,42,.12)" : "rgba(255,255,255,.24)";
    return {
      accent: baseAccent,
      accentContrast,
      accentShadow,
      accentLight,
      accentGradient,
      closeColor,
      closeBg,
    };
  };

  const setVar = (root, name, val, fallback) => {
    const v = typeof val === "string" ? val.trim() : val;
    if (v !== undefined && v !== null && v !== "") {
      root.style.setProperty(name, String(v));
    } else if (fallback !== undefined) {
      root.style.setProperty(name, String(fallback));
    }
  };

  const mergeConfig = (config) => {
    return {
      ...config,
      ...OVERRIDES,
      appearance: {
        ...(config?.appearance || {}),
        ...(OVERRIDES?.appearance || {}),
      },
    };
  };

  const fetchConfig = async (key) => {
    const configUrl = new URL("/api/widget/config", API_BASE);
    configUrl.searchParams.set("key", key);
    configUrl.searchParams.set("t", String(Date.now()));
    const res = await fetch(configUrl.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("Config fetch failed");
    return res.json();
  };

  const applyTheme = (root, cfg) => {
    if (!root || !cfg) return;
    const appearance = cfg.appearance || {};
    const accentVars = buildAccentVars(cfg.accent || appearance.accent);

    setVar(root, "--ai-accent", accentVars.accent, "#34d399");
    setVar(root, "--ai-accent-contrast", accentVars.accentContrast, "#0b1220");
    setVar(
      root,
      "--ai-accent-shadow",
      accentVars.accentShadow,
      "rgba(52,211,153,.25)"
    );
    setVar(
      root,
      "--ai-accent-light",
      accentVars.accentLight,
      "rgba(52,211,153,.18)"
    );
    setVar(
      root,
      "--ai-accent-gradient",
      accentVars.accentGradient,
      "linear-gradient(135deg,#34d399,#8b5cf6)"
    );
    setVar(root, "--ai-close-bg", accentVars.closeBg);
    setVar(root, "--ai-close-text", accentVars.closeColor);

    setVar(root, "--ai-header-bg", appearance.colorHeaderBg);
    setVar(root, "--ai-header-text", appearance.colorHeaderText);
    setVar(root, "--ai-chat-bg", appearance.colorChatBg);
    setVar(root, "--ai-user-bg", appearance.colorUserBubbleBg);
    setVar(root, "--ai-user-text", appearance.colorUserBubbleText);
    setVar(root, "--ai-bot-bg", appearance.colorBotBubbleBg);
    setVar(root, "--ai-bot-text", appearance.colorBotBubbleText);
    setVar(root, "--ai-toggle-bg", appearance.colorToggleBg);
    setVar(root, "--ai-toggle-text", appearance.colorToggleText);
  };

  const applyPosition = (root, position) => {
    root.classList.remove("ai-pos-left", "ai-pos-right");
    root.classList.add(position === "left" ? "ai-pos-left" : "ai-pos-right");
  };

  const renderProductListHtml = (pl) => {
    const title = pl && pl.title ? \`<div class="ai-pl-title">\${escapeHtml(pl.title)}</div>\` : "";
    const items = Array.isArray(pl?.items) ? pl.items : [];
    const cards = items
      .map((item) => {
        const name = escapeHtml(item?.name || "");
        const price = item?.price !== undefined && item?.price !== null ? escapeHtml(String(item.price)) : "";
        const currency = item?.currency ? escapeHtml(String(item.currency)) : "";
        const priceText = [price, currency].filter(Boolean).join(" ");
        const permalink = sanitizeUrl(item?.permalink);
        const imageUrl = sanitizeUrl(item?.image);
        const stockBadge =
          item?.stock_status === "instock"
            ? '<span class="ai-pl-cta">En stock</span>'
            : "";
        const media = imageUrl
          ? \`<div class="ai-pl-media"><img class="ai-pl-img" src="\${imageUrl}" alt="\${name}" loading="lazy" /></div>\`
          : '<div class="ai-pl-media"></div>';
        const meta = \`<div class="ai-pl-meta"><div class="ai-pl-name">\${name}</div>\${priceText ? \`<div class="ai-pl-sub">\${priceText}</div>\` : ""}\${stockBadge}</div>\`;
        const content = \`<div class="ai-pl-item">\${media}\${meta}</div>\`;
        if (permalink) {
          return \`<a class="ai-pl-link" href="\${permalink}" target="_blank" rel="noopener noreferrer">\${content}</a>\`;
        }
        return \`<div class="ai-pl-link">\${content}</div>\`;
      })
      .join("");

    return \`<div class="ai-pl">\${title}<div class="ai-pl-grid">\${cards}</div></div>\`;
  };

  async function init() {
    try {
      // 1. Fetch Config
      let config = null;
      try {
        config = await fetchConfig(CONFIG_KEY);
      } catch (err) {
        console.warn("AI Widget: Could not load config, using defaults or overrides.", err);
        // We could implement hardcoded defaults here if fetch fails, 
        // but ideally the API always responds. 
        // For now, if fetch fails and no overrides, we might be in trouble, 
        // but let's assume we have partial overrides or we fail gracefully.
        if (Object.keys(OVERRIDES).length === 0) return; // Don't render if completely broken
        config = {}; 
      }

      // 2. Merge Overrides (Preview mode takes precedence)
      // We do a shallow merge of the top level, and deep merge of appearance
      let fullConfig = mergeConfig(config || {});

      const { brandName, brandInitial, collapsedLabel, humanSupportText } =
        fullConfig;

      // 3. Inject CSS
      // We rely on STATIC_STYLES which uses variables.
      // We prepend a style tag.
      const styleTag = document.createElement("style");
      styleTag.innerHTML = \`${STATIC_STYLES}\`;
      document.head.appendChild(styleTag);
      const plStyleTag = document.createElement("style");
      plStyleTag.innerHTML = \`
        .ai-pl { display: flex; flex-direction: column; gap: 8px; }
        .ai-pl-title { font-size: 12px; font-weight: 600; color: var(--ai-bot-text, #111); }
        .ai-pl-grid { display: grid; gap: 8px; }
        .ai-pl-link { display: block; text-decoration: none; color: inherit; }
        .ai-pl-item { display: grid; grid-template-columns: 44px 1fr; gap: 8px; align-items: center; padding: 8px; border-radius: 10px; background: rgba(15, 23, 42, 0.08); border: 1px solid rgba(148, 163, 184, 0.15); }
        .ai-pl-media { width: 44px; height: 44px; border-radius: 8px; overflow: hidden; background: rgba(15, 23, 42, 0.12); display: flex; align-items: center; justify-content: center; }
        .ai-pl-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ai-pl-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .ai-pl-name { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ai-pl-sub { font-size: 11px; opacity: 0.7; }
        .ai-pl-cta { margin-top: 2px; font-size: 10px; font-weight: 600; color: #16a34a; }
      \`;
      document.head.appendChild(plStyleTag);

      // 4. Create Root Elements
      const anchor = document.createElement("div");
      anchor.id = "ai-saas-anchor";
      applyPosition(anchor, fullConfig.position);
      applyTheme(anchor, fullConfig);

      
      const renderBrandIcon = () => {
        return \`<div class="ai-saas-icon"><span>\${escapeHtml(brandInitial)}</span></div>\`;
      };

      // 6. Build DOM
      anchor.innerHTML = \`
        <div id="ai-saas-toggle" role="button" tabindex="0" aria-label="Open chat">
          \${renderBrandIcon()}
          <div class="ai-saas-label">\${escapeHtml(collapsedLabel)}</div>
        </div>
        <div id="ai-saas-widget" aria-hidden="true">
           <div id="ai-saas-header">
             <div class="ai-saas-brand">
               <div class="ai-saas-brand-icon">\${escapeHtml(brandInitial)}</div>
               <div class="ai-saas-brand-text">
                 <strong>\${escapeHtml(brandName)}</strong>
                 <span>\${escapeHtml(humanSupportText || "Support Agent")}</span>
               </div>
             </div>
             <button id="ai-saas-close" aria-label="Close chat">
               <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
           
           <div id="ai-saas-chat-box">
                     <!-- Chat history goes here -->
           </div>

           <form id="ai-saas-form">
              <div class="ai-saas-input-wrapper">
                <input type="text" placeholder="Type a message..." aria-label="Type a message" />
                <button type="submit" aria-label="Send">
                  <span class="ai-saas-send-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </span>
                  Send
                </button>
              </div>
           </form>
           
           <div style="text-align: center; padding: 0 0 10px 0; font-size: 10px; opacity: 0.5;">
             Powered by <a href="#" target="_blank" style="color: inherit; text-decoration: none; font-weight: bold;">AI SaaS</a>
           </div>
        </div>
      \`;

      document.body.appendChild(anchor);

      const refreshTheme = async () => {
        try {
          const freshConfig = await fetchConfig(CONFIG_KEY);
          fullConfig = mergeConfig(freshConfig || {});
          applyTheme(anchor, fullConfig);
        } catch (err) {
          console.warn("Widget theme refresh failed");
        }
      };

      // 7. Event Listeners
      const toggleBtn = document.getElementById("ai-saas-toggle");
      const closeBtn = document.getElementById("ai-saas-close");
      const widget = document.getElementById("ai-saas-widget");
      const form = document.getElementById("ai-saas-form");
      const input = form.querySelector("input");
      const chatBox = document.getElementById("ai-saas-chat-box");
      
      let isOpen = false;
      const setOpen = (state) => {
        isOpen = state;
        if (state) {
          refreshTheme();
          anchor.classList.add("open");
          widget.setAttribute("aria-hidden", "false");
          input.focus();
        } else {
          anchor.classList.remove("open");
          widget.setAttribute("aria-hidden", "true");
        }
      };

      toggleBtn.onclick = () => setOpen(true);
      closeBtn.onclick = () => setOpen(false);

      form.onsubmit = async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // User Message
        const userDiv = document.createElement("div");
        userDiv.className = "ai-saas-bubble user ai-saas-enter";
        userDiv.innerText = text; // auto-escaped
        chatBox.appendChild(userDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        input.value = "";
        input.disabled = true;

        // Typing indicator
        const typingDiv = document.createElement("div");
        typingDiv.className = "ai-saas-bubble bot typing ai-saas-enter";
        typingDiv.innerHTML = '<div class="ai-saas-typing"><span></span><span></span><span></span></div>';
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Send to API
        try {
          const agentKey = fullConfig.key || CONFIG_KEY;
          const chatBase = fullConfig.chatEndpoint || \`\${API_BASE}/api/agent/chat\`;
          const chatUrl = new URL(chatBase, API_BASE);
          if (agentKey && !chatUrl.searchParams.has("key")) {
            chatUrl.searchParams.set("key", agentKey);
          }

          const payload = {
            message: text,
            messages: [{ role: "user", content: text }],
          };
          if (agentKey) payload.api_key = agentKey;

          const resp = await fetch(chatUrl.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          chatBox.removeChild(typingDiv);
          input.disabled = false;
          input.focus();

          if (!resp.ok) {
            const errorText = await resp.text().catch(() => "");
            console.error("AI Widget: API error", errorText || resp.status);
            throw new Error("API Error");
          }
          const data = await resp.json();

          // Bot Message
          const botDiv = document.createElement("div");
          botDiv.className = "ai-saas-bubble bot ai-saas-enter";
          const replyRaw = data.reply || "Sorry, I didn't understand that.";
          const parsed = safeJsonParse(replyRaw);
          if (isProductList(parsed)) {
            botDiv.innerHTML = renderProductListHtml(parsed);
          } else {
            botDiv.innerText = replyRaw;
          }
          chatBox.appendChild(botDiv);
          chatBox.scrollTop = chatBox.scrollHeight;

        } catch (err) {
          if (chatBox.contains(typingDiv)) chatBox.removeChild(typingDiv);
          input.disabled = false;
          
          const errDiv = document.createElement("div");
          errDiv.className = "ai-saas-bubble bot ai-saas-error ai-saas-enter";
          errDiv.innerText = "Error sending message. Please try again.";
          chatBox.appendChild(errDiv);
        }
      };

    } catch (err) {
      console.error("AI Widget Error:", err);
    }
  }

  // Auto-init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
`;
}
