import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "../src/components/ui/toaster";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { NotificationProvider } from "../src/context/NotificationContext";
import { FormProgressProvider } from "../src/context/FormProgressContext";
import { LoadingProvider } from "../src/components/ui/loading-provider";
import { ErrorBoundary } from "../src/components/ui/error-boundary";
import EnhancedOfflineIndicator from "../src/components/EnhancedOfflineIndicator";
import { AuthErrorBoundary } from "../src/components/AuthErrorBoundary";
import "../src/index.css";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ErrorBoundary>
      <AuthErrorBoundary>
        <SessionProvider
          session={session}
          refetchInterval={300} // Refetch session every 5 minutes (less aggressive)
          refetchOnWindowFocus={false} // Disable to prevent unnecessary fetch errors
          refetchWhenOffline={false} // Don't refetch when offline
        >
          <QueryClientProvider client={queryClient}>
            <LoadingProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <FormProgressProvider>
                    <EnhancedOfflineIndicator />
                    <Toaster />
                    <Component {...pageProps} />
                  </FormProgressProvider>
                </TooltipProvider>
              </NotificationProvider>
            </LoadingProvider>
          </QueryClientProvider>
        </SessionProvider>
      </AuthErrorBoundary>
    </ErrorBoundary>
  );
}
