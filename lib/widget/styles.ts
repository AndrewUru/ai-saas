import type { WidgetAppearance } from "./types";

export function renderStyles(a: WidgetAppearance) {
  return `

#ai-saas-anchor {
  position: fixed;
  bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  ${
    a.position === "left"
      ? "left: 18px; right: auto;"
      : "right: 18px; left: auto;"
  }
  display: flex;
  flex-direction: column;
  align-items: ${a.position === "left" ? "flex-start" : "flex-end"};
  gap: 12px;
  z-index: 2147483000;
  font-family: "Sora", "Space Grotesk", "Avenir Next", "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

#ai-saas-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 52px;
  padding: 0 16px;
  background: ${a.colorToggleBg};
  color: ${a.colorToggleText};
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

#ai-saas-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
  border-color: rgba(15, 23, 42, 0.18);
}

#ai-saas-toggle .ai-saas-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.12);
  font-weight: 600;
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), #ffffff);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(14px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
  bottom: 88px;
  ${a.position === "left" ? "left: 0;" : "right: 0;"}
}

#ai-saas-anchor.open #ai-saas-widget {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
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
  padding: 10px 14px;
  background: ${a.colorHeaderBg};
  background-image: linear-gradient(120deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.08));
  color: ${a.colorHeaderText};
  height: 54px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.ai-saas-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.ai-saas-brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: transparent;
  color: ${a.colorHeaderText};
  border: 1px solid rgba(15, 23, 42, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
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
  background: transparent;
  color: ${a.colorHeaderText};
  border: 1px solid rgba(15, 23, 42, 0.12);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

#ai-saas-close:hover {
  background: rgba(15, 23, 42, 0.06);
}

#ai-saas-chat-box {
  padding: 18px min(7%, 28px);
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${a.colorChatBg};
  background-image:
    radial-gradient(circle at 15% 20%, ${a.accentLight}, transparent 60%),
    radial-gradient(circle at 85% 0%, rgba(15, 23, 42, 0.06), transparent 45%);
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
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.ai-saas-bubble {
  position: relative;
  max-width: 82%;
  padding: 10px 14px;
  margin-bottom: 0;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ai-saas-bubble.user {
  margin-left: auto;
  align-self: flex-end;
  background: ${a.colorUserBubbleBg};
  color: ${a.colorUserBubbleText};
  border-color: transparent;
  border-bottom-right-radius: 6px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
}

.ai-saas-bubble.bot {
  margin-right: auto;
  align-self: flex-start;
  background: ${a.colorBotBubbleBg};
  color: ${a.colorBotBubbleText};
  border-bottom-left-radius: 6px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
}

.ai-saas-bubble.bot.product-list {
  max-width: 100%;
  width: 100%;
  padding: 12px 12px 14px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-saas-bubble.typing {
  background: #ffffff;
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

#ai-saas-form {
  padding: 12px 14px;
  background: #ffffff;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -10px 22px rgba(15, 23, 42, 0.04);
}

.ai-saas-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 8px 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06);
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
}

.ai-saas-input-wrapper input::placeholder {
  color: #94a3b8;
}

.ai-saas-input-wrapper button {
  background: ${a.accent};
  border: none;
  cursor: pointer;
  color: ${a.accentContrast};
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 6px 14px ${a.accentShadow};
}

.ai-saas-input-wrapper button:hover {
  transform: translateY(-1px);
}

.ai-saas-input-wrapper button:disabled {
  opacity: 0.65;
  cursor: default;
  box-shadow: none;
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
  color: ${a.accent};
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
}
.ai-saas-fallback:hover {
  text-decoration: underline;
}

.ai-saas-fallback svg {
  width: 16px;
  height: 16px;
}

.ai-saas-product-list-header {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0;
}

.ai-saas-product-list-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.ai-saas-product-card {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-saas-product-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.ai-saas-product-thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: ${a.accentLight};
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
  color: ${a.accentContrast};
  background: ${a.accentGradient};
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
  color: ${a.accent};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ai-saas-product-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  #ai-saas-widget {
    position: fixed;
    left: 12px;
    right: 12px;
    width: auto;
    height: min(60vh, 320px);
    max-height: calc(100vh - 100px);
    bottom: calc(70px + env(safe-area-inset-bottom, 0px));
    border-radius: 16px;
    transform: translateY(0) scale(0.98);
  }

  #ai-saas-toggle {
    width: 100%;
    min-height: 54px;
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
}
