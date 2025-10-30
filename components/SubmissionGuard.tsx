import { useEffect } from "react";
import { useRouter } from "next/router";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { Card, CardContent } from "../src/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "../lib/dateUtils";

interface SubmissionGuardProps {
  children: React.ReactNode;
}

/**
 * Component that protects form pages from being edited after submission
 * If user has already submitted, show a message and redirect options
 */
export function SubmissionGuard({ children }: SubmissionGuardProps) {
  const { data: experienceData, loading } = useErasmusExperience();
  const router = useRouter();

  // Check if the experience has been submitted
  const hasSubmitted =
    experienceData?.status === "SUBMITTED" || experienceData?.hasSubmitted;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If already submitted, show message and options
  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Already Submitted
              </h2>
              <p className="text-muted-foreground">
                You have already submitted your Erasmus experience application
                on{" "}
                {experienceData?.submittedAt
                  ? formatDate(experienceData.submittedAt, {
                      format: "long",
                      includeTime: true,
                    })
                  : "previously"}
                .
              </p>
              <p className="text-gray-600 mb-8">
                Your submission is currently under review. You cannot edit your
                application after submission.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If not submitted, render the form
  return <>{children}</>;
}
