import { useState } from "react";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Alert, AlertDescription } from "../src/components/ui/alert";

export default function TestDatabase() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.message || "Failed to initialize database");
      }
    } catch (err) {
      setError(
        "Network error: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const testUser = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/test-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.message || "Failed to test user");
      }
    } catch (err) {
      setError(
        "Network error: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Database Testing & Initialization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Use these tools to test database connectivity and create test
              users.
            </p>

            <div className="flex gap-4">
              <Button
                onClick={initializeDatabase}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Initializing..." : "Initialize Database"}
              </Button>

              <Button
                onClick={testUser}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Testing..." : "Test User (ana@gmail.com)"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {results && (
              <Alert>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> ana@gmail.com
              </p>
              <p>
                <strong>Password:</strong> 123456
              </p>
              <p>
                <strong>Admin Email:</strong> admin@test.com
              </p>
              <p>
                <strong>Admin Password:</strong> admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
