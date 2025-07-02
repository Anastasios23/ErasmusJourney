import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Progress } from "../src/components/ui/progress";
import {
  CheckCircle,
  Circle,
  Clock,
  FileText,
  BookOpen,
  Home,
  Euro,
  Users,
} from "lucide-react";

interface FormStep {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: any;
  status: "not_started" | "in_progress" | "completed";
  estimatedTime: string;
}

export default function FormProgress() {
  const { data: session } = useSession();
  const [formSteps, setFormSteps] = useState<FormStep[]>([
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Your personal details and study preferences",
      url: "/basic-information",
      icon: FileText,
      status: "not_started",
      estimatedTime: "5-10 min",
    },
    {
      id: "course-matching",
      title: "Course Matching",
      description: "Match courses between universities",
      url: "/course-matching",
      icon: BookOpen,
      status: "not_started",
      estimatedTime: "10-15 min",
    },
    {
      id: "accommodation",
      title: "Accommodation Review",
      description: "Review and rate your accommodation",
      url: "/accommodation",
      icon: Home,
      status: "not_started",
      estimatedTime: "5-8 min",
    },
    {
      id: "living-expenses",
      title: "Living Expenses",
      description: "Share your budget and expenses",
      url: "/living-expenses",
      icon: Euro,
      status: "not_started",
      estimatedTime: "8-12 min",
    },
    {
      id: "help-future-students",
      title: "Become a Mentor",
      description: "Help future Erasmus students",
      url: "/help-future-students",
      icon: Users,
      status: "not_started",
      estimatedTime: "10-15 min",
    },
  ]);

  useEffect(() => {
    // TODO: Load actual form completion status from API
    // For now, simulate some progress based on user
    if (session?.user?.email === "demo") {
      setFormSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status:
            index === 0
              ? "completed"
              : index === 1
                ? "in_progress"
                : "not_started",
        })),
      );
    }
  }, [session]);

  const completedSteps = formSteps.filter(
    (step) => step.status === "completed",
  ).length;
  const inProgressSteps = formSteps.filter(
    (step) => step.status === "in_progress",
  ).length;
  const progressPercentage = (completedSteps / formSteps.length) * 100;

  const getStatusIcon = (status: FormStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: FormStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
        );
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Erasmus Journey Forms
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {completedSteps} of {formSteps.length} completed
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {formSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {step.description}
                  </p>
                  <p className="text-xs text-gray-500">{step.estimatedTime}</p>
                </div>
                <div className="flex-shrink-0">
                  <Link href={step.url}>
                    <Button
                      variant={
                        step.status === "completed" ? "outline" : "default"
                      }
                      size="sm"
                    >
                      {step.status === "completed"
                        ? "Review"
                        : step.status === "in_progress"
                          ? "Continue"
                          : "Start"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tip</h4>
          <p className="text-sm text-blue-800">
            Complete all forms to help future Erasmus students and get the most
            out of the platform! Your experiences are valuable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
