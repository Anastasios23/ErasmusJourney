import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectionStatus from "./components/ConnectionStatus";
import OfflineBanner from "./components/OfflineBanner";
import BackendStartupBanner from "./components/BackendStartupBanner";
import SimpleSetupBanner from "./components/SimpleSetupBanner";
import SimpleBackendStatus from "./components/SimpleBackendStatus";
import OfflineStatusOnly from "./components/OfflineStatusOnly";
import ConnectionTester from "./components/ConnectionTester";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Community from "./pages/Community";
import ShareStory from "./pages/ShareStory";
import PhotoStory from "./pages/PhotoStory";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import StudentStories from "./pages/StudentStories";
import StudentAccommodations from "./pages/StudentAccommodations";
import AccommodationDetail from "./pages/AccommodationDetail";
import Experiences from "./pages/Experiences";
import BasicInformation from "./pages/BasicInformation";
import CourseMatching from "./pages/CourseMatching";
import Accommodation from "./pages/Accommodation";
import LivingExpenses from "./pages/LivingExpenses";
import HelpFutureStudents from "./pages/HelpFutureStudents";
import UniversityPartnerships from "./pages/UniversityPartnerships";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

// Global error handling for unhandled fetch errors
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;

  // Handle various types of fetch-related errors
  if (
    reason &&
    ((reason.message &&
      (reason.message.includes("Failed to fetch") ||
        reason.message.includes("NetworkError") ||
        reason.message.includes("signal is aborted") ||
        reason.message.includes("AbortError"))) ||
      reason.name === "AbortError" ||
      reason.name === "TypeError" ||
      reason.name === "NetworkError")
  ) {
    // Silently handle all network-related errors
    event.preventDefault();
  }
});

// Also handle regular errors
window.addEventListener("error", (event) => {
  if (
    event.error &&
    event.error.message &&
    (event.error.message.includes("Failed to fetch") ||
      event.error.message.includes("NetworkError") ||
      event.error.message.includes("AbortError"))
  ) {
    event.preventDefault();
  }
});

// Suppress console errors for fetch-related issues in production
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(" ");
  if (
    !import.meta.env.DEV &&
    (message.includes("Failed to fetch") ||
      message.includes("Backend connection failed") ||
      message.includes("NetworkError") ||
      message.includes("AbortError"))
  ) {
    // Suppress fetch-related errors in production
    return;
  }
  // Allow other errors through
  originalConsoleError.apply(console, args);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SimpleSetupBanner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/community" element={<Community />} />
              <Route path="/share-story" element={<ShareStory />} />
              <Route path="/photo-story" element={<PhotoStory />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destination/:id" element={<DestinationDetail />} />
              <Route path="/student-stories" element={<StudentStories />} />
              <Route
                path="/student-accommodations"
                element={<StudentAccommodations />}
              />
              <Route
                path="/accommodation-detail/:id"
                element={<AccommodationDetail />}
              />
              <Route path="/experiences" element={<Experiences />} />
              <Route
                path="/basic-information"
                element={
                  <ProtectedRoute>
                    <BasicInformation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course-matching"
                element={
                  <ProtectedRoute>
                    <CourseMatching />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accommodation"
                element={
                  <ProtectedRoute>
                    <Accommodation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/living-expenses"
                element={
                  <ProtectedRoute>
                    <LivingExpenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help-future-students"
                element={
                  <ProtectedRoute>
                    <HelpFutureStudents />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<AdminPanel />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <OfflineStatusOnly />
          {/* <ErrorBoundary fallback={null}>
        <ConnectionTester />
      </ErrorBoundary> */}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
