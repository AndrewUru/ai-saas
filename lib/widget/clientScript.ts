import type { WidgetConfig } from "./types";

export function renderWidgetScript(cfg: WidgetConfig, style: string) {
  const body = `
const ready = (fn) =>
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn)
    : fn();

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
  toggle.setAttribute("aria-label", "Open chat");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "ai-saas-widget");
  toggle.setAttribute("aria-controls", "ai-saas-widget");
  
  const escapeHtml = (text) => {
    if(!text) return "";
    return text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const getBubbleColors = () => {
    if(CONFIG.avatarType === "bubble" && CONFIG.bubbleColors && CONFIG.bubbleColors.length === 3) {
      return CONFIG.bubbleColors;
    }
    return ["#5eead4", "#818cf8", "#f472b6"]; // Defaults
  };

  const renderBrandIcon = () => {
    if (CONFIG.avatarType === "bubble") {
      const [c1, c2, c3] = getBubbleColors();
      const style = "background: linear-gradient(135deg, " + c1 + ", " + c2 + ", " + c3 + "); --c1: " + c1 + "; --c2: " + c2 + "; --c3: " + c3;
      const bubbleClass = "ai-saas-brand-icon ai-avatar-bubble ai-avatar-bubble--" + (CONFIG.bubbleStyle || "default");
      return '<span class="' + bubbleClass + '" style="' + style + '" aria-hidden="true"></span>';
    }
    return '<span class="ai-saas-brand-icon">' + escapeHtml(CONFIG.brandInitial) + '</span>';
  };

  toggle.innerHTML = renderBrandIcon() + '<span class="ai-saas-label">' + escapeHtml(CONFIG.collapsedLabel) + '</span>';
  anchor.appendChild(toggle);

  const widget = document.createElement("section");
  widget.id = "ai-saas-widget";
  widget.setAttribute("role", "dialog");
  widget.setAttribute("aria-label", CONFIG.brandName + " chat");
  widget.setAttribute("aria-hidden", "true");
  widget.innerHTML =
    '<header id="ai-saas-header">' +
      '<div class="ai-saas-brand">' +
      '<div class="ai-saas-brand">' +
        renderBrandIcon() +
        '<div class="ai-saas-brand-text"><strong>' + escapeHtml(CONFIG.brandName) + '</strong><span>' + escapeHtml(CONFIG.greeting) + '</span></div>' +
      '</div>' +
      '<button type="button" id="ai-saas-close" aria-label="Minimize">' +
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>' +
    '</header>' +
    '<div id="ai-saas-chat-box" aria-live="polite"></div>' +
    '<form id="ai-saas-form">' +
      '<div class="ai-saas-input-wrapper">' +
        '<input id="ai-saas-input" type="text" placeholder="Your message..." autocomplete="off" />' +
        '<button type="submit" class="ai-saas-send"><span class="ai-saas-send-text">Send</span><svg class="ai-saas-send-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m0 0-4-4m4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></button>' +
      '</div>' +
    '</form>';
  anchor.appendChild(widget);
  widget.style.display = "none";

  const chatBox = widget.querySelector("#ai-saas-chat-box");
  const form = widget.querySelector("#ai-saas-form");
  const input = widget.querySelector("#ai-saas-input");
  const closeBtn = widget.querySelector("#ai-saas-close");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const submitLabel = submitBtn?.querySelector(".ai-saas-send-text");

  if (!chatBox || !form || !input || !closeBtn || !submitBtn) return;

  let isSending = false;
  const defaultButtonLabel =
    submitLabel?.textContent || submitBtn.textContent || "Send";

  let hideTimeout;

  function setSending(state){
    isSending = state;
    submitBtn.disabled = state;
    if (submitLabel) {
      submitLabel.textContent = state ? "Sending..." : defaultButtonLabel;
    } else {
      submitBtn.textContent = state ? "Sending..." : defaultButtonLabel;
    }
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
        toggle.setAttribute("aria-expanded", "true");
        widget.setAttribute("aria-hidden", "false");
        
        // Trigger pulse
        const bubbles = document.querySelectorAll(".ai-avatar-bubble");
        bubbles.forEach(b => {
            b.classList.remove("is-active");
            void b.offsetWidth; // force reflow
            b.classList.add("is-active");
            setTimeout(() => b.classList.remove("is-active"), 600);
        });

        focusInput();
      });
    } else {
      anchor.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      widget.setAttribute("aria-hidden", "false");
      focusInput();
    }
  }

  function closeWidget(){
    anchor.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    widget.setAttribute("aria-hidden", "true");
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
    bubble.className = "ai-saas-bubble " + role + " ai-saas-enter";
    bubble.textContent = content;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    return bubble;
  }

  function appendTyping(){
    const bubble = document.createElement("div");
    bubble.className = "ai-saas-bubble bot typing ai-saas-enter";
    bubble.innerHTML =
      '<div class="ai-saas-typing"><span></span><span></span><span></span></div>' +
      '<div class="ai-saas-typing-skeleton">' +
        '<span class="ai-saas-skeleton-line"></span>' +
        '<span class="ai-saas-skeleton-line short"></span>' +
      "</div>";
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    return bubble;
  }

  function safeParseJson(text){
    if (!text || typeof text !== "string") return null;
    const trimmed = text.trim();
    if (!trimmed.startsWith("{")) return null;
    try{
      return JSON.parse(trimmed);
    }catch{
      return null;
    }
  }

  function normalizeUrl(value){
    if (typeof value !== "string" || !value.trim()) return null;
    try{
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      return url.toString();
    }catch{
      return null;
    }
  }

  function normalizeProductItem(item){
    if (!item || typeof item !== "object") return null;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) return null;
    const price = typeof item.price === "string" ? item.price.trim() : "";
    const currency = typeof item.currency === "string" ? item.currency.trim() : "";
    const stock = typeof item.stock_status === "string" ? item.stock_status : "";
    return {
      id: item.id,
      name,
      price: price || null,
      currency: currency || null,
      permalink: normalizeUrl(item.permalink),
      image: normalizeUrl(item.image),
      stock_status: stock || null,
    };
  }

  function formatPrice(price, currency){
    if (!price) return "Consult price";
    if (!currency) return price;
    const hasLetters = /[A-Za-z]/.test(currency);
    return hasLetters ? price + " " + currency : currency + price;
  }

  function parseProductListPayload(text){
    const payload = safeParseJson(text);
    if (!payload || payload.type !== "product_list") return null;
    if (!Array.isArray(payload.items)) return null;
    const items = payload.items
      .map(normalizeProductItem)
      .filter(Boolean);
    if (!items.length) return null;
    return {
      title: typeof payload.title === "string" ? payload.title : "Products",
      items,
    };
  }

  function createProductCard(item){
    const card = document.createElement("article");
    card.className = "ai-saas-product-card";

    const thumb = document.createElement("div");
    thumb.className = "ai-saas-product-thumb";
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      img.loading = "lazy";
      thumb.appendChild(img);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "ai-saas-product-thumb-fallback";
      placeholder.textContent = item.name.slice(0, 1).toUpperCase();
      thumb.appendChild(placeholder);
    }

    const body = document.createElement("div");
    body.className = "ai-saas-product-body";

    const title = document.createElement("h4");
    title.className = "ai-saas-product-title";
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "ai-saas-product-meta";

    const price = document.createElement("span");
    price.className = "ai-saas-product-price";
    price.textContent = formatPrice(item.price, item.currency);

    const stock = document.createElement("span");
    stock.className = "ai-saas-product-stock";
    stock.textContent = item.stock_status ? item.stock_status : "stock";

    meta.appendChild(price);
    meta.appendChild(stock);

    body.appendChild(title);
    body.appendChild(meta);

    if (item.permalink) {
      const link = document.createElement("a");
      link.className = "ai-saas-product-link";
      link.href = item.permalink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ver producto";
      body.appendChild(link);
    }

    card.appendChild(thumb);
    card.appendChild(body);
    return card;
  }

  function appendProductList(payload){
    const bubble = document.createElement("div");
    bubble.className = "ai-saas-bubble bot product-list ai-saas-enter";
    bubble.setAttribute("role", "group");
    bubble.setAttribute("aria-label", payload.title);

    const header = document.createElement("div");
    header.className = "ai-saas-product-list-header";
    header.textContent = payload.title;

    const grid = document.createElement("div");
    grid.className = "ai-saas-product-list-grid";
    payload.items.forEach((item, index) => {
      const card = createProductCard(item);
      card.classList.add("ai-saas-enter");
      card.style.setProperty("--enter-delay", index * 60 + "ms");
      grid.appendChild(card);
    });

    bubble.appendChild(header);
    bubble.appendChild(grid);
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    return bubble;
  }

  function showFallback(url){
    if (!url) return;
    try{
      const link = document.createElement("a");
      link.className = "ai-saas-fallback";
      link.classList.add("ai-saas-enter");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-4a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 00-1 1v3a1 1 0 002 0v-3a1 1 0 00-1-1z" fill="currentColor"/></svg><span>Talk to a person</span>';
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
        const payload = parseProductListPayload(data.reply);
        if (payload) {
          typingBubble.remove();
          appendProductList(payload);
        } else {
          typingBubble.textContent = data.reply;
        }
      } else {
        typingBubble.textContent = data.error || "We couldn't get a response.";
        typingBubble.classList.add("ai-saas-error");
        if (data.fallback_url) {
          showFallback(data.fallback_url);
        }
      }
    } catch (err){
      console.error("[AI SaaS] fetch error", err);
      typingBubble.classList.remove("typing");
      typingBubble.textContent = "Error connecting to the agent.";
      typingBubble.classList.add("ai-saas-error");
    } finally {
      setSending(false);
      input.focus();
    }
  });

  // Simple control API
  const win = window;
  win.aiSaasWidget = {
    open: openWidget,
    close: closeWidget,
  };
  // ADDING CSS FOR BUBBLE
  const styleEl = document.getElementById("ai-saas-style");
  if(styleEl && !styleEl.innerHTML.includes(".ai-avatar-bubble")) {
      styleEl.innerHTML += \`
        .ai-avatar-bubble {
            width: 34px;
            height: 34px;
            border-radius: 9999px;
            background-size: 200% 200%;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            display: inline-block;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            animation: gradientMove 6s ease infinite;
        }

        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Pulse Animation */
        .ai-avatar-bubble.is-active {
            animation: bubblePulse 0.4s cubic-bezier(0, 0, 0.2, 1);
        }

        @keyframes bubblePulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
            70% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }

        /* Energy Style - Spin */
        .ai-avatar-bubble--energy::before {
            content: "";
            position: absolute;
            inset: -2px;
            background: conic-gradient(from 0deg, transparent 0deg, var(--c2) 360deg);
            animation: bubbleSpin 3s linear infinite;
            opacity: 0.3;
            border-radius: 999px;
        }
        @keyframes bubbleSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Calm Style - Float */
        .ai-avatar-bubble--calm {
            animation: gradientMove 10s ease infinite, bubbleFloat 4s ease-in-out infinite;
        }
        @keyframes bubbleFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }

        @media (prefers-reduced-motion: reduce) {
            .ai-avatar-bubble, .ai-avatar-bubble::before, .ai-avatar-bubble.is-active {
                animation: none !important;
                transition: none !important;
            }
        }
      \`;
  }
});
`;

  return `(function(){const CONFIG=${JSON.stringify(
    cfg
  )};const STYLE=${JSON.stringify(style)};${body}})();`;
}
