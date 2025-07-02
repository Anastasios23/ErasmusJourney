import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Head from "next/head";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [testEmail, setTestEmail] = useState("demo");
  const [testPassword, setTestPassword] = useState("demo");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const testLogin = async () => {
    setIsLoading(true);
    console.log("Testing login with:", testEmail, testPassword);

    const result = await signIn("credentials", {
      email: testEmail,
      password: testPassword,
      redirect: false,
    });

    setLastResult(result);
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Auth Debug - Erasmus Journey</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Authentication Debug Tool</h1>

          <Card>
            <CardHeader>
              <CardTitle>Current Session Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Status:</strong> <Badge>{status}</Badge>
                </p>
                {session ? (
                  <div>
                    <p>
                      <strong>User ID:</strong>{" "}
                      {session.user?.id || "Not available"}
                    </p>
                    <p>
                      <strong>Email:</strong> {session.user?.email}
                    </p>
                    <p>
                      <strong>Name:</strong> {session.user?.name}
                    </p>
                    <p>
                      <strong>First Name:</strong>{" "}
                      {(session.user as any)?.firstName || "Not available"}
                    </p>
                    <p>
                      <strong>Last Name:</strong>{" "}
                      {(session.user as any)?.lastName || "Not available"}
                    </p>
                    <p>
                      <strong>Role:</strong>{" "}
                      {(session.user as any)?.role || "Not available"}
                    </p>
                    <Button
                      onClick={() => signOut()}
                      variant="outline"
                      className="mt-4"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <p>No active session</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email/Username:
                  </label>
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="demo or admin@erasmus.cy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password:
                  </label>
                  <Input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="demo or admin123"
                  />
                </div>
                <Button onClick={testLogin} disabled={isLoading}>
                  {isLoading ? "Testing..." : "Test Login"}
                </Button>

                {lastResult && (
                  <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h4 className="font-medium mb-2">Last Login Result:</h4>
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(lastResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setTestEmail("demo");
                    setTestPassword("demo");
                  }}
                  variant="outline"
                >
                  Test Demo User
                </Button>
                <Button
                  onClick={() => {
                    setTestEmail("admin@erasmus.cy");
                    setTestPassword("admin123");
                  }}
                  variant="outline"
                >
                  Test Admin User
                </Button>
                <Button
                  onClick={() => {
                    setTestEmail("petros@gmail.com");
                    setTestPassword("");
                  }}
                  variant="outline"
                >
                  Test Registered User (Petris)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </p>
                <p>
                  <strong>NextAuth URL:</strong> {process.env.NEXTAUTH_URL}
                </p>
                <p>
                  <strong>Current URL:</strong>{" "}
                  {typeof window !== "undefined" ? window.location.href : "SSR"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
