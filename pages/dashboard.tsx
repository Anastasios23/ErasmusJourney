import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Button } from "../src/components/ui/button";
import { Progress } from "../src/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useErasmusProgress } from "../src/hooks/useErasmusProgress";
import WelcomeTour from "../src/components/WelcomeTour";

interface ApplicationStep {
  id: string;
  name: string;
  href: string;
  icon: string;
  completed: boolean;
  description: string;
  gradient: string;
}

// Floating orbs component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-amber-500/15 to-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl" />
    </div>
  );
}

// Glass card component
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
      relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 
      border border-white/20 dark:border-gray-700/30 
      rounded-3xl shadow-xl shadow-gray-900/5
      ${className}
    `}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    completedSteps,
    completedCount,
    progressPercentage,
    loading: progressLoading,
  } = useErasmusProgress();

  // Application steps definition with gradients
  const applicationSteps: ApplicationStep[] = [
    {
      id: "basic-info",
      name: "Basic Information",
      href: "/basic-information",
      icon: "solar:user-circle-linear",
      completed: completedSteps.basicInfo,
      description: "Personal & academic details",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      id: "course-matching",
      name: "Course Matching",
      href: "/course-matching",
      icon: "solar:notebook-minimalistic-linear",
      completed: completedSteps.courses,
      description: "Select courses and universities",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      id: "accommodation",
      name: "Accommodation",
      href: "/accommodation",
      icon: "solar:home-2-linear",
      completed: completedSteps.accommodation,
      description: "Housing preferences",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "living-expenses",
      name: "Living Expenses",
      href: "/living-expenses",
      icon: "solar:wallet-linear",
      completed: completedSteps.livingExpenses,
      description: "Budget and cost planning",
      gradient: "from-orange-500 to-amber-600",
    },
    {
      id: "experience",
      name: "Your Experience",
      href: "/help-future-students",
      icon: "solar:users-group-rounded-linear",
      completed: completedSteps.experience,
      description: "Share tips for future students",
      gradient: "from-indigo-500 to-blue-600",
    },
  ];

  // Find next incomplete step
  const nextStep = applicationSteps.find((step) => !step.completed);
  const allStepsCompleted = completedCount === applicationSteps.length;

  // Loading state
  if (status === "loading" || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 animate-pulse" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-500 font-medium">Loading your journey...</p>
        </div>
      </div>
    );
  }

  // Auth check
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const isNewUser = session?.user
    ? new Date((session.user as any).createdAt || Date.now()).getTime() >
      Date.now() - 24 * 60 * 60 * 1000
    : false;

  return (
    <>
      <Head>
        <title>Dashboard - Erasmus Journey</title>
      </Head>

      <WelcomeTour isNewUser={isNewUser} />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Header />

        <main className="pt-24 pb-16 relative overflow-hidden">
          <FloatingOrbs />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <Badge className="mb-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                  <Icon icon="solar:widget-4-linear" className="w-4 h-4 mr-2" />
                  Dashboard
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  <span className="text-gray-900 dark:text-white">
                    Welcome back,{" "}
                  </span>
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    {session?.user?.name?.split(" ")[0] || "Student"}!
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Track your Erasmus application progress below.
                </p>
              </div>

              {/* Progress Ring */}
              <GlassCard className="p-4 flex items-center gap-5">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-100 dark:text-gray-800"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={226}
                      strokeDashoffset={226 - (progressPercentage / 100) * 226}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#D946EF" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Your Progress
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {completedCount} of {applicationSteps.length} steps
                    completed
                  </p>
                  {allStepsCompleted && (
                    <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-400">
                      <Icon icon="solar:cup-star-bold" className="w-4 h-4" />
                      <span className="text-xs font-semibold">All done!</span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Main Action Card */}
            {!allStepsCompleted && nextStep ? (
              <GlassCard className="overflow-hidden group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${nextStep.gradient} opacity-5`}
                />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <Badge
                        className={`bg-gradient-to-r ${nextStep.gradient} text-white border-none shadow-lg`}
                      >
                        <Icon
                          icon="solar:target-linear"
                          className="w-3.5 h-3.5 mr-1.5"
                        />
                        Next Step
                      </Badge>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {nextStep.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 max-w-lg text-lg">
                        {nextStep.description}. Complete this step to move
                        forward with your Erasmus application.
                      </p>
                    </div>
                    <Link href={nextStep.href}>
                      <Button
                        size="lg"
                        className={`bg-gradient-to-r ${nextStep.gradient} hover:opacity-90 text-white shadow-xl shadow-blue-500/25 px-8 py-6 text-lg rounded-2xl group`}
                      >
                        <span>Continue</span>
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                        />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </GlassCard>
            ) : (
              <GlassCard className="overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none shadow-lg">
                        <Icon
                          icon="solar:cup-star-bold"
                          className="w-3.5 h-3.5 mr-1.5"
                        />
                        Completed
                      </Badge>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Application Submitted! 🎉
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 max-w-lg text-lg">
                        Amazing work! Your Erasmus experience has been recorded.
                        Explore other destinations or edit your submission
                        anytime.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/submissions">
                        <Button
                          variant="outline"
                          className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl px-6"
                        >
                          View Submission
                        </Button>
                      </Link>
                      <Link href="/destinations">
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white shadow-xl shadow-emerald-500/25 rounded-xl px-6">
                          Explore Destinations
                          <Icon
                            icon="solar:arrow-right-linear"
                            className="ml-2 h-4 w-4"
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            )}

            {/* Steps List */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 px-1">
                <Icon
                  icon="solar:rocket-2-linear"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Journey
                </h3>
              </div>
              <GlassCard className="overflow-hidden divide-y divide-gray-100/50 dark:divide-gray-800/50">
                {applicationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`
                      group flex items-center justify-between p-6 hover:bg-white/50 dark:hover:bg-gray-800/30 transition-all duration-300
                      ${step === nextStep ? "bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10" : ""}
                    `}
                  >
                    <div className="flex items-center gap-5">
                      {/* Step Number/Icon */}
                      <div
                        className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg
                        ${
                          step.completed
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/25"
                            : step === nextStep
                              ? `bg-gradient-to-br ${step.gradient} text-white shadow-blue-500/25 animate-pulse`
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-none"
                        }
                      `}
                      >
                        {step.completed ? (
                          <Icon
                            icon="solar:check-circle-bold"
                            className="h-6 w-6"
                          />
                        ) : (
                          <Icon icon={step.icon} className="h-6 w-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4
                            className={`font-semibold text-lg ${step.completed ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            {step.name}
                          </h4>
                          {step === nextStep && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${step.gradient} text-white px-3 py-1 rounded-full shadow-lg`}
                            >
                              Up Next
                            </span>
                          )}
                          {step.completed && (
                            <Icon
                              icon="solar:star-bold"
                              className="w-4 h-4 text-amber-500"
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {step.completed ? (
                        <Link href={step.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
                          >
                            Edit
                          </Button>
                        </Link>
                      ) : (
                        <Link href={step.href}>
                          <Button
                            size="sm"
                            className={
                              step === nextStep
                                ? `bg-gradient-to-r ${step.gradient} hover:opacity-90 text-white shadow-lg rounded-xl px-6`
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                            }
                          >
                            {step === nextStep ? (
                              <>
                                Start
                                <Icon
                                  icon="solar:arrow-right-linear"
                                  className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform"
                                />
                              </>
                            ) : (
                              "Pending"
                            )}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
