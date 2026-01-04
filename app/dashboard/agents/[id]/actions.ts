"use server";

import { z } from "zod";
import { createServer } from "@/lib/supabase/server";
// opcional: import { revalidatePath } from "next/cache";
// opcional: import { redirect } from "next/navigation";

const Schema = z.object({
  id: z.string().uuid(),
  integration_woocommerce: z.string().min(1).optional(), // "none"|"basic"|...
  allowed_domains: z.string().optional(), // "midominio.com,tienda.com"
});

export async function saveAgentSettings(formData: FormData) {
  try {
    const supabase = await createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const parsed = Schema.safeParse({
      id: String(formData.get("id") ?? ""),
      integration_woocommerce: String(
        formData.get("integration_woocommerce") ?? "none"
      ),
      allowed_domains: String(formData.get("allowed_domains") ?? "").trim(),
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: "Datos inválidos",
        issues: parsed.error.flatten(),
      };
    }
    const { id, integration_woocommerce, allowed_domains } = parsed.data;

    // (opcional) normaliza lista
    const normalized = allowed_domains
      ? allowed_domains
          .split(",")
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean)
          .join(",")
      : null;

    // Verifica ownership explícito (evita 303 con error genérico)
    const { data: agent, error: qErr } = await supabase
      .from("agents")
      .select("id,user_id")
      .eq("id", id)
      .single();

    if (qErr || !agent) return { ok: false, error: "Agente no encontrado" };
    if (agent.user_id !== user.id)
      return { ok: false, error: "Sin permiso sobre el agente" };

    // Update: requiere política RLS de UPDATE correcta
    const { error: updErr } = await supabase
      .from("agents")
      .update({
        integration_woocommerce,
        allowed_domains: normalized,
      })
      .eq("id", id);

    if (updErr) {
      console.error("Supabase update error:", updErr);
      return { ok: false, error: updErr.message || "No se pudo guardar" };
    }

    // opcional: revalidatePath(`/agents/${id}`);
    // opcional: redirect(`/agents/${id}?saved=1`);

    return { ok: true };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: message };
  }
}
