import type { analytics as en } from "../en/analytics";

export const analytics: typeof en = {
  unknownDate: "Fecha desconocida",
  unknownPage: "Página desconocida",
  badge: "Analítica",
  title: "Analítica del widget de {name}",
  intro:
    "Tráfico, aperturas, interacciones, palabras escritas y conversaciones recientes del widget de los últimos 30 días.",
  traffic: "Tráfico",
  trafficHelp: "Cargas del script del widget registradas en las páginas de la tienda.",
  opens: "Aperturas",
  opensHelp: "{rate}% de tasa de apertura sobre las cargas registradas.",
  interactions: "Interacciones",
  interactionsHelp: "El {rate}% de las aperturas se convirtieron en conversaciones.",
  words: "Palabras",
  wordsHelp: "{user} palabras del usuario, {assistant} del asistente.",
  activity: "Actividad",
  last7: "Últimos 7 días",
  failed: "{count} mensajes fallidos",
  depthTitle: "Profundidad de los mensajes",
  depthSubtitle: "Longitud media de los mensajes del usuario",
  wordsPerInteraction: "palabras por interacción",
  topPages: "Páginas principales",
  noTraffic: "Todavía no se ha registrado tráfico en el widget.",
  conversations: "Conversaciones",
  recent: "Interacciones recientes",
  last30: "Últimos 30 días",
  userWords: "{count} palabras del usuario",
  emptyMessage: "Mensaje del usuario vacío",
  noReply: "No hay respuesta del asistente guardada.",
  recordedTitle: "Interacción registrada",
  recordedBody:
    "Esta interacción se contó a partir de los eventos del widget, pero no se guardó el texto de la conversación.",
  emptyTitle: "Aún no hay interacciones",
  emptyBody:
    "Cuando los clientes escriban a través del widget, aquí aparecerán las conversaciones y las métricas de palabras.",
};
