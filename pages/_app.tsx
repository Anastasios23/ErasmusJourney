import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { NotificationProvider } from "../src/context/NotificationContext";
import { FormProgressProvider } from "../src/context/FormProgressContext";
import ErrorBoundary from "../src/components/ErrorBoundary";
import HMRErrorHandler from "../src/components/HMRErrorHandler";
import "../src/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ErrorBoundary>
      <SessionProvider
        session={session}
        refetchInterval={60} // Refetch session every minute for better responsiveness
        refetchOnWindowFocus={true} // Refetch when window regains focus
        refetchWhenOffline={false} // Don't refetch when offline
      >
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <TooltipProvider>
              <FormProgressProvider>
                <HMRErrorHandler />
                <Toaster />
                <Sonner />
                <Component {...pageProps} />
              </FormProgressProvider>
            </TooltipProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
