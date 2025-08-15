import { useState } from "react";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import Header from "../components/Header";
import Link from "next/link";
import {
  Database,
  Users,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function DevTools() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFakeData = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/test-data/generate-fake-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate fake data",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🛠️ Development Tools
              </h1>
              <p className="text-lg text-gray-600">
                Generate test data and preview destination features
              </p>
            </div>

            {/* Generate Test Data Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Generate Fake Form Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This will create realistic form submissions for 6 European
                  destinations with sample student data including basic
                  information, accommodation, and living expenses forms.
                </p>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={generateFakeData}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
                        Generate Test Data
                      </>
                    )}
                  </Button>

                  <Link href="/destinations">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      View Destinations
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            {results && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Data Generation Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Destinations
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {results.destinationsCreated}
                      </p>
                      <p className="text-sm text-blue-700">Cities created</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          Students
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {results.submissions.length}
                      </p>
                      <p className="text-sm text-green-700">Student profiles</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Forms
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {results.totalSubmissions}
                      </p>
                      <p className="text-sm text-purple-700">
                        Total submissions
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Success!</strong> Generated{" "}
                      {results.submissions.length} students across{" "}
                      {results.destinationsCreated} destinations. Each student
                      has completed basic information, accommodation, and living
                      expenses forms.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Sample Generated Data:
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {results.submissions
                        .slice(0, 5)
                        .map((submission: any, index: number) => (
                          <div key={index} className="mb-1">
                            <span className="font-medium">
                              {submission.student}
                            </span>{" "}
                            → {submission.destination} ({submission.university})
                          </div>
                        ))}
                      {results.submissions.length > 5 && (
                        <div className="text-gray-500 mt-2">
                          ... and {results.submissions.length - 5} more students
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>What This Does</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Generated Data Includes:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>
                        <strong>6 European Destinations:</strong> Berlin,
                        Barcelona, Prague, Amsterdam, Vienna, Lyon
                      </li>
                      <li>
                        <strong>Realistic Student Profiles:</strong> Cypriot
                        students with various backgrounds
                      </li>
                      <li>
                        <strong>Complete Form Data:</strong> Basic info,
                        accommodation details, living expenses
                      </li>
                      <li>
                        <strong>Varied Cost Levels:</strong> Low, medium, and
                        high-cost destinations
                      </li>
                      <li>
                        <strong>University Partnerships:</strong> Real
                        universities and exchange programs
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      How Destinations Are Generated:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>
                        Destinations are automatically created based on form
                        submissions
                      </li>
                      <li>
                        Average costs are calculated from accommodation and
                        living expenses data
                      </li>
                      <li>
                        Student counts and ratings are aggregated from real
                        submissions
                      </li>
                      <li>
                        Cost levels (low/medium/high) are determined by average
                        rent prices
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
