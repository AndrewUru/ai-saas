import { splitMessage } from "@/lib/channels/format-reply";

const TELEGRAM_API = "https://api.telegram.org";
const MAX_MESSAGE_LENGTH = 4000;

export const TELEGRAM_TOKEN_PATTERN = /^\d{5,}:[A-Za-z0-9_-]{30,}$/;

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
  };
};

export class TelegramApiError extends Error {}

async function telegramCall<T>(token: string, method: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    ok?: boolean;
    result?: T;
    description?: string;
  } | null;

  if (!json?.ok) {
    throw new TelegramApiError(json?.description ?? `Telegram HTTP ${res.status}`);
  }
  return json.result as T;
}

export function getBotInfo(token: string) {
  return telegramCall<{ id: number; username?: string; first_name: string }>(token, "getMe");
}

export function setWebhook(token: string, url: string, secret: string) {
  return telegramCall<boolean>(token, "setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
}

export function deleteWebhook(token: string) {
  return telegramCall<boolean>(token, "deleteWebhook", { drop_pending_updates: true });
}

export function sendTyping(token: string, chatId: number) {
  return telegramCall<boolean>(token, "sendChatAction", { chat_id: chatId, action: "typing" });
}

export async function sendText(token: string, chatId: number, text: string) {
  for (const chunk of splitMessage(text, MAX_MESSAGE_LENGTH)) {
    await telegramCall(token, "sendMessage", { chat_id: chatId, text: chunk });
  }
}
