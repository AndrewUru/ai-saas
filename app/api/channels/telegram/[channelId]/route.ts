import { timingSafeEqual } from "crypto";
import { after, NextResponse } from "next/server";
import { textOnlyNotice } from "@/lib/channels/format-reply";
import {
  claimInboundEvent,
  getAgentProfile,
  getChannelReply,
} from "@/lib/channels/handle-message";
import { sendText, sendTyping, type TelegramUpdate } from "@/lib/channels/telegram";
import { CHANNEL_SELECT, type ChannelRecord } from "@/lib/channels/types";
import { decrypt } from "@/lib/crypto";
import { createAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { channelId } = await params;
  if (!UUID_PATTERN.test(channelId)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const supabase = createAdmin();
  const { data: channel } = await supabase
    .from("agent_channels")
    .select(CHANNEL_SELECT)
    .eq("id", channelId)
    .eq("type", "telegram")
    .maybeSingle<ChannelRecord>();

  if (!channel) return NextResponse.json({ ok: false }, { status: 404 });

  const secret = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!safeEqual(secret, channel.webhook_secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;

  // Paused channels and group chats are acknowledged but not answered.
  if (!channel.is_active || !message || message.chat.type !== "private") {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const eventId = `${chatId}:${message.message_id}`;
  const text = message.text?.trim() ?? "";

  // Answer Telegram right away; the agent can take several seconds.
  after(async () => {
    try {
      if (!(await claimInboundEvent(supabase, channel.id, eventId))) return;

      const token = decrypt(channel.credentials_cipher);

      if (!text || text.startsWith("/start")) {
        const { language, greeting } = await getAgentProfile(supabase, channel.agent_id);
        await sendText(token, chatId, text ? greeting : textOnlyNotice(language));
        return;
      }

      await sendTyping(token, chatId).catch(() => undefined);
      const reply = await getChannelReply(supabase, channel, {
        conversationKey: String(chatId),
        text,
      });
      if (reply) await sendText(token, chatId, reply);
    } catch (err) {
      console.error(
        "[AI SaaS] Telegram webhook error:",
        err instanceof Error ? err.message : err,
      );
    }
  });

  return NextResponse.json({ ok: true });
}
