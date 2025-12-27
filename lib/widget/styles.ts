import type { WidgetAppearance } from "./types";

export function renderStyles(a: WidgetAppearance) {
  return `

#ai-saas-anchor {
  position: fixed;
  bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  ${a.position === "left" ? "left: 18px; right: auto;" : "right: 18px; left: auto;"}
  display: flex;
  flex-direction: column;
  align-items: ${a.position === "left" ? "flex-start" : "flex-end"};
  gap: 12px;
  z-index: 2147483000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  background: #ffffff;
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
  padding: 16px min(7%, 28px);
  flex: 1;
  overflow-y: auto;
  background-color: ${a.colorChatBg};
  background-image: none;
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
  max-width: 78%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 20px;
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: none;
  word-wrap: break-word;
}

.ai-saas-bubble.user {
  margin-left: auto;
  background: ${a.colorUserBubbleBg};
  color: ${a.colorUserBubbleText};
}

.ai-saas-bubble.bot {
  margin-right: auto;
  background: ${a.colorBotBubbleBg};
  color: ${a.colorBotBubbleText};
}

.ai-saas-bubble.typing {
  background: #ffffff;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
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

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

#ai-saas-form {
  padding: 10px 12px;
  background: #ffffff;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-saas-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.ai-saas-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  color: #0f172a;
  padding: 4px 0;
}

.ai-saas-input-wrapper input::placeholder {
  color: #94a3b8;
}

.ai-saas-input-wrapper button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #475569;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.ai-saas-input-wrapper button:hover {
  color: ${a.accent};
}

.ai-saas-input-wrapper button:disabled {
  color: #aebac1;
  cursor: default;
}

/* Fallback/Error Styles in Bubble */
.ai-saas-bubble.ai-saas-error {
  background: #fff1f2;
  color: #9f1239;
  border-color: rgba(159, 18, 57, 0.15);
}

.ai-saas-fallback {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${a.accent};
  text-decoration: none;
}
.ai-saas-fallback:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  #ai-saas-widget {
    position: fixed;
    left: 12px;
    right: 12px;
    width: auto;
    height: min(50vh, 320px);
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
}
`;
}
