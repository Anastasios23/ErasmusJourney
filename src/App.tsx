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
import Index from "./pages/Index";
import Login from "./pages/Login";
import Community from "./pages/Community";
import ShareStory from "./pages/ShareStory";
import PhotoStory from "./pages/PhotoStory";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import StudentStories from "./pages/StudentStories";
import StudentAccommodations from "./pages/StudentAccommodations";
import Experiences from "./pages/Experiences";
import BasicInformation from "./pages/BasicInformation";
import CourseMatching from "./pages/CourseMatching";
import Accommodation from "./pages/Accommodation";
import LivingExpenses from "./pages/LivingExpenses";
import HelpFutureStudents from "./pages/HelpFutureStudents";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
        <ConnectionStatus />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
