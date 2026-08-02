"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { syncDataSourceFromServer } from "@/lib/api/config";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Auto-detect sumber data: jika server melaporkan database terhubung
  // (Supabase/PostgreSQL), repository beralih dari mock → backend lalu semua
  // query di-refetch sehingga data Supabase langsung tampil tanpa reload.
  useEffect(() => {
    let cancelled = false;
    syncDataSourceFromServer().then((switchedToBackend) => {
      if (cancelled || !switchedToBackend) return;
      queryClient.invalidateQueries();
    });
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
