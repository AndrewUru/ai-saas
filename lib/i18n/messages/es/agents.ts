import type { agents as en } from "../en/agents";

export const agents: typeof en = {
  createError: "No se pudo crear el agente",
  created: "Agentes creados",
  defaultLimit: "Límite por defecto",
  needHelp: "¿Necesitas ayuda?",
  guides: "Consulta nuestras guías de integración detalladas",
  viewDocs: "Ver docs",
  activeAgents: "Agentes activos",
  manage: "Gestiona la configuración y las integraciones",
  emptyTitle: "Aún no hay agentes",
  emptyBody:
    "Crea tu primer agente para generar una API key y empezar a automatizar el soporte de tu tienda.",
  key: "Clave:",
  limit: "Límite:",
  delete: "Eliminar",
  newAgent: "Nuevo agente",
  deployTitle: "Despliega una nueva instancia",
  deployBody:
    "Genera una nueva API key al instante. Puedes renombrarla y reconfigurarla cuando quieras.",
  nameLabel: "Nombre del agente",
  namePlaceholder: "p. ej. 'Soporte tienda principal'",
  generate: "Generar agente",
  noteKeys: "• Las API keys se generan con aleatoriedad segura.",
  noteLimits: "• Los límites iniciales siguen los valores de tu plan.",
  notePlan: "• Plan actual: {plan} ({count}/{limit} agentes).",
};
