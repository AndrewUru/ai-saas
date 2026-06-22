import { WidgetConfig } from "./types"; // We use types for type safety in the generator, but the client script is a string.
import { STATIC_STYLES } from "./styles";

/**
 * Generates the pure JS code that runs in the browser.
 * This now uses a fetch-based approach for config.
 */
export function renderWidgetScript(
  key: string,
  siteUrl: string,
  overrides: Partial<WidgetConfig> = {},
  options: { isPreview?: boolean; autoOpen?: boolean } = {}
) {
  // We serialize overrides to be injected into the script if any (e.g. preview mode)
  const overridesJson = JSON.stringify(overrides);
  const isPreview = options.isPreview === true;
  const autoOpen = options.autoOpen === true;

  return `
(function() {
  if (document.getElementById("ai-saas-anchor")) return;

  const CONFIG_KEY = "${key}";
  const API_BASE = "${siteUrl}";
  const OVERRIDES = ${overridesJson};
  const IS_PREVIEW = ${isPreview ? "true" : "false"};
  const SHOULD_AUTO_OPEN = ${autoOpen ? "true" : "false"};

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
    const overrideLanguage =
      OVERRIDES?.language === "auto" && config?.language
        ? config.language
        : OVERRIDES?.language;

    return {
      ...config,
      ...OVERRIDES,
      language: overrideLanguage ?? config?.language,
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
      poweredBy: "Powered by",
      contactSupport: "Contact support",
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
      poweredBy: "Con tecnologia de",
      contactSupport: "Contactar con soporte",
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
      poweredBy: "Desenvolvido por",
      contactSupport: "Contactar suporte",
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
      poweredBy: "Propulse par",
      contactSupport: "Contacter le support",
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

  const countWords = (value) => {
    return String(value || "")
      .trim()
      .split(/\\s+/)
      .filter(Boolean).length;
  };

  const trackWidgetEvent = (eventType, extra) => {
    if (IS_PREVIEW) return;
    try {
      const payload = JSON.stringify({
        key: CONFIG_KEY,
        eventType,
        pageUrl: window.location.href,
        referrer: document.referrer || null,
        ...(extra || {}),
      });
      const endpoint = new URL("/api/widget/events", API_BASE).toString();

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(endpoint, blob);
        return;
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch (err) {
      // Analytics must never block the widget.
    }
  };

  const fetchConfig = async (key) => {
    const configUrl = new URL("/api/widget/config", API_BASE);
    configUrl.searchParams.set("key", key);
    configUrl.searchParams.set("t", String(Date.now()));
    if (IS_PREVIEW) configUrl.searchParams.set("preview", "1");
    const pageLanguage = (document.documentElement.getAttribute("lang") || "").trim();
    if (pageLanguage) configUrl.searchParams.set("pageLanguage", pageLanguage);
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
    const toggleBg = normalizeHex(appearance.colorToggleBg) || "#25d366";
    const toggleText = normalizeHex(appearance.colorToggleText) || "#ffffff";
    setVar(root, "--ai-toggle-bg", toggleBg);
    setVar(root, "--ai-toggle-shadow", rgba(toggleBg, 0.34));
    setVar(root, "--ai-toggle-shadow-hover", rgba(toggleBg, 0.42));
    setVar(root, "--ai-toggle-status-bg", toggleBg);
    setVar(root, "--ai-toggle-status-border", toggleText);
    setVar(root, "--ai-toggle-text", toggleText);
    const bubbleBg = normalizeHex(appearance.colorBubbleBg) || "#111827";
    const bubbleText = normalizeHex(appearance.colorBubbleText) || "#ffffff";
    const bubbleSubtext = normalizeHex(appearance.colorBubbleSubtext) || "#cbd5e1";
    const bubbleBorder = normalizeHex(appearance.colorBubbleBorder) || "#273244";
    const bubbleGlow = normalizeHex(appearance.colorBubbleGlow) || toggleBg;
    setVar(root, "--ai-bubble-bg", bubbleBg);
    setVar(root, "--ai-bubble-text", bubbleText);
    setVar(root, "--ai-bubble-subtext", bubbleSubtext);
    setVar(root, "--ai-bubble-border", bubbleBorder);
    setVar(root, "--ai-bubble-glow", rgba(bubbleGlow, 0.38));
    setVar(root, "--ai-widget-width", cfg.width ? cfg.width + "px" : null);
    setVar(root, "--ai-widget-height", cfg.height ? cfg.height + "px" : null);
    setVar(root, "--ai-widget-offset-x", cfg.offsetX !== undefined ? cfg.offsetX + "px" : null);
    setVar(root, "--ai-widget-offset-y", cfg.offsetY !== undefined ? cfg.offsetY + "px" : null);
    setVar(root, "--ai-launcher-size", cfg.launcherSize ? cfg.launcherSize + "px" : null);
    setVar(root, "--ai-widget-radius", cfg.borderRadius ? cfg.borderRadius + "px" : null);
    setVar(root, "--ai-bubble-width", cfg.bubbleWidth ? cfg.bubbleWidth + "px" : null);
    setVar(root, "--ai-bubble-radius", cfg.bubbleRadius ? cfg.bubbleRadius + "px" : null);
  };

  const applyPosition = (root, position) => {
    root.classList.remove("ai-pos-left", "ai-pos-right");
    root.classList.add(position === "left" ? "ai-pos-left" : "ai-pos-right");
  };

  const normalizeFormat = (format) => {
    return format === "assistant" ? "assistant" : "classic";
  };

  const applyFormat = (root, format) => {
    root.classList.remove("ai-format-classic", "ai-format-assistant");
    root.classList.add(\`ai-format-\${normalizeFormat(format)}\`);
  };

  const normalizeLauncherStyle = (style) => {
    return style === "card" ? "card" : "icon";
  };

  const applyLauncherStyle = (root, cfg) => {
    root.classList.remove("ai-launcher-style-icon", "ai-launcher-style-card");
    root.classList.add(\`ai-launcher-style-\${normalizeLauncherStyle(cfg?.launcherStyle)}\`);
    root.classList.toggle("ai-three-enabled", cfg?.bubbleUseThree !== false);
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

  const isSupportIntent = (text) => {
    const normalized = String(text || "").toLowerCase();
    return [
      "support",
      "soporte",
      "suporte",
      "assistance",
      "ayuda",
      "humano",
      "persona",
      "whatsapp",
      "telegram",
      "contact",
      "contacto",
      "contato",
    ].some((term) => normalized.includes(term));
  };

  const appendFallbackLink = (container, fallbackUrl, copy) => {
    const safeUrl = sanitizeUrl(fallbackUrl);
    if (!safeUrl) return;

    const link = document.createElement("a");
    link.className = "ai-saas-fallback";
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = \`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 17L17 7"></path>
        <path d="M8 7h9v9"></path>
      </svg>
      <span>\${escapeHtml(copy.contactSupport)}</span>
    \`;
    container.appendChild(link);
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
      const bubbleSubtitle = fullConfig.bubbleSubtitle || "I'm here to assist you.";
      const greeting = fullConfig.greeting || copy.greeting;
      const launcherIcon = ["whatsapp", "chat", "bot", "store", "logo"].includes(fullConfig.launcherIcon)
        ? fullConfig.launcherIcon
        : "whatsapp";
      const launcherLogoUrl = sanitizeUrl(fullConfig.launcherLogoUrl);

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
      applyFormat(anchor, fullConfig.format);
      applyLauncherStyle(anchor, fullConfig);
      applyTheme(anchor, fullConfig);

      
      const renderLauncherSvg = (icon) => {
        if (icon === "chat") {
          return \`<svg viewBox="0 0 32 32" fill="none" role="img"><path fill="currentColor" d="M16 5C9.37 5 4 9.8 4 15.7c0 3.06 1.46 5.82 3.8 7.77l-.77 3.83a.8.8 0 0 0 1.1.9l4.66-2.05c1.02.25 2.1.38 3.21.38 6.63 0 12-4.8 12-10.83C28 9.8 22.63 5 16 5Zm-5.2 12.4a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Zm5.2 0a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Zm5.2 0a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Z"/></svg>\`;
        }
        if (icon === "bot") {
          return \`<svg viewBox="0 0 32 32" fill="none" role="img"><path fill="currentColor" d="M15 4.5a1 1 0 1 1 2 0V7h3.5A5.5 5.5 0 0 1 26 12.5v8A5.5 5.5 0 0 1 20.5 26h-9A5.5 5.5 0 0 1 6 20.5v-8A5.5 5.5 0 0 1 11.5 7H15V4.5ZM11.5 9A3.5 3.5 0 0 0 8 12.5v8a3.5 3.5 0 0 0 3.5 3.5h9a3.5 3.5 0 0 0 3.5-3.5v-8A3.5 3.5 0 0 0 20.5 9h-9Zm1.75 8.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm7.25-1.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm-8.1 5.15a1 1 0 0 1 1.4-.2c1.3.98 3.1.98 4.4 0a1 1 0 1 1 1.2 1.6c-2.02 1.51-4.78 1.51-6.8 0a1 1 0 0 1-.2-1.4Z"/></svg>\`;
        }
        if (icon === "store") {
          return \`<svg viewBox="0 0 32 32" fill="none" role="img"><path fill="currentColor" d="M7.34 5h17.32c.86 0 1.62.55 1.9 1.36l1.36 4.08A4.52 4.52 0 0 1 24 16.35V25a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8.65a4.52 4.52 0 0 1-3.92-5.91l1.36-4.08A2 2 0 0 1 7.34 5ZM10 16.2V25h12v-8.8a4.5 4.5 0 0 1-3-1.2 4.48 4.48 0 0 1-6 0 4.5 4.5 0 0 1-3 1.2ZM7.34 7l-1.37 4.07A2.5 2.5 0 0 0 10.78 12a1 1 0 0 1 1.94 0 2.5 2.5 0 0 0 4.56 0 1 1 0 0 1 1.94 0A2.5 2.5 0 0 0 24.03 11.07L22.66 7H7.34Z"/></svg>\`;
        }
        return \`<svg viewBox="0 0 32 32" fill="none" role="img"><path fill="currentColor" d="M16.04 4.5c-6.32 0-11.46 4.95-11.46 11.04 0 2.12.63 4.18 1.82 5.95L4.5 27.5l6.35-1.78a11.75 11.75 0 0 0 5.19 1.21c6.32 0 11.46-4.95 11.46-11.04S22.36 4.5 16.04 4.5Zm0 20.34c-1.72 0-3.41-.45-4.88-1.31l-.38-.22-3.24.91.97-3.06-.25-.4a8.82 8.82 0 0 1-1.43-4.82c0-4.94 4.13-8.95 9.21-8.95s9.21 4.01 9.21 8.95-4.13 8.9-9.21 8.9Zm5.07-6.71c-.28-.14-1.66-.79-1.92-.88-.26-.09-.45-.14-.64.14-.19.27-.73.88-.9 1.06-.17.18-.33.2-.61.07-.28-.14-1.18-.42-2.25-1.34-.83-.72-1.39-1.6-1.55-1.87-.16-.27-.02-.42.12-.55.13-.12.28-.32.42-.48.14-.16.19-.27.28-.46.09-.18.05-.34-.02-.48-.07-.14-.64-1.48-.88-2.03-.23-.53-.47-.46-.64-.46h-.55c-.19 0-.5.07-.76.34-.26.27-1 1-1 2.42s1.03 2.81 1.18 3c.14.18 2.04 3.01 4.94 4.22.69.3 1.23.48 1.65.61.69.21 1.32.18 1.82.11.56-.08 1.66-.66 1.9-1.29.24-.64.24-1.18.17-1.29-.07-.11-.26-.18-.54-.32Z"/></svg>\`;
      };

      const renderBrandIcon = () => {
        const fallbackIcon = launcherIcon === "logo" ? "whatsapp" : launcherIcon;
        if (launcherIcon === "logo" && launcherLogoUrl) {
          return \`<div class="ai-saas-icon has-logo" aria-hidden="true">
            <canvas class="ai-saas-three-canvas"></canvas>
            <img class="ai-saas-launcher-logo" src="\${escapeHtml(launcherLogoUrl)}" alt="" loading="eager" decoding="async" onerror="this.closest('.ai-saas-icon').classList.remove('has-logo');this.remove();" />
            <span class="ai-saas-icon-fallback">\${renderLauncherSvg(fallbackIcon)}</span>
          </div>\`;
        }

        return \`<div class="ai-saas-icon" aria-hidden="true"><canvas class="ai-saas-three-canvas"></canvas>\${renderLauncherSvg(fallbackIcon)}</div>\`;
      };

      const renderCloseButton = (className) => \`
        <button id="ai-saas-close" class="\${className || ""}" type="button" aria-label="\${escapeHtml(copy.closeChat)}">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      \`;

      const renderMessageForm = () => \`
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
      \`;

      const renderAssistantSidebarItem = (label, icon) => \`
        <div class="ai-assistant-sidebar-item">
          <span class="ai-assistant-sidebar-icon" aria-hidden="true">\${icon}</span>
          <span>\${escapeHtml(label)}</span>
        </div>
      \`;

      const renderAssistantSidebar = () => \`
        <aside class="ai-assistant-sidebar" aria-label="Assistant navigation">
          <div class="ai-assistant-sidebar-top">
            <div class="ai-assistant-sidebar-brand">
              <strong>\${escapeHtml(brandName)}</strong>
              <span aria-hidden="true">[]</span>
            </div>
            <nav class="ai-assistant-sidebar-nav" aria-label="Assistant shortcuts">
              \${renderAssistantSidebarItem("Nuevo chat", "+")}
              \${renderAssistantSidebarItem("Buscar chats", "?")}
              \${renderAssistantSidebarItem("Biblioteca", "[]")}
              \${renderAssistantSidebarItem("Programadas", "o")}
              \${renderAssistantSidebarItem("Aplicaciones", "*")}
            </nav>
            <div class="ai-assistant-sidebar-group">
              <p>Anclado</p>
              \${renderAssistantSidebarItem("Soporte y ventas", "[]")}
              \${renderAssistantSidebarItem("Pedidos recientes", "[]")}
              \${renderAssistantSidebarItem("Catalogo 2026", "[]")}
            </div>
            <div class="ai-assistant-sidebar-group">
              <p>Proyectos</p>
              \${renderAssistantSidebarItem("Ecommerce", "[]")}
              \${renderAssistantSidebarItem("Clientes", "[]")}
            </div>
          </div>
          <div class="ai-assistant-sidebar-account">
            <span class="ai-assistant-avatar" aria-hidden="true">\${escapeHtml(brandInitial)}</span>
            <span>\${escapeHtml(brandName)}</span>
          </div>
        </aside>
      \`;

      const renderClassicWidget = () => \`
        <section id="ai-saas-widget" role="dialog" aria-modal="false" aria-labelledby="ai-saas-title" aria-hidden="true">
           <div id="ai-saas-header">
             <div class="ai-saas-brand">
               <div class="ai-saas-brand-icon" aria-hidden="true">\${escapeHtml(brandInitial)}</div>
               <div class="ai-saas-brand-text">
                 <strong id="ai-saas-title">\${escapeHtml(brandName)}</strong>
                 <span><span class="ai-saas-status-dot" aria-hidden="true"></span>\${escapeHtml(humanSupportText)}</span>
               </div>
             </div>
             \${renderCloseButton("")}
           </div>
           
           <div id="ai-saas-chat-box" role="log" aria-live="polite" aria-relevant="additions">
           </div>

           \${renderMessageForm()}
           
           <div class="ai-saas-powered">
             \${escapeHtml(copy.poweredBy)} <a href="https://agentes.elsaltoweb.es" target="_blank" rel="noopener noreferrer">AI SaaS</a>
           </div>
        </section>
      \`;

      const renderAssistantWidget = () => \`
        <section id="ai-saas-widget" role="dialog" aria-modal="true" aria-labelledby="ai-saas-title" aria-hidden="true">
          \${renderAssistantSidebar()}
          <main class="ai-assistant-main">
            <header id="ai-saas-header" class="ai-assistant-topbar">
              <div class="ai-saas-brand">
                <div class="ai-saas-brand-icon" aria-hidden="true">\${escapeHtml(brandInitial)}</div>
                <div class="ai-saas-brand-text">
                  <strong id="ai-saas-title">\${escapeHtml(brandName)}</strong>
                  <span><span class="ai-saas-status-dot" aria-hidden="true"></span>\${escapeHtml(humanSupportText)}</span>
                </div>
              </div>
              \${renderCloseButton("ai-assistant-close")}
            </header>
            <div class="ai-assistant-stage">
              <div id="ai-saas-chat-box" role="log" aria-live="polite" aria-relevant="additions">
                <div id="ai-saas-assistant-hero" class="ai-assistant-hero">
                  <h2>\${escapeHtml(greeting)}</h2>
                </div>
              </div>
              <div class="ai-assistant-composer">
                \${renderMessageForm()}
                <div id="ai-saas-suggestions-mount" class="ai-assistant-suggestions-mount"></div>
              </div>
            </div>
            <div class="ai-saas-powered">
              \${escapeHtml(copy.poweredBy)} <a href="https://agentes.elsaltoweb.es" target="_blank" rel="noopener noreferrer">AI SaaS</a>
            </div>
          </main>
        </section>
      \`;

      const isAssistantFormat = normalizeFormat(fullConfig.format) === "assistant";

      // 6. Build DOM
      anchor.innerHTML = \`
        <button id="ai-saas-toggle" type="button" aria-controls="ai-saas-widget" aria-expanded="false" aria-label="\${escapeHtml(copy.openChat)}">
          \${renderBrandIcon()}
          <span class="ai-saas-bubble-copy">
            <span class="ai-saas-bubble-title">\${escapeHtml(collapsedLabel)}</span>
            <span class="ai-saas-bubble-subtitle">\${escapeHtml(bubbleSubtitle)}</span>
          </span>
          <span class="ai-saas-label">\${escapeHtml(collapsedLabel)}</span>
        </button>
        \${isAssistantFormat ? renderAssistantWidget() : renderClassicWidget()}
      \`;

      document.body.appendChild(anchor);
      trackWidgetEvent("load");

      const refreshTheme = async () => {
        try {
          const freshConfig = await fetchConfig(CONFIG_KEY);
          fullConfig = mergeConfig(freshConfig || {});
          copy = getCopy(fullConfig.language);
          applyFormat(anchor, fullConfig.format);
          applyLauncherStyle(anchor, fullConfig);
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

      const setupThreeLauncher = async () => {
        const canvas = toggleBtn?.querySelector(".ai-saas-three-canvas");
        if (!canvas || canvas.dataset.aiThree === "ready" || canvas.dataset.aiThree === "loading") return;
        if (fullConfig.bubbleUseThree === false) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

        canvas.dataset.aiThree = "loading";

        try {
          const THREE = await import(new URL("/api/widget/three", API_BASE).toString());
          const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
          renderer.setClearColor(0x000000, 0);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
          camera.position.z = 5.8;

          const group = new THREE.Group();
          scene.add(group);

          const accent = normalizeHex(fullConfig.accent) || normalizeHex(fullConfig.appearance?.colorBubbleGlow) || "#8b5cf6";
          const iconColor = normalizeHex(fullConfig.appearance?.colorToggleText) || "#ffffff";

          const ringMaterial = new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.28,
          });
          const ringOne = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.018, 8, 80), ringMaterial);
          const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.014, 8, 64), ringMaterial.clone());
          ringTwo.material.opacity = 0.2;
          ringOne.rotation.x = 0.8;
          ringTwo.rotation.x = -0.72;
          ringTwo.rotation.y = 0.8;
          group.add(ringOne, ringTwo);

          const points = 34;
          const positions = new Float32Array(points * 3);
          for (let i = 0; i < points; i += 1) {
            const angle = (i / points) * Math.PI * 2;
            const radius = 0.35 + ((i * 37) % 100) / 100 * 1.25;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle * 1.7) * radius * 0.62;
            positions[i * 3 + 2] = (((i * 19) % 100) / 100 - 0.5) * 1.8;
          }

          const sparkleGeometry = new THREE.BufferGeometry();
          sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          const sparkleMaterial = new THREE.PointsMaterial({
            color: iconColor,
            size: 0.085,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
          });
          const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
          group.add(sparkles);

          const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(1, Math.round(rect.width));
            const height = Math.max(1, Math.round(rect.height));
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          };

          resize();
          const observer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
          observer?.observe(canvas);

          let frame = 0;
          const animate = (time) => {
            frame = window.requestAnimationFrame(animate);
            group.rotation.z = time * 0.00034;
            group.rotation.y = Math.sin(time * 0.00045) * 0.26;
            sparkles.rotation.z = -time * 0.00022;
            renderer.render(scene, camera);
          };

          canvas.dataset.aiThree = "ready";
          anchor.classList.add("ai-three-ready");
          frame = window.requestAnimationFrame(animate);

          window.addEventListener("pagehide", () => {
            if (frame) window.cancelAnimationFrame(frame);
            observer?.disconnect();
            renderer.dispose();
            ringOne.geometry.dispose();
            ringTwo.geometry.dispose();
            ringMaterial.dispose();
            ringTwo.material.dispose();
            sparkleGeometry.dispose();
            sparkleMaterial.dispose();
          }, { once: true });
        } catch (err) {
          canvas.dataset.aiThree = "failed";
          anchor.classList.remove("ai-three-ready");
        }
      };

      setupThreeLauncher();

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
        const suggestionsMount = document.getElementById("ai-saas-suggestions-mount");
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

        (suggestionsMount || chatBox).appendChild(suggestions);
        scrollChatToBottom();
      };

      const setSending = (sending) => {
        input.disabled = sending;
        submitBtn.disabled = sending || !input.value.trim();
        submitBtn.setAttribute("aria-busy", sending ? "true" : "false");
        form.classList.toggle("is-sending", sending);
      };
      
      let isOpen = false;
      const setPageScrollLock = (locked) => {
        const shouldLock = locked && normalizeFormat(fullConfig.format) === "assistant";
        document.documentElement.classList.toggle("ai-saas-page-locked", shouldLock);
        document.body.classList.toggle("ai-saas-page-locked", shouldLock);
      };

      const setOpen = (state) => {
        isOpen = state;
        toggleBtn.setAttribute("aria-expanded", state ? "true" : "false");
        toggleBtn.setAttribute("aria-label", state ? copy.chatOpen : copy.openChat);
        setPageScrollLock(state);
        if (state) {
          trackWidgetEvent("open");
          refreshTheme();
          anchor.classList.add("open");
          widget.setAttribute("aria-hidden", "false");
          window.setTimeout(() => input.focus(), 0);
        } else {
          anchor.classList.remove("open");
          widget.setAttribute("aria-hidden", "true");
          setPageScrollLock(false);
          toggleBtn.focus();
        }
      };

      if (!isAssistantFormat) {
        appendBotMessage(greeting);
      }
      appendSuggestions();

      if (isAssistantFormat && SHOULD_AUTO_OPEN) {
        window.setTimeout(() => setOpen(true), 0);
      }

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
        const userWordCount = countWords(text);
        const assistantHero = document.getElementById("ai-saas-assistant-hero");
        if (assistantHero) assistantHero.remove();
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
          trackWidgetEvent("message_sent", {
            wordCount: userWordCount,
          });

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
            if (isSupportIntent(text) || isSupportIntent(replyRaw)) {
              appendFallbackLink(botDiv, data.fallback_url, copy);
            }
          }
          chatBox.appendChild(botDiv);
          scrollChatToBottom();

        } catch (err) {
          trackWidgetEvent("message_failed", {
            wordCount: userWordCount,
          });
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
