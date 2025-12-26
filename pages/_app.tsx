import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { NotificationProvider } from "../src/context/NotificationContext";
import { FormProgressProvider } from "../src/context/FormProgressContext";
import { ToastProvider as LegacyToastProvider } from "../src/components/ToastProvider";
import { ToastProvider } from "../src/components/ui/toast-provider";
import { LoadingProvider } from "../src/components/ui/loading-provider";
import { ErrorBoundary } from "../src/components/ui/error-boundary";
import LegacyErrorBoundary from "../src/components/ErrorBoundary";
import HMRErrorHandler from "../src/components/HMRErrorHandler";
import EnhancedOfflineIndicator from "../src/components/EnhancedOfflineIndicator";
import { AuthErrorBoundary } from "../src/components/AuthErrorBoundary";
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
  const router = useRouter();

  useEffect(() => {
    // Completely disable all fetch monitoring to prevent conflicts with analytics tools
    // This prevents interference from FullStory, HMR, and other monitoring tools

    return () => {
      // No cleanup needed since we're not setting up any monitoring
    };
  }, []);

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

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
              <ToastProvider>
                <LegacyToastProvider>
                  <NotificationProvider>
                    <TooltipProvider>
                      <FormProgressProvider>
                        {/* <HMRErrorHandler /> */}
                        <EnhancedOfflineIndicator />
                        <Toaster />
                        <Sonner />
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={router.asPath}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <Component {...pageProps} />
                          </motion.div>
                        </AnimatePresence>
                      </FormProgressProvider>
                    </TooltipProvider>
                  </NotificationProvider>
                </LegacyToastProvider>
              </ToastProvider>
            </LoadingProvider>
          </QueryClientProvider>
        </SessionProvider>
      </AuthErrorBoundary>
    </ErrorBoundary>
  );
}
