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
  min-width: 56px;
  height: 56px;
  padding: 0 18px;
  background: linear-gradient(135deg, ${a.colorToggleBg}, ${a.accent});
  color: ${a.colorToggleText};
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  box-shadow: 0 10px 28px ${a.accentShadow};
  gap: 10px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.01em;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  backdrop-filter: blur(6px);
}

#ai-saas-toggle:hover {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 12px 32px ${a.accentShadow};
  filter: brightness(1.02);
}

#ai-saas-toggle .ai-saas-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-weight: 700;
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
  height: clamp(520px, 70vh, 760px);
  max-height: min(88vh, 820px);
  background: #f8fafc;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(18px) scale(0.96);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
  bottom: 88px;
  ${a.position === "left" ? "left: 0;" : "right: 0;"}
}

#ai-saas-anchor.open #ai-saas-widget {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

#ai-saas-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: ${a.colorHeaderBg};
  color: ${a.colorHeaderText};
  height: 60px;
}

.ai-saas-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.ai-saas-brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  color: ${a.colorHeaderBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.ai-saas-brand-text {
  display: flex;
  flex-direction: column;
}

.ai-saas-brand-text strong {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.ai-saas-brand-text span {
  font-size: 13px;
  opacity: 0.8;
}

#ai-saas-close {
  background: transparent;
  color: ${a.colorHeaderText};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

#ai-saas-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

#ai-saas-chat-box {
  padding: 18px min(7%, 32px);
  flex: 1;
  overflow-y: auto;
  background-color: ${a.colorChatBg};
  background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
  background-repeat: repeat;
  background-size: 400px;
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
  max-width: 80%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 7.5px;
  font-size: 14.2px;
  line-height: 19px;
  color: #111b21;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
  word-wrap: break-word;
}

.ai-saas-bubble.user {
  margin-left: auto;
  background: ${a.colorUserBubbleBg};
  color: ${a.colorUserBubbleText};
  border-top-right-radius: 0;
}

.ai-saas-bubble.user::after {
  content: "";
  position: absolute;
  top: 0;
  right: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-top-color: ${a.colorUserBubbleBg};
  border-left: 0;
  border-bottom: 0;
  margin-top: 0;
  margin-right: 0;
}

.ai-saas-bubble.bot {
  margin-right: auto;
  background: ${a.colorBotBubbleBg};
  color: ${a.colorBotBubbleText};
  border-top-left-radius: 0;
}

.ai-saas-bubble.bot::before {
  content: "";
  position: absolute;
  top: 0;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-top-color: ${a.colorBotBubbleBg};
  border-right: 0;
  border-bottom: 0;
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
  padding: 10px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-saas-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 24px;
  padding: 8px 16px;
}

.ai-saas-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: #111b21;
  padding: 4px 0;
}

.ai-saas-input-wrapper input::placeholder {
  color: #8696a0;
}

.ai-saas-input-wrapper button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #54656f;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.ai-saas-input-wrapper button:hover {
  color: #008069;
}

.ai-saas-input-wrapper button:disabled {
  color: #aebac1;
  cursor: default;
}

/* Fallback/Error Styles in Bubble */
.ai-saas-bubble.ai-saas-error {
  background: #fdf2f2;
  color: #a02222;
}

.ai-saas-fallback {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #027eb5;
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
