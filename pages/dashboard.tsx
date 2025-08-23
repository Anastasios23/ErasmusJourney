import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

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
  Settings,
  TrendingUp,
  Star,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import ActivityTimeline from "../src/components/ActivityTimeline";
import DashboardWidgets from "../src/components/DashboardWidgets";
import WelcomeTour from "../src/components/WelcomeTour";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
interface ApplicationStep {
  id: string;
  name: string;
  href: string;
  icon: any;
  completed: boolean;
  description: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    role: string;
    name?: string;
    email?: string;
    image?: string;
    createdAt?: string | Date;
  };
}

export default function Dashboard() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession() as {
  //   data: ExtendedSession | null;
  //   status: "loading" | "authenticated" | "unauthenticated";
  // };

  // Mock session for development
  const session: ExtendedSession = {
    user: {
      id: "anonymous",
      role: "user",
      name: "Anonymous User",
      email: "anonymous@example.com",
    },
    expires: "2025-12-31",
  };
  const status = "authenticated";
  const router = useRouter();
  const { getFormData, loading: formsLoading } = useFormSubmissions();
  const [completionStatus, setCompletionStatus] = useState<
    Record<string, boolean>
  >({});

  // Check completion status for all forms
  useEffect(() => {
    const checkFormCompletions = async () => {
      if (!session?.user?.id) return;

      try {
        const formTypes = [
          "basic-info",
          "course-matching",
          "accommodation",
          "living-expenses",
        ];
        const statusChecks = await Promise.allSettled(
          formTypes.map(async (type) => {
            const data = await getFormData(type as any);
            return { type, completed: data && Object.keys(data).length > 0 };
          }),
        );

        const newStatus: Record<string, boolean> = {};
        statusChecks.forEach((result, index) => {
          if (result.status === "fulfilled") {
            newStatus[formTypes[index]] = result.value.completed;
          }
        });

        setCompletionStatus(newStatus);
      } catch (error) {
        console.error("Error checking form completions:", error);
      }
    };

    if (session && !formsLoading) {
      checkFormCompletions();
    }
  }, [session, getFormData, formsLoading]);

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/login?callbackUrl=/dashboard");
  //   }
  // }, [status, router]);

  // Application steps with dynamic completion status
  const applicationSteps: ApplicationStep[] = [
    {
      id: "basic-info",
      name: "Personal Information",
      href: "/basic-information",
      icon: User,
      completed: completionStatus["basic-info"] || false,
      description: "Complete your personal and academic information",
    },
    {
      id: "course-matching",
      name: "Course Matching",
      href: "/course-matching",
      icon: BookOpen,
      completed: completionStatus["course-matching"] || false,
      description: "Select and match courses with your home university",
    },
    {
      id: "accommodation",
      name: "Accommodation Details",
      href: "/accommodation",
      icon: Home,
      completed: completionStatus["accommodation"] || false,
      description: "Provide information about your accommodation preferences",
    },
    {
      id: "living-expenses",
      name: "Living Expenses",
      href: "/living-expenses",
      icon: Euro,
      completed: completionStatus["living-expenses"] || false,
      description: "Estimate and plan your living expenses abroad",
    },
  ];

  const completedSteps = applicationSteps.filter(
    (step) => step.completed,
  ).length;
  const progressPercentage = (completedSteps / applicationSteps.length) * 100;

  // Find next incomplete step
  const nextStep = applicationSteps.find((step) => !step.completed);
  const allStepsCompleted = completedSteps === applicationSteps.length;

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>Dashboard - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Track your Erasmus application progress and manage your profile"
          />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Don't render if not authenticated (will redirect)
  // if (!session) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <p>Redirecting to login...</p>
  //       {/* Or a loading spinner component */}
  //     </div>
  //   );
  // }

  // Check if user is new (created recently)
  const isNewUser = session?.user
    ? new Date(session.user.createdAt || Date.now()).getTime() >
      Date.now() - 24 * 60 * 60 * 1000
    : false;

  return (
    <>
      <Head>
        <title>Dashboard - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Track your Erasmus application progress and manage your profile"
        />
      </Head>

      <WelcomeTour isNewUser={isNewUser} />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back,{" "}
                    {session.user?.name?.split(" ")[0] ||
                      session.user?.email?.split("@")[0] ||
                      "User"}
                    !
                  </h1>
                  <p className="text-gray-600">
                    Track your Erasmus application progress and explore new
                    opportunities.
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Progress</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(progressPercentage)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="mb-8">
              <DashboardWidgets userProfile={session.user} />
            </div>

            {/* Next Steps Section */}
            {!allStepsCompleted && nextStep && (
              <div className="mb-8">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <PlayCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">
                            Ready for your next step?
                          </h3>
                          <p className="text-blue-700">
                            Continue with:{" "}
                            <span className="font-medium">{nextStep.name}</span>
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            {nextStep.description}
                          </p>
                        </div>
                      </div>
                      <Link href={nextStep.href}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Application Completed Section */}
            {allStepsCompleted && (
              <div className="mb-8">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">
                            🎉 Application Complete!
                          </h3>
                          <p className="text-green-700">
                            Congratulations! You've completed all application
                            steps.
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            You can review your information or explore
                            additional resources.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/submissions">
                          <Button
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            View Submissions
                          </Button>
                        </Link>
                        <Link href="/student-stories">
                          <Button className="bg-green-600 hover:bg-green-700">
                            Share Your Story
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Application Progress */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {completedSteps} of {applicationSteps.length} steps
                          completed
                        </span>
                        <span className="text-sm text-gray-600">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="mt-6 space-y-4">
                      {applicationSteps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            step.completed
                              ? "bg-green-50 border-green-200 hover:bg-green-100"
                              : step === nextStep
                                ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-500 w-8">
                                {index + 1}
                              </div>
                              <div
                                className={`p-2 rounded-lg ${
                                  step.completed
                                    ? "bg-green-100 text-green-600"
                                    : step === nextStep
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {step.completed ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : step === nextStep ? (
                                  <PlayCircle className="h-5 w-5" />
                                ) : (
                                  <step.icon className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                            <div>
                              <h3
                                className={`font-medium ${
                                  step.completed
                                    ? "text-green-900"
                                    : step === nextStep
                                      ? "text-blue-900"
                                      : "text-gray-900"
                                }`}
                              >
                                {step.name}
                                {step === nextStep && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    Next
                                  </span>
                                )}
                              </h3>
                              <p
                                className={`text-sm ${
                                  step.completed
                                    ? "text-green-600"
                                    : step === nextStep
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                }`}
                              >
                                {step.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {step.completed ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Badge>
                            ) : step === nextStep ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                <PlayCircle className="h-3 w-3 mr-1" />
                                Continue
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            <Link href={step.href}>
                              <Button
                                size="sm"
                                variant={
                                  step === nextStep ? "default" : "outline"
                                }
                                className={
                                  step === nextStep
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : ""
                                }
                              >
                                {step.completed
                                  ? "Review"
                                  : step === nextStep
                                    ? "Continue"
                                    : "Start"}
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/destinations">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex-col gap-2"
                        >
                          <BookOpen className="h-5 w-5" />
                          <span className="text-xs">Explore Universities</span>
                        </Button>
                      </Link>
                      <Link href="/course-matching-experiences">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex-col gap-2"
                        >
                          <BookOpen className="h-5 w-5" />
                          <span className="text-xs">Course Matching Tips</span>
                        </Button>
                      </Link>
                      <Link href="/student-stories">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex-col gap-2"
                        >
                          <FileText className="h-5 w-5" />
                          <span className="text-xs">Read Student Stories</span>
                        </Button>
                      </Link>
                      <Link href="/basic-information">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex-col gap-2"
                        >
                          <User className="h-5 w-5" />
                          <span className="text-xs">Start Application</span>
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button
                          variant="outline"
                          className="w-full h-20 flex-col gap-2"
                        >
                          <Settings className="h-5 w-5" />
                          <span className="text-xs">Update Profile</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {session.user?.name?.[0] ||
                              session.user?.email?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {session.user?.name || "User"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full">
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Application Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Completion:
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Last Updated:
                        </span>
                        <span className="text-sm">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Timeline */}
                <ActivityTimeline />

                {/* Help & Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Get support with your application or explore resources.
                      </p>
                      <div className="space-y-2">
                        <Link href="/university-exchanges">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                          >
                            View Exchange Examples
                          </Button>
                        </Link>
                        <Link href="/student-stories">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                          >
                            Read Student Stories
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                        >
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
