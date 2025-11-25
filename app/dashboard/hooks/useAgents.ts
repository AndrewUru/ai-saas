'use client';

import { useQuery } from "@tanstack/react-query";
import { fetchAgents } from "@/lib/api/agents";
import type { AgentSummary } from "@/lib/contracts/agent";

export function useAgents() {
  return useQuery<AgentSummary[]>({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });
}
