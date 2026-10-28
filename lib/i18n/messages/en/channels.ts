export const channels = {
  badge: "Channels",
  title: "Connect {name} to your channels",
  intro:
    "Answer customers where they already talk to you. Each chat keeps its own history and uses the same prompt, catalog and knowledge as the widget.",
  connected: "Connected",
  paused: "Paused",
  notConnected: "Not connected",
  comingSoon: "Coming soon",
  pause: "Pause",
  resume: "Resume",
  disconnect: "Disconnect",
  lastMessage: "Last message: {date}",
  noMessagesYet: "No messages yet. Send one to your bot to try it.",
  lastError: "Last error: {error}",
  telegram: {
    name: "Telegram",
    description: "Your own bot answering customers in private chats, 24/7.",
    steps: [
      "Open @BotFather in Telegram and send /newbot.",
      "Choose a name and a username for your bot.",
      "Copy the token BotFather gives you and paste it here.",
    ],
    tokenLabel: "Bot token",
    tokenPlaceholder: "123456789:AA...",
    connect: "Connect Telegram",
    openBot: "Open in Telegram",
  },
  upcoming: {
    whatsapp: {
      name: "WhatsApp",
      description: "WhatsApp Business through Meta's official Cloud API.",
    },
    instagram: {
      name: "Instagram",
      description: "Direct messages for your Instagram business account.",
    },
    messenger: {
      name: "Facebook Messenger",
      description: "Messages sent to your Facebook page.",
    },
  },
  status: {
    telegram_connected: "Telegram connected. Send a message to your bot to try it.",
    paused: "Channel paused. Messages will not be answered until you resume it.",
    resumed: "Channel resumed.",
    disconnected: "Channel disconnected.",
  },
  errors: {
    telegram_token:
      "Telegram did not accept that token. Copy it again from @BotFather (it looks like 123456789:AA...).",
    telegram_in_use: "That bot is already connected to another agent. Disconnect it there first.",
    telegram_webhook:
      "We could not register the webhook with Telegram. It needs a public HTTPS URL: try it on your deployed site, not on localhost.",
    save: "We could not save the channel. Try again.",
  },
};
