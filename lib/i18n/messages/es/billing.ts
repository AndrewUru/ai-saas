import type { billing as en } from "../en/billing";

export const billing: typeof en = {
  badge: "Facturación",
  back: "Volver al panel",
  title: "Gestiona tu plan",
  intro:
    "Revisa tus límites de uso, mejora el plan para escalar tu operación y gestiona tus facturas.",
  currentPlan: "Plan actual",
  renewsOn: "Se renueva el {date}",
  noExpiry: "Sin fecha de caducidad",
  active: "Activo",
  upgrade: "Mejorar plan",
  cards: {
    free: {
      name: "Plan gratis",
      limit: "Hasta 1.000 mensajes/mes",
      blurb: "Perfecto para probar el panel y lanzar tu primer agente.",
    },
    pro: {
      name: "Plan Pro",
      limit: "Hasta 10.000 mensajes/mes",
      blurb: "Para operar 24/7 con mucho volumen y escalados.",
    },
  },
  enterpriseTitle: "¿Dudas sobre la facturación enterprise?",
  enterpriseBody:
    "Ofrecemos planes a medida para agencias grandes, con soporte dedicado, integraciones personalizadas y facturación consolidada.",
  contactSupport: "Contactar con soporte",
  returnToDashboard: "Volver al panel",
};
