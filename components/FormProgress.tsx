import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { MOCK_SESSION_USER } from "@/utils/mockSession";
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
  Save,
  AlertCircle,
} from "lucide-react";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";

interface FormStep {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "not_started" | "in_progress" | "completed";
  estimatedTime: string;
  hasDraft?: boolean;
  lastSaved?: string;
}

export default function FormProgress() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session } = useSession();
  const session = MOCK_SESSION_USER;
  const { submissions, getDraftData, refreshSubmissions } =
    useFormSubmissions();
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

  // Load form status from submissions and drafts
  const loadFormStatus = useCallback(() => {
    setFormSteps((prev) =>
      prev.map((step) => {
        const submission = submissions.find((s) => s.type === step.id);
        const draftData = getDraftData(step.id);

        let status: FormStep["status"] = "not_started";
        let hasDraft = false;
        let lastSaved = undefined;

        if (submission) {
          if (
            submission.status === "submitted" ||
            submission.status === "published"
          ) {
            status = "completed";
          } else if (submission.status === "draft") {
            status = "in_progress";
            hasDraft = true;
            lastSaved = submission.createdAt;
          }
        } else if (draftData) {
          status = "in_progress";
          hasDraft = true;
          lastSaved = new Date().toISOString();
        }

        return {
          ...step,
          status,
          hasDraft,
          lastSaved,
        };
      }),
    );
  }, [submissions, getDraftData]);

  useEffect(() => {
    loadFormStatus();
  }, [loadFormStatus]);

  useEffect(() => {
    refreshSubmissions();
  }, [refreshSubmissions]);

  const completedSteps = formSteps.filter(
    (step) => step.status === "completed",
  ).length;
  const inProgressSteps = formSteps.filter(
    (step) => step.status === "in_progress",
  ).length;
  const progressPercentage = (completedSteps / formSteps.length) * 100;
  const currentStepIndex = formSteps.findIndex(
    (step) => step.status === "in_progress",
  );

  const getStatusIcon = (status: FormStep["status"], hasDraft?: boolean) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircle
            className="w-5 h-5 text-green-600"
            aria-label="Completed"
          />
        );
      case "in_progress":
        return hasDraft ? (
          <Save className="w-5 h-5 text-blue-600" aria-label="Draft saved" />
        ) : (
          <Clock className="w-5 h-5 text-yellow-600" aria-label="In progress" />
        );
      default:
        return (
          <Circle className="w-5 h-5 text-gray-400" aria-label="Not started" />
        );
    }
  };

  const getStatusBadge = (status: FormStep["status"], hasDraft?: boolean) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
        );
      case "in_progress":
        return hasDraft ? (
          <Badge className="bg-blue-100 text-blue-800">💾 Draft Saved</Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">
            ⏳ In Progress
          </Badge>
        );
      default:
        return <Badge variant="outline">○ Not Started</Badge>;
    }
  };

  const formatLastSaved = (lastSaved?: string) => {
    if (!lastSaved) return null;
    const date = new Date(lastSaved);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 1) return "Just saved";
    if (diffMinutes < 60) return `Saved ${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `Saved ${Math.floor(diffMinutes / 60)}h ago`;
    return `Saved ${Math.floor(diffMinutes / 1440)}d ago`;
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
              Step{" "}
              {currentStepIndex >= 0
                ? currentStepIndex + 1
                : completedSteps + 1}{" "}
              of {formSteps.length} • {completedSteps} completed
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress
            value={progressPercentage}
            className="w-full"
            aria-label={`Form completion progress: ${Math.round(progressPercentage)}%`}
          />
          {inProgressSteps > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Save className="w-3 h-3" />
              <span>
                {inProgressSteps} form{inProgressSteps > 1 ? "s" : ""} with
                saved drafts
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="list" aria-label="Form steps">
          {formSteps.map((step, index) => {
            const Icon = step.icon;
            const isCurrentStep = index === currentStepIndex;
            return (
              <div
                key={step.id}
                role="listitem"
                className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  isCurrentStep ? "border-blue-300 bg-blue-50" : ""
                }`}
                aria-current={isCurrentStep ? "step" : undefined}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status, step.hasDraft)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      className="w-4 h-4 text-gray-600"
                      aria-hidden="true"
                    />
                    <h3 className="font-medium text-gray-900">
                      {step.title}
                      {isCurrentStep && (
                        <span className="sr-only"> (current step)</span>
                      )}
                    </h3>
                    {getStatusBadge(step.status, step.hasDraft)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>⏱️ {step.estimatedTime}</span>
                    {step.hasDraft && step.lastSaved && (
                      <span className="text-blue-600">
                        • {formatLastSaved(step.lastSaved)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link href={step.url}>
                    <Button
                      variant={
                        step.status === "completed" ? "outline" : "default"
                      }
                      size="sm"
                      aria-label={`${
                        step.status === "completed"
                          ? "Review"
                          : step.status === "in_progress"
                            ? "Continue"
                            : "Start"
                      } ${step.title} form`}
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

        {/* Enhanced tip section with autosave info */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Save className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  Auto-save Active
                </h4>
                <p className="text-sm text-green-800">
                  Your progress is automatically saved as you type. You can
                  safely leave and return to any form without losing your data.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tip</h4>
            <p className="text-sm text-blue-800">
              Complete all forms to help future Erasmus students and get the
              most out of the platform! Your experiences are valuable.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
