import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
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
import {
  User,
  BookOpen,
  Home,
  Euro,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  PlayCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useErasmusProgress } from "../src/hooks/useErasmusProgress";
import WelcomeTour from "../src/components/WelcomeTour";

interface ApplicationStep {
  id: string;
  name: string;
  href: string;
  icon: any;
  completed: boolean;
  description: string;
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

  // Application steps definition
  const applicationSteps: ApplicationStep[] = [
    {
      id: "basic-info",
      name: "Basic Information",
      href: "/basic-information",
      icon: User,
      completed: completedSteps.basicInfo,
      description: "Personal & academic details",
    },
    {
      id: "course-matching",
      name: "Course Matching",
      href: "/course-matching",
      icon: BookOpen,
      completed: completedSteps.courses,
      description: "Select courses and universities",
    },
    {
      id: "accommodation",
      name: "Accommodation",
      href: "/accommodation",
      icon: Home,
      completed: completedSteps.accommodation,
      description: "Housing preferences",
    },
    {
      id: "living-expenses",
      name: "Living Expenses",
      href: "/living-expenses",
      icon: Euro,
      completed: completedSteps.livingExpenses,
      description: "Budget and cost planning",
    },
    {
      id: "experience",
      name: "Your Experience",
      href: "/help-future-students",
      icon: FileText,
      completed: completedSteps.experience,
      description: "Share tips for future students",
    },
  ];

  // Find next incomplete step
  const nextStep = applicationSteps.find((step) => !step.completed);
  const allStepsCompleted = completedCount === applicationSteps.length;

  // Loading state
  if (status === "loading" || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {session?.user?.name?.split(" ")[0] || "Student"}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Track your application progress below.
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (progressPercentage / 100) * 125.6}
                      className="text-blue-600 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Progress</p>
                  <p className="text-xs text-gray-500">
                    {completedCount} of {applicationSteps.length} steps
                  </p>
                </div>
              </div>
            </div>

            {/* Main Action Card */}
            {!allStepsCompleted && nextStep ? (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Current Step
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {nextStep.name}
                      </h2>
                      <p className="text-gray-600 max-w-md">
                        {nextStep.description}. Complete this step to move forward with your application.
                      </p>
                    </div>
                    <Link href={nextStep.href}>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                        Continue Application
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        Completed
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Application Submitted!
                      </h2>
                      <p className="text-gray-600 max-w-md">
                        Great job! Your experience has been recorded. You can now explore other destinations or edit your submission.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/submissions">
                        <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                          View Submission
                        </Button>
                      </Link>
                      <Link href="/destinations">
                        <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                          Explore Destinations
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Steps List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 px-1">Your Journey</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {applicationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`
                      group flex items-center justify-between p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors
                      ${step === nextStep ? "bg-blue-50/30" : ""}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                        ${step.completed 
                          ? "bg-green-100 text-green-600" 
                          : step === nextStep 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-400"}
                      `}>
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-700"}`}>
                            {step.name}
                          </h4>
                          {step === nextStep && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              Next
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 hidden sm:block">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {step.completed ? (
                        <Link href={step.href}>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">
                            Edit
                          </Button>
                        </Link>
                      ) : (
                        <Link href={step.href}>
                          <Button 
                            size="sm" 
                            variant={step === nextStep ? "default" : "outline"}
                            className={step === nextStep ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            {step === nextStep ? "Start" : "Pending"}
                            {step === nextStep && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
