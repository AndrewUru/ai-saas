import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAgentCatalog } from "@/lib/agents/catalog";
import { chatWithAgent, FALLBACK_AGENT_MODEL } from "@/lib/agents/chat-service";
import {
  defaultGreeting,
  formatReplyAsText,
  unavailableNotice,
} from "@/lib/channels/format-reply";
import type { ChannelRecord } from "@/lib/channels/types";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

const AGENT_MODEL = process.env.OPENAI_AGENT_MODEL ?? FALLBACK_AGENT_MODEL;

/**
 * Registra el evento entrante. Devuelve false si ya se había procesado
 * (las plataformas reintentan el webhook si tardamos o fallamos).
 */
export async function claimInboundEvent(
  supabase: SupabaseClient,
  channelId: string,
  eventId: string,
) {
  const { error } = await supabase
    .from("channel_inbound_events")
    .insert({ channel_id: channelId, external_event_id: eventId });

  if (!error) return true;
  if (error.code === "23505") return false;

  // Better to risk a duplicate answer than to leave the customer unanswered.
  console.error("[AI SaaS] channel event dedupe failed:", error.message);
  return true;
}

export async function getAgentProfile(supabase: SupabaseClient, agentId: string) {
  const { data } = await supabase
    .from("agents")
    .select("language, widget_greeting")
    .eq("id", agentId)
    .maybeSingle();
  const language = (data?.language as string | null | undefined) ?? null;
  const greeting = (data?.widget_greeting as string | null | undefined)?.trim();
  return { language, greeting: greeting || defaultGreeting(language) };
}

/**
 * Pasa el mensaje de un cliente al agente y devuelve el texto a enviar por el
 * canal. Cada chat externo es una conversación con su propio historial.
 */
export async function getChannelReply(
  supabase: SupabaseClient,
  channel: ChannelRecord,
  { conversationKey, text }: { conversationKey: string; text: string },
) {
  const { data: agent } = await supabase
    .from("agents")
    .select("api_key, language, shopify_integration_id")
    .eq("id", channel.agent_id)
    .maybeSingle();

  if (!agent?.api_key) return null;

  const language = (agent.language as string | null) ?? null;
  const { catalog, currency } = await resolveAgentCatalog(
    supabase,
    agent.shopify_integration_id,
  );

  const result = await chatWithAgent(
    {
      apiKey: agent.api_key,
      message: text,
      catalog,
      currency,
      locale: isLocale(language) ? language : defaultLocale,
      conversationId: `${channel.type}:${channel.id}:${conversationKey}`,
      channel: channel.type,
    },
    {
      supabase,
      openaiApiKey: process.env.OPENAI_API_KEY ?? "",
      model: AGENT_MODEL,
    },
  );

  await supabase
    .from("agent_channels")
    .update(
      result.ok
        ? { last_message_at: new Date().toISOString(), last_error: null }
        : { last_error: result.error },
    )
    .eq("id", channel.id);

  return result.ok
    ? formatReplyAsText(result.reply, language)
    : unavailableNotice(language, result.fallbackUrl);
}
