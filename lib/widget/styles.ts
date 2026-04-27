export const STATIC_STYLES = `
#ai-saas-anchor {
  --ai-accent: #2563eb;
  --ai-accent-gradient: linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(37, 99, 235, 0.42));
  --ai-accent-contrast: #f8fafc;
  --ai-accent-shadow: rgba(37, 99, 235, 0.28);
  --ai-accent-light: rgba(37, 99, 235, 0.14);
  --ai-surface: #f8fafc;
  --ai-surface-strong: #ffffff;
  --ai-border: rgba(15, 23, 42, 0.14);
  --ai-shadow: 0 24px 70px rgba(15, 23, 42, 0.24), 0 10px 26px rgba(15, 23, 42, 0.12);
  --ai-soft-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  --ai-header-bg: #0f172a;
  --ai-header-text: #ffffff;
  --ai-chat-bg: #f1f5f9;
  --ai-user-bg: #2563eb;
  --ai-user-text: #ffffff;
  --ai-bot-bg: #ffffff;
  --ai-bot-text: #0f172a;
  --ai-toggle-bg: #0f172a;
  --ai-toggle-text: #ffffff;
  --ai-close-bg: rgba(255, 255, 255, 0.24);
  --ai-close-text: #ffffff;
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2147483000;
  color: #0f172a;
  font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

#ai-saas-anchor,
#ai-saas-anchor * {
  box-sizing: border-box;
}

#ai-saas-anchor.ai-pos-right {
  right: max(18px, env(safe-area-inset-right, 0px));
  left: auto;
  align-items: flex-end;
}

#ai-saas-anchor.ai-pos-left {
  left: max(18px, env(safe-area-inset-left, 0px));
  right: auto;
  align-items: flex-start;
}

#ai-saas-toggle {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: calc(100vw - 36px);
  min-width: 58px;
  min-height: 56px;
  padding: 0 18px;
  background: var(--ai-toggle-bg);
  color: var(--ai-toggle-text);
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  gap: 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  transition: transform 0.16s ease, box-shadow 0.22s ease, border-color 0.22s ease, filter 0.22s ease;
}

#ai-saas-toggle::after {
  content: "";
  position: absolute;
  top: 9px;
  right: 12px;
  z-index: 2;
  width: 9px;
  height: 9px;
  border: 2px solid var(--ai-toggle-bg);
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

#ai-saas-toggle::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0));
  pointer-events: none;
}

#ai-saas-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.28);
  filter: saturate(1.04);
}

#ai-saas-toggle:focus-visible,
#ai-saas-close:focus-visible,
.ai-saas-input-wrapper button:focus-visible,
.ai-pl-link:focus-visible .ai-pl-item {
  outline: 2px solid var(--ai-accent);
  outline-offset: 3px;
}

#ai-saas-toggle .ai-saas-icon {
  position: relative;
  z-index: 1;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.32);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

#ai-saas-toggle .ai-saas-label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 168px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#ai-saas-anchor.open #ai-saas-toggle {
  display: none;
}

#ai-saas-widget {
  position: absolute;
  bottom: 0;
  width: clamp(360px, 34vw, 480px);
  max-width: min(480px, calc(100vw - 48px));
  height: clamp(500px, 70vh, 720px);
  max-height: min(760px, calc(100dvh - 112px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow: clip;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), var(--ai-surface));
  border: 1px solid var(--ai-border);
  border-radius: 22px;
  box-shadow: var(--ai-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(0, 14px, 0) scale(0.98);
  transform-origin: center bottom;
  transition: opacity 0.2s ease, transform 0.22s ease, box-shadow 0.22s ease, visibility 0s linear 0.22s;
  will-change: transform, opacity;
  contain: layout paint style;
  isolation: isolate;
}

#ai-saas-anchor.ai-pos-right #ai-saas-widget {
  right: 0;
}

#ai-saas-anchor.ai-pos-left #ai-saas-widget {
  left: 0;
}

#ai-saas-anchor.open #ai-saas-widget {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0) scale(1);
  transition: opacity 0.2s ease, transform 0.22s ease, box-shadow 0.22s ease, visibility 0s linear 0s;
}

#ai-saas-header {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 12px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(0, 0, 0, 0.08)), var(--ai-header-bg);
  color: var(--ai-header-text);
  border-bottom: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: var(--ai-soft-shadow);
}

.ai-saas-brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 1;
}

.ai-saas-brand-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.2);
  color: var(--ai-header-text);
  border: 1px solid rgba(255, 255, 255, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.ai-saas-brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ai-saas-brand-text strong {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.2;
}

.ai-saas-brand-text > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.2;
  opacity: 0.78;
}

.ai-saas-status-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  animation: aiStatusPulse 2.2s ease-in-out infinite;
}

#ai-saas-close {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 12px;
  background: var(--ai-close-bg);
  color: var(--ai-close-text, var(--ai-header-text));
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

#ai-saas-close svg {
  width: 18px;
  height: 18px;
}

#ai-saas-close:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
  filter: brightness(1.05);
}

#ai-saas-chat-box {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px min(6vw, 24px);
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.08)), var(--ai-chat-bg);
  background-attachment: local;
  scrollbar-width: thin;
  scrollbar-color: rgba(15, 23, 42, 0.24) transparent;
}

#ai-saas-chat-box::-webkit-scrollbar {
  width: 7px;
}

#ai-saas-chat-box::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.24);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

.ai-saas-bubble {
  position: relative;
  max-width: min(86%, 360px);
  padding: 10px 14px;
  margin: 0;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ai-saas-bubble.user {
  margin-left: auto;
  align-self: flex-end;
  color: var(--ai-user-text);
  background: var(--ai-user-bg);
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-bottom-right-radius: 7px;
  box-shadow: var(--ai-soft-shadow);
}

.ai-saas-bubble.bot {
  margin-right: auto;
  align-self: flex-start;
  color: var(--ai-bot-text);
  background: var(--ai-bot-bg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-bottom-left-radius: 7px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.ai-saas-bubble.product-list {
  width: 100%;
  max-width: 100%;
  padding: 12px;
  border-radius: 18px;
}

.ai-saas-bubble.typing {
  width: auto;
  min-width: 72px;
  padding: 12px 14px;
}

.ai-saas-enter {
  animation: bubbleIn 0.24s ease both;
}

.ai-saas-suggestions {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 2px 0 4px;
}

.ai-saas-suggestion-chip {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(15, 23, 42, 0.72);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  transition: transform 0.16s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.ai-saas-suggestion-chip:hover {
  transform: translateY(-1px);
  border-color: var(--ai-accent);
  color: var(--ai-accent);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
}

.ai-saas-suggestion-chip:focus-visible {
  outline: 2px solid var(--ai-accent);
  outline-offset: 2px;
}

.ai-saas-typing {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ai-saas-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.46);
  animation: typing 1.4s infinite ease-in-out both;
}

.ai-saas-typing span:nth-child(1) {
  animation-delay: -0.32s;
}

.ai-saas-typing span:nth-child(2) {
  animation-delay: -0.16s;
}

.ai-saas-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes typing {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.72);
  }
  40% {
    opacity: 1;
    transform: scale(1);
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

@keyframes aiStatusPulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.18);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.08);
  }
}

#ai-saas-form {
  padding: 12px 14px 10px;
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 -10px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ai-saas-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 6px 6px 6px 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 16px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.05), 0 8px 18px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-saas-input-wrapper:focus-within {
  border-color: var(--ai-accent);
  box-shadow: 0 0 0 3px var(--ai-accent-light), inset 0 1px 2px rgba(15, 23, 42, 0.05);
}

.ai-saas-input-wrapper input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font: inherit;
  font-size: 14px;
  line-height: 1.4;
  padding: 8px 0;
}

.ai-saas-input-wrapper input::placeholder {
  color: #94a3b8;
}

.ai-saas-input-wrapper input:disabled {
  cursor: wait;
}

.ai-saas-input-wrapper button {
  min-width: 42px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 0;
  border-radius: 13px;
  padding: 0 13px;
  background: var(--ai-accent-gradient);
  color: var(--ai-accent-contrast);
  box-shadow: 0 9px 18px var(--ai-accent-shadow);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  line-height: 1;
  white-space: nowrap;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}

.ai-saas-input-wrapper button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.is-sending .ai-saas-send-icon svg {
  animation: aiSendLoading 0.85s linear infinite;
}

.ai-saas-input-wrapper button:disabled {
  opacity: 0.48;
  cursor: default;
  box-shadow: none;
}

@keyframes aiSendLoading {
  0% {
    transform: translate3d(-1px, 1px, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(-1px, 1px, 0) rotate(360deg);
  }
}

.ai-saas-send-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
}

.ai-saas-send-icon svg {
  width: 16px;
  height: 16px;
}

.ai-saas-bubble.ai-saas-error {
  background: #fff1f2;
  color: #9f1239;
  border-color: rgba(159, 18, 57, 0.16);
}

.ai-saas-powered {
  padding: 0 12px 10px;
  background: rgba(255, 255, 255, 0.94);
  color: rgba(15, 23, 42, 0.48);
  text-align: center;
  font-size: 10px;
  line-height: 1.2;
}

.ai-saas-powered a {
  color: inherit;
  text-decoration: none;
  font-weight: 800;
}

.ai-saas-powered a:hover {
  color: var(--ai-accent);
}

.ai-saas-fallback {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--ai-accent);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ai-saas-fallback:hover {
  background: rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
  text-decoration: underline;
}

.ai-saas-fallback svg {
  width: 16px;
  height: 16px;
}

.ai-pl {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-pl-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(15, 23, 42, 0.72);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.ai-pl-title::before {
  content: "";
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--ai-accent);
  opacity: 0.7;
}

.ai-pl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
}

.ai-pl-link {
  display: block;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  border-radius: 14px;
}

.ai-pl-item {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 74px;
  padding: 9px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.ai-pl-link:hover .ai-pl-item {
  transform: translateY(-1px);
  border-color: rgba(15, 23, 42, 0.14);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.ai-pl-media {
  width: 54px;
  height: 54px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--ai-accent-light);
  color: var(--ai-accent);
  font-size: 17px;
  font-weight: 800;
}

.ai-pl-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.ai-pl-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-pl-name {
  display: -webkit-box;
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ai-pl-sub {
  color: rgba(15, 23, 42, 0.66);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
}

.ai-pl-stock {
  width: fit-content;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.62);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.ai-pl-stock.instock {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.ai-pl-action {
  align-self: center;
  padding: 6px 8px;
  border-radius: 999px;
  background: var(--ai-accent-light);
  color: var(--ai-accent);
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.ai-pl-empty {
  padding: 10px 12px;
  border: 1px dashed rgba(15, 23, 42, 0.18);
  border-radius: 14px;
  color: rgba(15, 23, 42, 0.62);
  font-size: 13px;
}

@media (max-height: 800px) {
  #ai-saas-widget {
    height: min(620px, 68vh);
    max-height: calc(100dvh - 104px);
  }
}

@media (max-width: 640px) {
  #ai-saas-anchor {
    right: 12px;
    left: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    align-items: stretch;
  }

  #ai-saas-anchor.ai-pos-right,
  #ai-saas-anchor.ai-pos-left {
    right: 12px;
    left: 12px;
    align-items: stretch;
  }

  #ai-saas-toggle {
    width: 100%;
    min-height: 56px;
    padding: 0 16px;
  }

  #ai-saas-toggle .ai-saas-label {
    max-width: none;
  }

  #ai-saas-widget {
    position: fixed;
    right: 12px;
    left: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: none;
    height: min(620px, 72dvh);
    max-height: calc(100dvh - 112px);
    border-radius: 20px;
  }

  #ai-saas-header {
    min-height: 60px;
  }

  #ai-saas-chat-box {
    padding: 16px 14px;
  }

  .ai-saas-bubble {
    max-width: 90%;
  }

  .ai-saas-bubble.product-list {
    max-width: 100%;
  }

  .ai-pl-grid {
    grid-template-columns: 1fr;
  }

  .ai-pl-item {
    grid-template-columns: 50px minmax(0, 1fr);
    min-height: 68px;
    padding: 8px;
  }

  .ai-pl-action {
    display: none;
  }

  .ai-pl-media {
    width: 50px;
    height: 50px;
    border-radius: 11px;
  }

  .ai-saas-send-label {
    display: none;
  }

  .ai-saas-input-wrapper button {
    padding: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  #ai-saas-widget,
  #ai-saas-toggle,
  #ai-saas-close,
  .ai-saas-bubble,
  .ai-saas-enter,
  .ai-pl-item,
  .ai-saas-input-wrapper button {
    animation: none !important;
    transition: none !important;
  }

  .ai-saas-typing span {
    animation: none !important;
  }

  .ai-saas-status-dot {
    animation: none !important;
  }
}
`;
