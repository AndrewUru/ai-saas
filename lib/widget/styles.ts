import type { WidgetAppearance } from "./types";

export function renderStyles(a: WidgetAppearance) {
  return `
#ai-saas-anchor{position:fixed;bottom:18px;${a.position === "left" ? "left:18px;right:auto;" : "right:18px;left:auto;"}z-index:2147483000;font-family:"Inter","Helvetica Neue",Arial,sans-serif;}
#ai-saas-anchor[data-position="left"]{left:18px;right:auto;}
#ai-saas-anchor[data-position="right"]{right:18px;left:auto;}
#ai-saas-toggle{display:flex;align-items:center;gap:10px;background:${a.accent};color:${a.accentContrast};padding:12px 16px;border-radius:999px;border:none;font-weight:600;cursor:pointer;box-shadow:0 12px 32px ${a.accentShadow};transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease;}
#ai-saas-toggle:hover{transform:translateY(-1px);box-shadow:0 18px 38px ${a.accentShadow};}
#ai-saas-toggle:focus-visible{outline:2px solid #fff;outline-offset:3px;}
#ai-saas-toggle .ai-saas-icon{width:36px;height:36px;border-radius:999px;background:#ffffff;color:${a.accent};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;}
#ai-saas-toggle .ai-saas-label{font-size:13px;}
#ai-saas-anchor.open #ai-saas-toggle{opacity:0;transform:translateY(10px);pointer-events:none;}
#ai-saas-widget{width:360px;max-width:calc(100vw - 40px);max-height:calc(100vh - 60px);background:#0b1120;border:1px solid rgba(148,163,184,.22);border-radius:24px;overflow:hidden;box-shadow:0 28px 70px rgba(2,6,23,.5);display:flex;flex-direction:column;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s ease,transform .2s ease;}
#ai-saas-anchor.open #ai-saas-widget{opacity:1;transform:translateY(0);pointer-events:auto;}
#ai-saas-header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:${a.accentGradient};color:${a.accentContrast};}
.ai-saas-brand{display:flex;align-items:center;gap:12px;}
.ai-saas-brand-icon{width:44px;height:44px;border-radius:16px;background:${a.accentLight};color:${a.accent};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;}
.ai-saas-brand-text strong{display:block;font-size:15px;color:${a.accentContrast};}
.ai-saas-brand-text span{display:block;font-size:12px;opacity:.8;color:${a.accentContrast};}
#ai-saas-close{background:${a.closeBg};color:${a.closeColor};border:none;width:85px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .2s ease;}
#ai-saas-close:hover{opacity:.85;}
#ai-saas-close svg{width:18px;height:18px;}
#ai-saas-chat-box{padding:18px;flex:1;overflow-y:auto;overflow-x:hidden;background:linear-gradient(180deg,rgba(15,23,42,.55) 0%,rgba(15,23,42,.82) 100%);}
#ai-saas-chat-box::-webkit-scrollbar{width:6px;}
#ai-saas-chat-box::-webkit-scrollbar-thumb{background:rgba(148,163,184,.28);border-radius:999px;}
.ai-saas-bubble{max-width:85%;padding:10px 14px;margin:6px 0;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;}
.ai-saas-bubble.user{margin-left:auto;background:${a.accent};color:${a.accentContrast};}
.ai-saas-bubble.bot{margin-right:auto;background:rgba(148,163,184,.16);color:#e2e8f0;border:1px solid rgba(148,163,184,.2);}
.ai-saas-bubble.ai-saas-error{border-color:rgba(248,113,113,.5);color:#fca5a5;}
.ai-saas-bubble.typing{display:flex;align-items:center;gap:6px;}
.ai-saas-typing{display:inline-flex;align-items:center;gap:4px;}
.ai-saas-typing span{width:6px;height:6px;border-radius:999px;background:${a.accent};animation:ai-saas-typing 1s infinite ease-in-out;}
.ai-saas-typing span:nth-child(2){animation-delay:.15s;}
.ai-saas-typing span:nth-child(3){animation-delay:.3s;}
@keyframes ai-saas-typing{0%,60%,100%{opacity:.25;transform:translateY(0);}30%{opacity:1;transform:translateY(-2px);}}
#ai-saas-form{padding:16px;border-top:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.85);}
.ai-saas-input-wrapper{display:flex;gap:10px;align-items:center;}
.ai-saas-input-wrapper input{flex:1;background:rgba(15,23,42,.6);color:#e2e8f0;border:1px solid rgba(148,163,184,.25);border-radius:16px;padding:12px 14px;font-size:14px;transition:border-color .2s;}
.ai-saas-input-wrapper input:focus{border-color:${a.accent};outline:none;}
.ai-saas-input-wrapper input::placeholder{color:rgba(148,163,184,.65);}
.ai-saas-input-wrapper button{background:${a.accent};color:${a.accentContrast};border:none;border-radius:14px;padding:10px 18px;font-weight:600;cursor:pointer;transition:opacity .2s ease,transform .2s ease;}
.ai-saas-input-wrapper button:hover{opacity:.9;}
.ai-saas-input-wrapper button:disabled{opacity:.55;cursor:not-allowed;}
.ai-saas-fallback{display:inline-flex;align-items:center;gap:6px;margin:4px 0 0;background:rgba(148,163,184,.16);color:#e2e8f0;padding:8px 12px;border-radius:12px;font-size:13px;text-decoration:none;}
.ai-saas-fallback svg{width:16px;height:16px;}
@media (max-width: 480px){#ai-saas-widget{width:calc(100vw - 32px);}}
`;
}
