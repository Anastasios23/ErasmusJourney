import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { CheckCircle, ArrowLeft, Home } from "lucide-react";

export default function SubmissionConfirmation() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: "anonymous", email: "anonymous@example.com" } };
  const status = "authenticated";
  const router = useRouter();
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    // Check if user was redirected here after submission
    const submitted = router.query.submitted;
    const timestamp = router.query.timestamp;

    if (submitted === "true" && timestamp) {
      setSubmittedAt(timestamp as string);
    } else {
      // If no submission data, redirect to dashboard
      router.push("/dashboard");
    }
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // if (!session) {
  //   router.push("/auth/signin");
  //   return null;
  // }

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Just now";
    }
  };

  return (
    <>
      <Head>
        <title>Submission Confirmed - Erasmus Journey</title>
        <meta
          name="description"
          content="Your Erasmus experience has been successfully submitted for review."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-800">
                  Submission Successful!
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-gray-600">
                  <p className="text-lg mb-2">
                    Thank you for sharing your Erasmus experience!
                  </p>
                  <p className="text-sm">
                    Your experience has been submitted for review and will help
                    future students make informed decisions about their Erasmus
                    journey.
                  </p>
                </div>

                {submittedAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Submitted:</strong> {formatDate(submittedAt)}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    What happens next?
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Our team will review your submission</li>
                    <li>
                      • Your experience may be featured on our destinations page
                    </li>
                    <li>
                      • Your insights will help other students plan their
                      Erasmus journey
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/destinations")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Browse Destinations
                  </Button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    You can view your submission status anytime from your{" "}
                    <Link
                      href="/dashboard"
                      className="text-blue-600 hover:underline"
                    >
                      dashboard
                    </Link>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
