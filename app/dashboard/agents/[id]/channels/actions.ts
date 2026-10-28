"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import {
  deleteWebhook,
  getBotInfo,
  setWebhook,
  TELEGRAM_TOKEN_PATTERN,
} from "@/lib/channels/telegram";
import { decrypt, encrypt } from "@/lib/crypto";
import { getSiteUrl } from "@/lib/site";
import { createAdmin } from "@/lib/supabase/admin";

const IdSchema = z.string().uuid();

function channelsPath(agentId: string) {
  return `/dashboard/agents/${agentId}/channels`;
}

// redirect() throws, so never call this inside a try block.
function finish(agentId: string, query: string): never {
  revalidatePath(channelsPath(agentId));
  redirect(`${channelsPath(agentId)}?${query}`);
}

/** Devuelve el id del usuario si el agente le pertenece; si no, 404. */
async function requireAgentOwner(agentId: string) {
  if (!IdSchema.safeParse(agentId).success) notFound();

  const { supabase, user } = await requireUser();
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!agent) notFound();
  return user.id;
}

export async function connectTelegram(formData: FormData) {
  const agentId = String(formData.get("agent_id") ?? "");
  const token = String(formData.get("token") ?? "").trim();
  const userId = await requireAgentOwner(agentId);

  if (!TELEGRAM_TOKEN_PATTERN.test(token)) finish(agentId, "error=telegram_token");

  const bot = await getBotInfo(token).catch(() => null);
  if (!bot) finish(agentId, "error=telegram_token");

  const admin = createAdmin();
  const externalId = String(bot.id);
  const { data: existing } = await admin
    .from("agent_channels")
    .select("id, agent_id")
    .eq("type", "telegram")
    .eq("external_id", externalId)
    .maybeSingle();

  if (existing && existing.agent_id !== agentId) {
    finish(agentId, "error=telegram_in_use");
  }

  const webhookSecret = randomBytes(32).toString("hex");
  const row = {
    agent_id: agentId,
    user_id: userId,
    type: "telegram",
    external_id: externalId,
    display_name: bot.username ? `@${bot.username}` : bot.first_name,
    credentials_cipher: encrypt(token),
    webhook_secret: webhookSecret,
    is_active: true,
    last_error: null,
    updated_at: new Date().toISOString(),
  };

  const { data: saved, error: saveError } = existing
    ? await admin.from("agent_channels").update(row).eq("id", existing.id).select("id").single()
    : await admin.from("agent_channels").insert(row).select("id").single();

  if (saveError || !saved) {
    console.error("[AI SaaS] Telegram channel save failed:", saveError?.message);
    finish(agentId, "error=save");
  }

  const webhookUrl = `${await getSiteUrl()}/api/channels/telegram/${saved.id}`;
  const webhookError = await setWebhook(token, webhookUrl, webhookSecret).then(
    () => null,
    (err: unknown) => (err instanceof Error ? err.message : String(err)),
  );

  if (webhookError) {
    console.error("[AI SaaS] Telegram setWebhook failed:", webhookError);
    if (existing) {
      await admin
        .from("agent_channels")
        .update({ last_error: webhookError })
        .eq("id", saved.id);
    } else {
      await admin.from("agent_channels").delete().eq("id", saved.id);
    }
    finish(agentId, "error=telegram_webhook");
  }

  finish(agentId, "status=telegram_connected");
}

export async function setChannelActive(formData: FormData) {
  const agentId = String(formData.get("agent_id") ?? "");
  const channelId = String(formData.get("channel_id") ?? "");
  const active = formData.get("active") === "true";
  const userId = await requireAgentOwner(agentId);
  if (!IdSchema.safeParse(channelId).success) notFound();

  const { error } = await createAdmin()
    .from("agent_channels")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", channelId)
    .eq("agent_id", agentId)
    .eq("user_id", userId);

  if (error) finish(agentId, "error=save");
  finish(agentId, active ? "status=resumed" : "status=paused");
}

export async function disconnectChannel(formData: FormData) {
  const agentId = String(formData.get("agent_id") ?? "");
  const channelId = String(formData.get("channel_id") ?? "");
  const userId = await requireAgentOwner(agentId);
  if (!IdSchema.safeParse(channelId).success) notFound();

  const admin = createAdmin();
  const { data: channel } = await admin
    .from("agent_channels")
    .select("id, type, credentials_cipher")
    .eq("id", channelId)
    .eq("agent_id", agentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!channel) notFound();

  if (channel.type === "telegram") {
    // Best effort: the bot may have been deleted or its token revoked.
    await Promise.resolve()
      .then(() => deleteWebhook(decrypt(channel.credentials_cipher)))
      .catch(() => undefined);
  }

  const { error } = await admin.from("agent_channels").delete().eq("id", channel.id);
  if (error) finish(agentId, "error=save");
  finish(agentId, "status=disconnected");
}
