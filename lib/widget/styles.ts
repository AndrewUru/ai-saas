import type { WidgetAppearance } from "./types";

export function renderStyles(a: WidgetAppearance) {
  return `

#ai-saas-anchor {
  position: fixed;
  bottom: 20px;
  ${a.position === "left" ? "left: 20px; right: auto;" : "right: 20px; left: auto;"}
  z-index: 2147483000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#ai-saas-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #25D366; /* WhatsApp Green */
  color: #fff;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

#ai-saas-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

#ai-saas-toggle .ai-saas-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#ai-saas-toggle .ai-saas-icon svg {
  width: 32px;
  height: 32px;
  fill: currentColor;
}

#ai-saas-toggle .ai-saas-label {
  display: none; /* Icon only for WhatsApp style usually */
}

#ai-saas-anchor.open #ai-saas-toggle {
  display: none;
}

#ai-saas-widget {
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 100px);
  background: #efe7dd; /* WhatsApp Beige */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
  bottom: 80px;
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
  background: #008069; /* WhatsApp Teal */
  color: #fff;
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
  color: #008069;
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
  color: #fff;
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
  padding: 20px 8%; /* Adjust side padding */
  flex: 1;
  overflow-y: auto;
  background-color: #efe7dd;
  background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png"); /* Subtle pattern optional, effectively beige solid if fails */
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
  margin-bottom: 8px; /* Tighter spacing */
  border-radius: 7.5px;
  font-size: 14.2px;
  line-height: 19px;
  color: #111b21;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
  word-wrap: break-word;
}

.ai-saas-bubble.user {
  margin-left: auto;
  background: #d9fdd3;
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
  border-top-color: #d9fdd3;
  border-left: 0;
  border-bottom: 0;
  margin-top: 0;
  margin-right: 0;
}

.ai-saas-bubble.bot {
  margin-right: auto;
  background: #ffffff;
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
  border-top-color: #ffffff;
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

@media (max-width: 480px) {
  #ai-saas-widget {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0 !important;
    left: 0 !important;
    width: 90%;
    height: 90%;
    max-width: none;
    max-height: none;
    border-radius: 0;
    transform: none !important; /* Prevent transform issues on mobile open */
  }
}
`;
}
