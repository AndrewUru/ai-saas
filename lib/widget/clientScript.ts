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

  const UI_COPY = {
    en: {
      collapsedLabel: "Chat with us",
      humanSupportText: "Talk to a human",
      greeting: "How can I help you today?",
      inputPlaceholder: "Type a message...",
      inputLabel: "Type a message",
      send: "Send",
      sendMessage: "Send message",
      openChat: "Open chat",
      chatOpen: "Chat open",
      closeChat: "Close chat",
      assistantTyping: "Assistant is typing",
      suggestionsLabel: "Suggested questions",
      suggestions: ["Browse products", "Shipping info", "Talk to support"],
      errorSending: "Error sending message. Please try again.",
      fallbackReply: "Sorry, I didn't understand that.",
      stockIn: "In stock",
      stockOut: "Out of stock",
      stockBackorder: "Backorder",
      stockCheck: "Check availability",
      productCategories: "Product categories",
      product: "Product",
      viewProduct: "View product",
      detailsInChat: "Details in chat",
      viewProductAria: "View product:",
      productAria: "Product:",
      noProducts: "No matching products found.",
    },
    es: {
      collapsedLabel: "Chatea con nosotros",
      humanSupportText: "Habla con una persona",
      greeting: "Como puedo ayudarte hoy?",
      inputPlaceholder: "Escribe un mensaje...",
      inputLabel: "Escribe un mensaje",
      send: "Enviar",
      sendMessage: "Enviar mensaje",
      openChat: "Abrir chat",
      chatOpen: "Chat abierto",
      closeChat: "Cerrar chat",
      assistantTyping: "El asistente esta escribiendo",
      suggestionsLabel: "Preguntas sugeridas",
      suggestions: ["Ver productos", "Informacion de envio", "Hablar con soporte"],
      errorSending: "Error al enviar el mensaje. Intentalo de nuevo.",
      fallbackReply: "Lo siento, no he entendido eso.",
      stockIn: "En stock",
      stockOut: "Sin stock",
      stockBackorder: "Bajo pedido",
      stockCheck: "Consultar disponibilidad",
      productCategories: "Categorias de producto",
      product: "Producto",
      viewProduct: "Ver producto",
      detailsInChat: "Detalles en el chat",
      viewProductAria: "Ver producto:",
      productAria: "Producto:",
      noProducts: "No se encontraron productos coincidentes.",
    },
    pt: {
      collapsedLabel: "Fale conosco",
      humanSupportText: "Falar com uma pessoa",
      greeting: "Como posso ajudar hoje?",
      inputPlaceholder: "Digite uma mensagem...",
      inputLabel: "Digite uma mensagem",
      send: "Enviar",
      sendMessage: "Enviar mensagem",
      openChat: "Abrir chat",
      chatOpen: "Chat aberto",
      closeChat: "Fechar chat",
      assistantTyping: "O assistente esta digitando",
      suggestionsLabel: "Perguntas sugeridas",
      suggestions: ["Ver produtos", "Informacoes de envio", "Falar com suporte"],
      errorSending: "Erro ao enviar a mensagem. Tente novamente.",
      fallbackReply: "Desculpe, nao entendi isso.",
      stockIn: "Em estoque",
      stockOut: "Sem estoque",
      stockBackorder: "Sob encomenda",
      stockCheck: "Verificar disponibilidade",
      productCategories: "Categorias de produto",
      product: "Produto",
      viewProduct: "Ver produto",
      detailsInChat: "Detalhes no chat",
      viewProductAria: "Ver produto:",
      productAria: "Produto:",
      noProducts: "Nenhum produto correspondente encontrado.",
    },
    fr: {
      collapsedLabel: "Discuter avec nous",
      humanSupportText: "Parler a une personne",
      greeting: "Comment puis-je vous aider aujourd'hui ?",
      inputPlaceholder: "Ecrivez un message...",
      inputLabel: "Ecrivez un message",
      send: "Envoyer",
      sendMessage: "Envoyer le message",
      openChat: "Ouvrir le chat",
      chatOpen: "Chat ouvert",
      closeChat: "Fermer le chat",
      assistantTyping: "L'assistant est en train d'ecrire",
      suggestionsLabel: "Questions suggerees",
      suggestions: ["Voir les produits", "Infos livraison", "Parler au support"],
      errorSending: "Erreur lors de l'envoi du message. Reessayez.",
      fallbackReply: "Desole, je n'ai pas compris.",
      stockIn: "En stock",
      stockOut: "Rupture de stock",
      stockBackorder: "Sur commande",
      stockCheck: "Verifier la disponibilite",
      productCategories: "Categories de produit",
      product: "Produit",
      viewProduct: "Voir le produit",
      detailsInChat: "Details dans le chat",
      viewProductAria: "Voir le produit :",
      productAria: "Produit :",
      noProducts: "Aucun produit correspondant trouve.",
    },
  };

  const resolveLanguage = (configuredLanguage) => {
    const explicit = typeof configuredLanguage === "string" ? configuredLanguage.toLowerCase().slice(0, 2) : "";
    if (UI_COPY[explicit]) return explicit;

    const docLanguage = (document.documentElement.getAttribute("lang") || "").toLowerCase().slice(0, 2);
    if (UI_COPY[docLanguage]) return docLanguage;

    const browserLanguage = (navigator.language || "").toLowerCase().slice(0, 2);
    if (UI_COPY[browserLanguage]) return browserLanguage;

    return "en";
  };

  const getCopy = (configuredLanguage) => UI_COPY[resolveLanguage(configuredLanguage)] || UI_COPY.en;

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
      "linear-gradient(135deg,rgba(37,99,235,.18),rgba(37,99,235,.42))"
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

  const getStockMeta = (status, copy) => {
    const normalized = typeof status === "string" ? status.toLowerCase().trim() : "";
    if (!normalized) return null;
    if (["instock", "in_stock", "available"].includes(normalized)) {
      return { label: copy.stockIn, tone: "instock" };
    }
    if (["outofstock", "out_of_stock", "soldout", "sold_out"].includes(normalized)) {
      return { label: copy.stockOut, tone: "out" };
    }
    if (["onbackorder", "backorder", "preorder", "pre_order"].includes(normalized)) {
      return { label: copy.stockBackorder, tone: "muted" };
    }
    return { label: copy.stockCheck, tone: "muted" };
  };

  const normalizeProductItem = (item, copy) => {
    const rawName = item?.name ? String(item.name).trim() : "";
    const name = rawName || copy.product;
    const price = item?.price !== undefined && item?.price !== null ? String(item.price).trim() : "";
    const currency = item?.currency ? String(item.currency).trim() : "";
    const categories = Array.isArray(item?.categories)
      ? item.categories
          .map((category) => (typeof category === "string" ? category.trim() : ""))
          .filter(Boolean)
          .slice(0, 3)
      : [];
    return {
      name,
      initial: (name.charAt(0).toUpperCase() || "P").slice(0, 1),
      priceText: [price, currency].filter(Boolean).join(" "),
      permalink: sanitizeUrl(item?.permalink),
      imageUrl: sanitizeUrl(item?.image),
      stock: getStockMeta(item?.stock_status, copy),
      categories,
    };
  };

  const renderProductCardHtml = (rawItem, copy) => {
    const item = normalizeProductItem(rawItem, copy);
    const name = escapeHtml(item.name);
    const initial = escapeHtml(item.initial);
    const imageUrl = item.imageUrl ? escapeHtml(item.imageUrl) : "";
    const permalink = item.permalink ? escapeHtml(item.permalink) : "";
    const price = item.priceText ? \`<div class="ai-pl-price">\${escapeHtml(item.priceText)}</div>\` : "";
    const stock = item.stock
      ? \`<span class="ai-pl-stock \${item.stock.tone}">\${escapeHtml(item.stock.label)}</span>\`
      : "";
    const categories = item.categories.length
      ? \`<div class="ai-pl-categories" aria-label="\${escapeHtml(copy.productCategories)}">\${item.categories
          .map((category) => \`<span class="ai-pl-category">\${escapeHtml(category)}</span>\`)
          .join("")}</div>\`
      : "";
    const media = imageUrl
      ? \`<div class="ai-pl-media"><img class="ai-pl-img" src="\${imageUrl}" alt="\${name}" loading="lazy" onerror="this.closest('.ai-pl-media').classList.add('is-fallback');this.remove();" /><span class="ai-pl-fallback-initial" aria-hidden="true">\${initial}</span></div>\`
      : \`<div class="ai-pl-media is-fallback" aria-hidden="true"><span class="ai-pl-fallback-initial">\${initial}</span></div>\`;
    const action = permalink
      ? \`<span class="ai-pl-action" aria-hidden="true">\${escapeHtml(copy.viewProduct)}</span>\`
      : \`<span class="ai-pl-action muted" aria-hidden="true">\${escapeHtml(copy.detailsInChat)}</span>\`;
    const meta = \`
      <div class="ai-pl-meta">
        <div class="ai-pl-name">\${name}</div>
        <div class="ai-pl-details">\${price}\${stock}</div>
        \${categories}
      </div>
    \`;
    const content = \`<div class="ai-pl-item">\${media}\${meta}\${action}</div>\`;

    if (permalink) {
      return \`<a class="ai-pl-link" href="\${permalink}" target="_blank" rel="noopener noreferrer" aria-label="\${escapeHtml(copy.viewProductAria)} \${name}">\${content}</a>\`;
    }
    return \`<div class="ai-pl-link" role="group" aria-label="\${escapeHtml(copy.productAria)} \${name}">\${content}</div>\`;
  };

  const renderProductListHtml = (pl, copy) => {
    const title = pl && pl.title ? \`<div class="ai-pl-title">\${escapeHtml(pl.title)}</div>\` : "";
    const items = Array.isArray(pl?.items) ? pl.items.filter(Boolean).slice(0, 6) : [];
    if (!items.length) {
      return \`<div class="ai-pl"><div class="ai-pl-empty">\${escapeHtml(copy.noProducts)}</div></div>\`;
    }

    const cards = items.map((item) => renderProductCardHtml(item, copy)).join("");

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
      let copy = getCopy(fullConfig.language);
      const brandName = fullConfig.brandName || "AI Widget";
      const brandInitial =
        fullConfig.brandInitial ||
        (brandName.charAt(0).toUpperCase() || "A").slice(0, 1);
      const collapsedLabel = fullConfig.collapsedLabel || copy.collapsedLabel;
      const humanSupportText = fullConfig.humanSupportText || copy.humanSupportText;
      const greeting = fullConfig.greeting || copy.greeting;

      // 3. Inject CSS
      // We rely on STATIC_STYLES which uses variables.
      // We prepend a style tag.
      const styleTag = document.createElement("style");
      styleTag.innerHTML = \`${STATIC_STYLES}\`;
      document.head.appendChild(styleTag);

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
        <button id="ai-saas-toggle" type="button" aria-controls="ai-saas-widget" aria-expanded="false" aria-label="\${escapeHtml(copy.openChat)}">
          \${renderBrandIcon()}
          <span class="ai-saas-label">\${escapeHtml(collapsedLabel)}</span>
        </button>
        <section id="ai-saas-widget" role="dialog" aria-modal="false" aria-labelledby="ai-saas-title" aria-hidden="true">
           <div id="ai-saas-header">
             <div class="ai-saas-brand">
               <div class="ai-saas-brand-icon" aria-hidden="true">\${escapeHtml(brandInitial)}</div>
               <div class="ai-saas-brand-text">
                 <strong id="ai-saas-title">\${escapeHtml(brandName)}</strong>
                 <span><span class="ai-saas-status-dot" aria-hidden="true"></span>\${escapeHtml(humanSupportText)}</span>
               </div>
             </div>
             <button id="ai-saas-close" type="button" aria-label="\${escapeHtml(copy.closeChat)}">
               <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
           
           <div id="ai-saas-chat-box" role="log" aria-live="polite" aria-relevant="additions">
           </div>

           <form id="ai-saas-form">
              <div class="ai-saas-input-wrapper">
                <input type="text" placeholder="\${escapeHtml(copy.inputPlaceholder)}" aria-label="\${escapeHtml(copy.inputLabel)}" autocomplete="off" />
                <button type="submit" aria-label="\${escapeHtml(copy.sendMessage)}" aria-busy="false" disabled>
                  <span class="ai-saas-send-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </span>
                  <span class="ai-saas-send-label">\${escapeHtml(copy.send)}</span>
                </button>
              </div>
           </form>
           
           <div class="ai-saas-powered">
             Powered by <a href="#" target="_blank" rel="noopener noreferrer">AI SaaS</a>
           </div>
        </section>
      \`;

      document.body.appendChild(anchor);

      const refreshTheme = async () => {
        try {
          const freshConfig = await fetchConfig(CONFIG_KEY);
          fullConfig = mergeConfig(freshConfig || {});
          copy = getCopy(fullConfig.language);
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
      const submitBtn = form.querySelector("button");
      const chatBox = document.getElementById("ai-saas-chat-box");
      const suggestionLabels = copy.suggestions;

      const scrollChatToBottom = () => {
        chatBox.scrollTop = chatBox.scrollHeight;
      };

      const appendBotMessage = (text) => {
        if (!text) return;
        const botDiv = document.createElement("div");
        botDiv.className = "ai-saas-bubble bot ai-saas-enter";
        botDiv.innerText = text;
        chatBox.appendChild(botDiv);
        scrollChatToBottom();
      };

      const removeSuggestions = () => {
        const suggestions = document.getElementById("ai-saas-suggestions");
        if (suggestions) suggestions.remove();
      };

      const appendSuggestions = () => {
        const suggestions = document.createElement("div");
        suggestions.id = "ai-saas-suggestions";
        suggestions.className = "ai-saas-suggestions ai-saas-enter";
        suggestions.setAttribute("aria-label", copy.suggestionsLabel);

        suggestionLabels.forEach((label) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "ai-saas-suggestion-chip";
          chip.innerText = label;
          chip.addEventListener("click", () => {
            input.value = label;
            setSending(false);
            input.focus();
          });
          suggestions.appendChild(chip);
        });

        chatBox.appendChild(suggestions);
        scrollChatToBottom();
      };

      const setSending = (sending) => {
        input.disabled = sending;
        submitBtn.disabled = sending || !input.value.trim();
        submitBtn.setAttribute("aria-busy", sending ? "true" : "false");
        form.classList.toggle("is-sending", sending);
      };
      
      let isOpen = false;
      const setOpen = (state) => {
        isOpen = state;
        toggleBtn.setAttribute("aria-expanded", state ? "true" : "false");
        toggleBtn.setAttribute("aria-label", state ? copy.chatOpen : copy.openChat);
        if (state) {
          refreshTheme();
          anchor.classList.add("open");
          widget.setAttribute("aria-hidden", "false");
          window.setTimeout(() => input.focus(), 0);
        } else {
          anchor.classList.remove("open");
          widget.setAttribute("aria-hidden", "true");
          toggleBtn.focus();
        }
      };

      appendBotMessage(greeting);
      appendSuggestions();

      toggleBtn.addEventListener("click", () => setOpen(true));
      closeBtn.addEventListener("click", () => setOpen(false));
      input.addEventListener("input", () => setSending(false));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isOpen) {
          setOpen(false);
        }
      });

      form.onsubmit = async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        removeSuggestions();

        // User Message
        const userDiv = document.createElement("div");
        userDiv.className = "ai-saas-bubble user ai-saas-enter";
        userDiv.innerText = text; // auto-escaped
        chatBox.appendChild(userDiv);
        scrollChatToBottom();
        input.value = "";
        setSending(true);

        // Typing indicator
        const typingDiv = document.createElement("div");
        typingDiv.className = "ai-saas-bubble bot typing ai-saas-enter";
        typingDiv.setAttribute("aria-label", copy.assistantTyping);
        typingDiv.innerHTML = \`<span class="ai-saas-sr-only">\${escapeHtml(copy.assistantTyping)}</span><div class="ai-saas-typing" aria-hidden="true"><span></span><span></span><span></span></div>\`;
        chatBox.appendChild(typingDiv);
        scrollChatToBottom();

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

          if (chatBox.contains(typingDiv)) chatBox.removeChild(typingDiv);
          setSending(false);
          input.focus();

          if (!resp.ok) {
            const errorText = await resp.text().catch(() => "");
            console.error("AI Widget: API error", errorText || resp.status);
            throw new Error("API Error");
          }
          const data = await resp.json();

          // Bot Message
          const botDiv = document.createElement("div");
          const replyRaw = data.reply || copy.fallbackReply;
          const parsed = safeJsonParse(replyRaw);
          if (isProductList(parsed)) {
            botDiv.className = "ai-saas-bubble bot product-list ai-saas-enter";
            botDiv.innerHTML = renderProductListHtml(parsed, copy);
          } else {
            botDiv.className = "ai-saas-bubble bot ai-saas-enter";
            botDiv.innerText = replyRaw;
          }
          chatBox.appendChild(botDiv);
          scrollChatToBottom();

        } catch (err) {
          if (chatBox.contains(typingDiv)) chatBox.removeChild(typingDiv);
          setSending(false);
          
          const errDiv = document.createElement("div");
          errDiv.className = "ai-saas-bubble bot ai-saas-error ai-saas-enter";
          errDiv.innerText = copy.errorSending;
          chatBox.appendChild(errDiv);
          scrollChatToBottom();
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
