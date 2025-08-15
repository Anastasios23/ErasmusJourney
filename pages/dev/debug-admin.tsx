import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import Link from "next/link";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default function DebugAdmin() {
  const { data: session, status } = useSession();
  const [apiTests, setApiTests] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);
  const [adminCreation, setAdminCreation] = useState<{
    status: "idle" | "loading" | "success" | "error";
    result?: any;
  }>({ status: "idle" });

  const createAdminUser = async () => {
    setAdminCreation({ status: "loading" });

    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setAdminCreation({ status: "success", result });
      } else {
        setAdminCreation({ status: "error", result });
      }
    } catch (error) {
      setAdminCreation({
        status: "error",
        result: { error: error.message },
      });
    }
  };

  const testAPI = async (endpoint: string, name: string) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? data : null,
        error: !response.ok ? data : null,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        data: null,
        error: error.message,
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);

    const tests = {
      formSubmissions: await testAPI(
        "/api/admin/form-submissions?status=SUBMITTED",
        "Form Submissions",
      ),
      destinations: await testAPI("/api/admin/destinations", "Destinations"),
      accommodationSubmissions: await testAPI(
        "/api/admin/accommodation-submissions",
        "Accommodation Submissions",
      ),
    };

    setApiTests(tests);
    setTesting(false);
  };

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin System Debug</h1>

        {/* Session Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Status: </span>
                <Badge
                  variant={
                    status === "authenticated" ? "default" : "destructive"
                  }
                >
                  {status}
                </Badge>
              </div>

              {session && (
                <>
                  <div>
                    <span className="font-medium">User: </span>
                    {session.user?.name || session.user?.email}
                  </div>
                  <div>
                    <span className="font-medium">Role: </span>
                    <Badge
                      variant={
                        session.user?.role === "ADMIN"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {session.user?.role || "No role"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Email: </span>
                    {session.user?.email}
                  </div>
                </>
              )}

              {status === "unauthenticated" && (
                <div className="text-red-600">
                  You need to log in first.{" "}
                  <Link href="/login" className="underline">
                    Go to login
                  </Link>
                </div>
              )}

              {session && session.user?.role !== "ADMIN" && (
                <div className="text-red-600">
                  You need admin privileges to access admin pages.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Tests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Endpoint Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={runAllTests} disabled={testing}>
                {testing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {testing ? "Testing..." : "Test All APIs"}
              </Button>

              {Object.keys(apiTests).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(apiTests).map(([key, result]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon success={result.success} />
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <Badge variant="outline">Status: {result.status}</Badge>
                      </div>

                      {result.success && result.data && (
                        <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                          <strong>Success:</strong> Retrieved{" "}
                          {Array.isArray(result.data)
                            ? result.data.length
                            : "data"}{" "}
                          items
                          {Array.isArray(result.data) &&
                            result.data.length > 0 && (
                              <pre className="mt-1 text-xs overflow-x-auto">
                                {JSON.stringify(result.data[0], null, 2)}
                              </pre>
                            )}
                        </div>
                      )}

                      {!result.success && (
                        <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                          <strong>Error:</strong>{" "}
                          {result.error?.error || result.error}
                          {result.status === 403 && (
                            <div className="mt-1">
                              This is likely an authentication issue. Make sure
                              you're logged in as an admin.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin User Creation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin User Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={createAdminUser}
                disabled={adminCreation.status === "loading"}
                className="w-full"
              >
                {adminCreation.status === "loading" ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {adminCreation.status === "loading"
                  ? "Creating..."
                  : "Create Admin User"}
              </Button>

              {adminCreation.status === "success" && adminCreation.result && (
                <div className="text-sm text-green-700 bg-green-50 p-4 rounded border">
                  <h4 className="font-semibold mb-2">
                    ✅ {adminCreation.result.message}
                  </h4>
                  <div className="space-y-1">
                    <p>
                      <strong>Email:</strong>{" "}
                      {adminCreation.result.credentials.email}
                    </p>
                    <p>
                      <strong>Password:</strong>{" "}
                      {adminCreation.result.credentials.password}
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-blue-800">
                    <p className="font-medium">Next Steps:</p>
                    <ol className="list-decimal list-inside text-xs mt-1 space-y-1">
                      <li>
                        Go to{" "}
                        <Link href="/login" className="underline">
                          /login
                        </Link>
                      </li>
                      <li>Use the credentials above</li>
                      <li>Access admin pages</li>
                    </ol>
                  </div>
                </div>
              )}

              {adminCreation.status === "error" && adminCreation.result && (
                <div className="text-sm text-red-700 bg-red-50 p-4 rounded border">
                  <h4 className="font-semibold mb-2">
                    ❌ Error creating admin user
                  </h4>
                  <p>{adminCreation.result.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/test-admin">
                <Button variant="outline" className="w-full">
                  Test Data Creation
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/admin/destinations">
                <Button variant="outline" className="w-full">
                  Destinations Admin
                </Button>
              </Link>
              <Link href="/admin/university-exchanges">
                <Button variant="outline" className="w-full">
                  Universities Admin
                </Button>
              </Link>
              <Link href="/admin/student-accommodations">
                <Button variant="outline" className="w-full">
                  Accommodations Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
