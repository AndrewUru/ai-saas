export type PlanId = "free" | "basic" | "pro";

export const PLAN_LIMITS_AGENTS: Record<PlanId, number> = {
  free: 5,
  basic: 5,
  pro: Number.POSITIVE_INFINITY,
};

export function getAgentLimit(plan?: string | null) {
  const key = (plan ?? "free").toLowerCase() as PlanId;
  return PLAN_LIMITS_AGENTS[key] ?? PLAN_LIMITS_AGENTS.free;
}
