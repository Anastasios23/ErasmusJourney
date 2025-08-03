import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { NotificationProvider } from "../src/context/NotificationContext";
import { FormProgressProvider } from "../src/context/FormProgressContext";
import { ToastProvider } from "../src/components/ToastProvider";
import ErrorBoundary from "../src/components/ErrorBoundary";
import HMRErrorHandler from "../src/components/HMRErrorHandler";
import EnhancedOfflineIndicator from "../src/components/EnhancedOfflineIndicator";
import "../src/index.css";
import { useEffect } from "react";
import {
  setupApiCallMonitoring,
  restoreOriginalFetch,
} from "../src/utils/debugApiCalls";

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
  useEffect(() => {
    // Completely disable all fetch monitoring to prevent conflicts with analytics tools
    // This prevents interference from FullStory, HMR, and other monitoring tools

    return () => {
      // No cleanup needed since we're not setting up any monitoring
    };
  }, []);

  return (
    <ErrorBoundary>
      <SessionProvider
        session={session}
        refetchInterval={60} // Refetch session every minute for better responsiveness
        refetchOnWindowFocus={true} // Refetch when window regains focus
        refetchWhenOffline={false} // Don't refetch when offline
      >
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <NotificationProvider>
              <TooltipProvider>
                <FormProgressProvider>
                  {/* <HMRErrorHandler /> */}
                  <EnhancedOfflineIndicator />
                  <Toaster />
                  <Sonner />
                  <Component {...pageProps} />
                </FormProgressProvider>
              </TooltipProvider>
            </NotificationProvider>
          </ToastProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
