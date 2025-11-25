'use client';

import { HydrationBoundary, QueryClientProvider, type DehydratedState } from "@tanstack/react-query";
import { useState } from "react";
import { createQueryClient } from "@/lib/query/client";

type Props = {
  children: React.ReactNode;
  /**
   * Estado deshidratado para SSR/SSG; opcional.
   */
  state?: DehydratedState | null;
};

export default function QueryProvider({ children, state }: Props) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
