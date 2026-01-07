export const STATIC_STYLES = `
#ai-saas-anchor {
  --ai-accent-gradient: linear-gradient(135deg, #34d399, #8b5cf6);
  --ai-accent-contrast: #0b1220;
  --ai-accent-shadow: rgba(52, 211, 153, 0.25);
  position: fixed;
  bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2147483000;
  font-family: "Space Grotesk", "Sora", "Avenir Next", "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

#ai-saas-anchor.ai-pos-right {
  right: 18px;
  left: auto;
  align-items: flex-end;
}

#ai-saas-anchor.ai-pos-left {
  left: 18px;
  right: auto;
  align-items: flex-start;
}

/* CSS Variables are set on element via JS */

#ai-saas-toggle {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 54px;
  padding: 0 18px;
  background: var(--ai-toggle-bg);
  color: var(--ai-toggle-text);
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  gap: 10px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
  transition: transform 0.16s ease, box-shadow 0.22s ease,
    border-color 0.22s ease;
}

#ai-saas-toggle::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.28), transparent 55%),
    radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.2), transparent 60%);
  opacity: 0.8;
  pointer-events: none;
}

#ai-saas-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
  border-color: rgba(15, 23, 42, 0.22);
}

#ai-saas-toggle:focus-visible {
  outline: 2px solid var(--ai-accent);
  outline-offset: 3px;
}

#ai-saas-toggle .ai-saas-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
}

#ai-saas-toggle .ai-saas-icon svg {
  display: none;
}

#ai-saas-toggle .ai-saas-label {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

#ai-saas-anchor.open #ai-saas-toggle {
  display: none;
}

#ai-saas-widget {
  width: clamp(360px, 32vw + 120px, 520px);
  max-width: min(540px, calc(100vw - 48px));
  height: clamp(480px, 62vh, 720px);
  max-height: min(78vh, 820px);
  background:
    linear-gradient(180deg, var(--ai-surface-strong), var(--ai-surface)),
    radial-gradient(circle at 10% 0%, rgba(255, 255, 255, 0.6), transparent 45%),
    radial-gradient(circle at 100% 0%, var(--ai-accent-light), transparent 50%);
  border-radius: var(--ai-radius);
  overflow: hidden;
  border: 1px solid var(--ai-border);
  box-shadow: var(--ai-shadow);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.22s ease, box-shadow 0.22s ease;
  position: absolute;
  bottom: 88px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

#ai-saas-anchor.ai-pos-right #ai-saas-widget {
    right: 0;
}
#ai-saas-anchor.ai-pos-left #ai-saas-widget {
    left: 0;
}

#ai-saas-widget::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.35), transparent 45%),
    linear-gradient(120deg, rgba(15, 23, 42, 0.04), transparent 45%);
  opacity: 0.8;
  pointer-events: none;
}

#ai-saas-widget > * {
  position: relative;
  z-index: 1;
}

#ai-saas-anchor.open #ai-saas-widget {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  animation: widgetPop 0.24s ease;
}
  /* Laptops con poca altura (ej: 768px o menos) */
@media (max-height: 800px) {
  #ai-saas-widget {
    height: min(620px, 68vh);
    max-height: 68vh;
  }
}

#ai-saas-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--ai-header-bg);
  background-image: linear-gradient(120deg, rgba(255, 255, 255, 0.16), rgba(0, 0, 0, 0.22));
  color: var(--ai-header-text);
  height: 56px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.ai-saas-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.ai-saas-brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  color: var(--ai-header-text);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.ai-saas-brand-text {
  display: flex;
  flex-direction: column;
}

.ai-saas-brand-text strong {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.ai-saas-brand-text span {
  font-size: 12px;
  opacity: 0.72;
}

#ai-saas-close {
  background: var(--ai-close-bg);
  color: var(--ai-header-text);
  border: 1px solid rgba(255, 255, 255, 0.35);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

#ai-saas-close:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
  filter: brightness(1.05);
}

#ai-saas-close:focus-visible {
  outline: 2px solid var(--ai-accent);
  outline-offset: 2px;
}

#ai-saas-chat-box {
  padding: 18px min(7%, 28px);
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--ai-chat-bg);
  background-image:
    radial-gradient(circle at 12% 18%, var(--ai-accent-light), transparent 55%),
    radial-gradient(circle at 88% 8%, rgba(15, 23, 42, 0.08), transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent 45%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(15, 23, 42, 0.2) transparent;
}

#ai-saas-chat-box::-webkit-scrollbar {
  width: 6px;
}

#ai-saas-chat-box::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.24);
  border-radius: 3px;
}

.ai-saas-bubble {
  position: relative;
  max-width: 82%;
  padding: 10px 14px;
  margin-bottom: 0;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ai-bot-text);
  background: var(--ai-bot-bg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ai-saas-enter {
  animation: bubbleIn 0.24s ease both;
  animation-delay: var(--enter-delay, 0ms);
}

.ai-saas-bubble.user {
  margin-left: auto;
  align-self: flex-end;
  background: var(--ai-user-bg);
  color: var(--ai-user-text);
  border-color: transparent;
  border-bottom-right-radius: 6px;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.12);
}

.ai-saas-bubble.bot {
  margin-right: auto;
  align-self: flex-start;
  background: var(--ai-bot-bg);
  color: var(--ai-bot-text);
  border-bottom-left-radius: 6px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
}

.ai-saas-bubble.bot.product-list {
  max-width: 100%;
  width: 100%;
  padding: 12px 12px 14px;
  background: var(--ai-surface-strong);
  border-color: rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-saas-bubble.typing {
  background: var(--ai-surface-strong);
  border: 1px solid rgba(15, 23, 42, 0.08);
  width: clamp(180px, 60%, 260px);
  min-width: 180px;
  display: grid;
  gap: 8px;
  align-items: center;
  justify-items: start;
  padding: 12px 14px;
}

.ai-saas-typing {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-saas-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8696a0;
  animation: typing 1.4s infinite ease-in-out both;
}

.ai-saas-typing span:nth-child(1) { animation-delay: -0.32s; }
.ai-saas-typing span:nth-child(2) { animation-delay: -0.16s; }

.ai-saas-typing-skeleton {
  display: grid;
  gap: 6px;
  width: 100%;
}

.ai-saas-skeleton-line {
  height: 8px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #e2e8f0 20%, #f8fafc 50%, #e2e8f0 80%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.ai-saas-skeleton-line.short {
  width: 60%;
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

#ai-saas-widget,
.ai-saas-bubble,
.ai-saas-product-card {
  transform-origin: center bottom;
}

@keyframes widgetPop {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bubbleIn {
  0% {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

#ai-saas-form {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(15, 23, 42, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -10px 22px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.ai-saas-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 8px 10px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-saas-input-wrapper:focus-within {
  border-color: var(--ai-accent);
  box-shadow: 0 0 0 3px var(--ai-accent-light);
}

.ai-saas-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  background: transparent;
  color: #0f172a;
  padding: 4px 0;
  line-height: 1.4;
}

.ai-saas-input-wrapper input::placeholder {
  color: #94a3b8;
}

.ai-saas-input-wrapper button {
  background: var(--ai-accent-gradient, linear-gradient(135deg, #34d399, #8b5cf6));
  color: var(--ai-accent-contrast, #0b1220);
  box-shadow: 0 8px 18px var(--ai-accent-shadow, rgba(52, 211, 153, 0.25));

  border: none;
  cursor: pointer;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 32px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}


.ai-saas-input-wrapper button:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.ai-saas-input-wrapper button:focus-visible {
  outline: 2px solid var(--ai-accent);
  outline-offset: 2px;
}

.ai-saas-input-wrapper button:disabled {
  opacity: 0.65;
  cursor: default;
  box-shadow: none;
}

.ai-saas-send-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
}

/* Fallback/Error Styles in Bubble */
.ai-saas-bubble.ai-saas-error {
  background: #fff1f2;
  color: #9f1239;
  border-color: rgba(159, 18, 57, 0.15);
}

.ai-saas-fallback {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-accent);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: background 0.2s ease, transform 0.2s ease;
}
.ai-saas-fallback:hover {
  text-decoration: underline;
  background: rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
}

.ai-saas-fallback svg {
  width: 16px;
  height: 16px;
}

.ai-saas-product-list-header {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ai-saas-product-list-header::before {
  content: "";
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--ai-accent);
  opacity: 0.6;
}

.ai-saas-product-list-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.ai-saas-product-card {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.ai-saas-product-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14);
  border-color: rgba(15, 23, 42, 0.14);
}

.ai-saas-product-thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--ai-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-saas-product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ai-saas-product-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--ai-accent-contrast);
  background: var(--ai-accent-gradient);
}

.ai-saas-product-body {
  display: grid;
  gap: 6px;
}

.ai-saas-product-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-saas-product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-saas-product-price {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

.ai-saas-product-stock {
  font-size: 11px;
  color: #64748b;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.ai-saas-product-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-accent);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ai-saas-product-link:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  #ai-saas-widget,
  #ai-saas-toggle,
  .ai-saas-bubble,
  .ai-saas-product-card,
  .ai-saas-enter {
    animation: none !important;
    transition: none !important;
  }

  .ai-saas-typing span,
  .ai-saas-skeleton-line {
    animation: none !important;
  }
}

@media (max-width: 640px) {
  #ai-saas-widget {
    position: fixed;
    left: 12px;
    right: 12px;
    width: auto;

    /* ✅ casi full-screen en móvil (mejor UX) */
    top: calc(44px + env(safe-area-inset-top, 0px));
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    height: auto;
    max-height: none;

    border-radius: var(--ai-radius);
    transform: translateY(0) scale(1);
  }

  #ai-saas-toggle {
    width: 100%;
    min-height: 56px;
    justify-content: center;
    padding: 0 16px;
  }

  #ai-saas-toggle .ai-saas-label {
    display: inline-flex;
    font-size: 14px;
  }

  .ai-saas-product-list-grid {
    grid-template-columns: 1fr;
  }

  .ai-saas-product-card {
    grid-template-columns: 52px 1fr;
    padding: 8px;
  }

  .ai-saas-product-thumb {
    width: 52px;
    height: 52px;
    border-radius: 10px;
  }
}
`;
