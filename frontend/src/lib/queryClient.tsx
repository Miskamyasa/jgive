import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CAMPAIGN_SLUG } from "./api";

export const campaignQueryKey = ["campaign", CAMPAIGN_SLUG] as const;
export const donationsQueryKey = ["donations", CAMPAIGN_SLUG] as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Astro hydrates each island as its own React root, but they all run in the
// same browser window. Sharing one module-level QueryClient lets a mutation in
// one island (DonationForm) invalidate queries that other islands
// (ProgressIsland, DonorListIsland) read, so they refetch automatically.
let sharedQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (!sharedQueryClient) {
    sharedQueryClient = createQueryClient();
  }
  return sharedQueryClient;
}

// Every island root wraps itself in this provider; they all receive the same
// shared client so cross-island cache invalidation works.
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
