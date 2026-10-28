import type { channels as en } from "../en/channels";

export const channels: typeof en = {
  badge: "Canales",
  title: "Conecta {name} a tus canales",
  intro:
    "Atiende a tus clientes donde ya hablan contigo. Cada chat tiene su propio historial y usa el mismo prompt, catálogo y conocimiento que el widget.",
  connected: "Conectado",
  paused: "En pausa",
  notConnected: "Sin conectar",
  comingSoon: "Próximamente",
  pause: "Pausar",
  resume: "Reactivar",
  disconnect: "Desconectar",
  lastMessage: "Último mensaje: {date}",
  noMessagesYet: "Aún no hay mensajes. Escribe a tu bot para probarlo.",
  lastError: "Último error: {error}",
  telegram: {
    name: "Telegram",
    description: "Tu propio bot respondiendo a clientes en chats privados, 24/7.",
    steps: [
      "Abre @BotFather en Telegram y envía /newbot.",
      "Elige un nombre y un usuario para tu bot.",
      "Copia el token que te da BotFather y pégalo aquí.",
    ],
    tokenLabel: "Token del bot",
    tokenPlaceholder: "123456789:AA...",
    connect: "Conectar Telegram",
    openBot: "Abrir en Telegram",
  },
  upcoming: {
    whatsapp: {
      name: "WhatsApp",
      description: "WhatsApp Business con la Cloud API oficial de Meta.",
    },
    instagram: {
      name: "Instagram",
      description: "Mensajes directos de tu cuenta de empresa de Instagram.",
    },
    messenger: {
      name: "Facebook Messenger",
      description: "Mensajes que llegan a tu página de Facebook.",
    },
  },
  status: {
    telegram_connected: "Telegram conectado. Escribe a tu bot para probarlo.",
    paused: "Canal en pausa. No se responderán mensajes hasta que lo reactives.",
    resumed: "Canal reactivado.",
    disconnected: "Canal desconectado.",
  },
  errors: {
    telegram_token:
      "Telegram no aceptó ese token. Cópialo de nuevo desde @BotFather (tiene la forma 123456789:AA...).",
    telegram_in_use: "Ese bot ya está conectado a otro agente. Desconéctalo allí primero.",
    telegram_webhook:
      "No pudimos registrar el webhook en Telegram. Necesita una URL pública con HTTPS: pruébalo en tu web publicada, no en localhost.",
    save: "No pudimos guardar el canal. Inténtalo de nuevo.",
  },
};
