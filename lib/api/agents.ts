import { agentListSchema, type AgentSummary } from "@/lib/contracts/agent";

export async function fetchAgents(): Promise<AgentSummary[]> {
  const res = await fetch("/api/agents", { credentials: "include" });

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || "No se pudieron cargar los agentes");
  }

  const data = await res.json();
  const parsed = agentListSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Respuesta de agentes invalida");
  }

  return parsed.data;
}
