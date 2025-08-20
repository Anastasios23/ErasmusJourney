import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function TestAdminSystems() {
  const [testDataStatus, setTestDataStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [testResult, setTestResult] = useState<any>(null);

  const createTestData = async () => {
    setTestDataStatus("loading");

    try {
      const response = await fetch("/api/create-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setTestDataStatus("success");
        setTestResult(result);
      } else {
        setTestDataStatus("error");
        setTestResult(result);
      }
    } catch (error) {
      setTestDataStatus("error");
      setTestResult({ error: "Failed to create test data" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🧪 Admin Systems Testing
        </h1>
        <p className="text-gray-600">
          Test the admin review systems for Destinations, University Exchanges,
          and Student Accommodations
        </p>
      </div>

      {/* Test Data Creation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 1: Create Test Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Create sample form submissions to test the admin review systems
          </p>

          <Button
            onClick={createTestData}
            disabled={testDataStatus === "loading"}
            className="mb-4"
          >
            {testDataStatus === "loading"
              ? "⏳ Creating..."
              : "🧪 Create Test Data"}
          </Button>

          {testDataStatus === "success" && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Test Data Created!
              </h3>
              <p className="text-green-700 text-sm">
                Created {Object.keys(testResult.submissions || {}).length} form
                submissions ready for admin review
              </p>
            </div>
          )}

          {testDataStatus === "error" && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">
                ❌ Error Creating Test Data
              </h3>
              <p className="text-red-700 text-sm">
                {testResult?.error || "Unknown error occurred"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Systems to Test */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Destinations Admin */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              📍 Destinations Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Review basic information form submissions and create destination
                content
              </p>

              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Form Type: basic-information
                </Badge>
                <div className="text-xs text-gray-500">
                  • Student destination experiences
                  <br />
                  • Cultural highlights & challenges
                  <br />
                  • Cost of living data
                  <br />• Admin content & photos
                </div>
              </div>

              <Link href="/admin/destinations">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  🏛️ Test Destinations Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* University Exchanges Admin */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              🏛️ University Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Review course matching submissions and create university
                exchange listings
              </p>

              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Form Type: course-matching
                </Badge>
                <div className="text-xs text-gray-500">
                  • Course details & ECTS
                  <br />
                  • Difficulty levels & exam types
                  <br />
                  • Academic requirements
                  <br />• Partnership information
                </div>
              </div>

              <Link href="/admin/university-exchanges">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  🎓 Test University Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Student Accommodations Admin */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              🏠 Student Accommodations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Review accommodation submissions and create housing listings
              </p>

              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Form Type: accommodation
                </Badge>
                <div className="text-xs text-gray-500">
                  • Housing details & costs
                  <br />
                  • Student ratings & reviews
                  <br />
                  • Amenities & location
                  <br />• Admin photos & verification
                </div>
              </div>

              <Link href="/admin/student-accommodations">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  🏠 Test Accommodations Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testing Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Step 2: Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">🎯 What to Test:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <strong>Pending Submissions:</strong> Should see form
                  submissions in "Pending Review" tabs
                </li>
                <li>
                  • <strong>Review Process:</strong> Click "Review" to open
                  submission details
                </li>
                <li>
                  • <strong>Admin Content:</strong> Add professional
                  descriptions, photos, verified information
                </li>
                <li>
                  • <strong>Approval Flow:</strong> Approve submissions to
                  create public listings
                </li>
                <li>
                  • <strong>Live Content:</strong> Check "Live" tabs to see
                  published content
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">✅ Expected Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <strong>Data Separation:</strong> Each admin page shows
                  relevant form types only
                </li>
                <li>
                  • <strong>Photo Control:</strong> Only admins can add photos
                  (especially for accommodations)
                </li>
                <li>
                  • <strong>Quality Review:</strong> Full student data review
                  before publishing
                </li>
                <li>
                  • <strong>Status Tracking:</strong> SUBMITTED →
                  APPROVED/REJECTED workflow
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">
                💡 Simplified Accommodations:
              </h4>
              <p className="text-yellow-700 text-sm">
                Based on your requirements: No study level, no application
                process, no student photos. Only admin-controlled photos and
                verified information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
