import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import AuthStatus from "../components/AuthStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";

export default function AuthTestPage() {
  const { data: session, status } = useSession();

  const testLinks = [
    {
      name: "Dashboard",
      url: "/dashboard",
      protected: true,
      description: "User dashboard - requires authentication",
    },
    {
      name: "Profile",
      url: "/profile",
      protected: true,
      description: "User profile - requires authentication",
    },
    {
      name: "Basic Information Form",
      url: "/basic-information",
      protected: true,
      description: "Form submission - requires authentication",
    },
    {
      name: "Course Matching Form",
      url: "/course-matching",
      protected: true,
      description: "Course matching - requires authentication",
    },
    {
      name: "Admin Panel",
      url: "/admin",
      protected: true,
      adminOnly: true,
      description: "Admin dashboard - requires ADMIN role",
    },
    {
      name: "Student Stories",
      url: "/student-stories",
      protected: false,
      description: "Public page - no authentication required",
    },
    {
      name: "Destinations",
      url: "/destinations",
      protected: false,
      description: "Public page - no authentication required",
    },
    {
      name: "Home",
      url: "/",
      protected: false,
      description: "Public page - no authentication required",
    },
  ];

  return (
    <>
      <Head>
        <title>Authentication Test - Erasmus Journey Platform</title>
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Authentication Test Page
            </h1>
            <p className="text-gray-600 mt-2">
              Test authentication and authorization functionality
            </p>
          </div>

          <div className="grid gap-6">
            <AuthStatus />

            <Card>
              <CardHeader>
                <CardTitle>Authentication Test Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {testLinks.map((link) => (
                    <div
                      key={link.url}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{link.name}</h3>
                          {link.protected && (
                            <Badge variant="secondary">Protected</Badge>
                          )}
                          {link.adminOnly && (
                            <Badge variant="destructive">Admin Only</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                        <code className="text-xs text-gray-500">
                          {link.url}
                        </code>
                      </div>
                      <div className="ml-4">
                        <Link href={link.url}>
                          <Button
                            variant={link.protected ? "default" : "outline"}
                            size="sm"
                          >
                            Test Access
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expected Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700">
                      ✅ When NOT logged in:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>
                        Public pages (Home, Stories, Destinations) should load
                        normally
                      </li>
                      <li>Protected pages should redirect to /login</li>
                      <li>Login/Register pages should be accessible</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-700">
                      🔑 When logged in as USER:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>All public pages should work</li>
                      <li>Dashboard, Profile, Forms should be accessible</li>
                      <li>Admin panel should redirect to dashboard</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-purple-700">
                      👑 When logged in as ADMIN:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>All pages should be accessible</li>
                      <li>Admin panel should load normally</li>
                      <li>Navigation should show "Admin" link</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demo Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Demo User</h4>
                    <p className="text-sm text-blue-700">Username: demo</p>
                    <p className="text-sm text-blue-700">Password: demo</p>
                    <p className="text-xs text-blue-600 mt-1">Role: USER</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Admin User</h4>
                    <p className="text-sm text-purple-700">
                      Email: admin@erasmus.cy
                    </p>
                    <p className="text-sm text-purple-700">
                      Password: admin123
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Role: ADMIN</p>
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
