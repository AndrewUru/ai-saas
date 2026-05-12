export type PlanId = "free" | "pro";

export type PlanConfig = {
  id: PlanId;
  name: string;
  price: string;
  cycle: string;
  agentLimit: number;
  messageLimit: number;
  features: string[];
};

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    cycle: "per month",
    agentLimit: 5,
    messageLimit: 1000,
    features: [
      "Up to 5 agents",
      "1,000 messages/month",
      "Starter widget branding",
      "Standard support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "EUR 22",
    cycle: "one-time",
    agentLimit: Number.POSITIVE_INFINITY,
    messageLimit: 10000,
    features: [
      "Unlimited agents",
      "10,000 messages/month",
      "Custom escalation routes",
      "Advanced widget customization",
    ],
  },
};

export function normalizePlanId(plan?: string | null): PlanId {
  const key = (plan ?? "free").toLowerCase();
  if (key === "pro") return key;
  return "free";
}

export function getPlanConfig(plan?: string | null) {
  return PLAN_CONFIG[normalizePlanId(plan)];
}

export function getAgentLimit(plan?: string | null) {
  return getPlanConfig(plan).agentLimit;
}

export function getDefaultMessageLimit(plan?: string | null) {
  return getPlanConfig(plan).messageLimit;
}

export function isPaidPlan(plan?: string | null) {
  return normalizePlanId(plan) !== "free";
}

export function hasActivePlan(profile?: {
  plan?: string | null;
  active_until?: string | null;
  is_paid?: boolean | null;
} | null) {
  if (!profile) return false;
  if (normalizePlanId(profile.plan) === "free") return true;
  if (profile.active_until && new Date(profile.active_until) > new Date()) {
    return true;
  }
  return profile.is_paid === true || isPaidPlan(profile.plan);
}
