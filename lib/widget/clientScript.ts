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
      '<button type="button" id="ai-saas-close" aria-label="Minimize">' +
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>' +
    '</header>' +
    '<div id="ai-saas-chat-box" aria-live="polite"></div>' +
    '<form id="ai-saas-form">' +
      '<div class="ai-saas-input-wrapper">' +
        '<input id="ai-saas-input" type="text" placeholder="Your message..." autocomplete="off" />' +
        '<button type="submit">Send</button>' +
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
    submitBtn.textContent = state ? "Sending..." : defaultButtonLabel;
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
    const stock = typeof item.stock_status === "string" ? item.stock_status : "";
    return {
      id: item.id,
      name,
      price: price || null,
      permalink: normalizeUrl(item.permalink),
      image: normalizeUrl(item.image),
      stock_status: stock || null,
    };
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
    price.textContent = item.price ? item.price : "Consult price";

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
    bubble.className = "ai-saas-bubble bot product-list";
    bubble.setAttribute("role", "group");
    bubble.setAttribute("aria-label", payload.title);

    const header = document.createElement("div");
    header.className = "ai-saas-product-list-header";
    header.textContent = payload.title;

    const grid = document.createElement("div");
    grid.className = "ai-saas-product-list-grid";
    payload.items.forEach((item) => {
      grid.appendChild(createProductCard(item));
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
});
`;

  return `(function(){const CONFIG=${JSON.stringify(
    cfg
  )};const STYLE=${JSON.stringify(style)};${body}})();`;
}
