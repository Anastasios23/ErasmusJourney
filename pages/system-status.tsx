import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Globe,
} from "lucide-react";

interface SystemCheck {
  id: string;
  name: string;
  description: string;
  status: "healthy" | "warning" | "error" | "checking";
  lastChecked?: Date;
  details?: string;
  icon: React.ReactNode;
}

export default function SystemStatusPage() {
  const [checks, setChecks] = useState<SystemCheck[]>([
    {
      id: "api",
      name: "API Server",
      description: "Main API endpoints and server health",
      status: "checking",
      icon: <Server className="w-5 h-5" />,
    },
    {
      id: "database",
      name: "Database Connection",
      description: "Prisma client and SQLite database",
      status: "checking",
      icon: <Database className="w-5 h-5" />,
    },
    {
      id: "partnerships",
      name: "Partnership Analytics",
      description: "Partnership data processing and analytics",
      status: "checking",
      icon: <Network className="w-5 h-5" />,
    },
    {
      id: "destinations",
      name: "Destination System",
      description: "Destination generation and management",
      status: "checking",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      id: "storage",
      name: "File Storage",
      description: "Image uploads and static file serving",
      status: "checking",
      icon: <HardDrive className="w-5 h-5" />,
    },
  ]);

  const [isRunningChecks, setIsRunningChecks] = useState(false);

  const runSystemChecks = async () => {
    setIsRunningChecks(true);

    // Update all to checking status
    setChecks((prev) =>
      prev.map((check) => ({ ...check, status: "checking" as const })),
    );

    const checkPromises = checks.map(async (check) => {
      try {
        let response;
        let updatedCheck = { ...check };

        switch (check.id) {
          case "api":
            // Check if server is running
            response = await fetch("/api/health", {
              method: "GET",
              signal: AbortSignal.timeout(5000),
            });
            updatedCheck.status = response.ok ? "healthy" : "error";
            updatedCheck.details = response.ok
              ? "API server responding"
              : "API server not responding";
            break;

          case "database":
            // Check database connection
            response = await fetch("/api/admin/partnerships", {
              method: "GET",
              signal: AbortSignal.timeout(5000),
            });
            updatedCheck.status = response.ok ? "healthy" : "error";
            updatedCheck.details = response.ok
              ? "Database queries working"
              : "Database connection failed";
            break;

          case "partnerships":
            // Check partnership analytics
            response = await fetch("/api/admin/partnerships/analytics", {
              method: "GET",
              signal: AbortSignal.timeout(5000),
            });
            const data = await response.json();
            updatedCheck.status = response.ok && data ? "healthy" : "error";
            updatedCheck.details = response.ok
              ? "Analytics processing correctly"
              : "Analytics endpoint failed";
            break;

          case "destinations":
            // Check destination generation
            response = await fetch("/api/destinations/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ testMode: true }),
              signal: AbortSignal.timeout(10000),
            });
            updatedCheck.status = response.ok ? "healthy" : "warning";
            updatedCheck.details = response.ok
              ? "Destination generation working"
              : "Destination generation may have issues";
            break;

          case "storage":
            // Check static file serving
            response = await fetch("/favicon.ico", {
              method: "GET",
              signal: AbortSignal.timeout(5000),
            });
            updatedCheck.status = response.ok ? "healthy" : "warning";
            updatedCheck.details = response.ok
              ? "Static files serving correctly"
              : "Static file serving may have issues";
            break;

          default:
            updatedCheck.status = "warning";
            updatedCheck.details = "Check not implemented";
        }

        updatedCheck.lastChecked = new Date();
        return updatedCheck;
      } catch (error) {
        return {
          ...check,
          status: "error" as const,
          details: `Check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          lastChecked: new Date(),
        };
      }
    });

    const results = await Promise.all(checkPromises);
    setChecks(results);
    setIsRunningChecks(false);
  };

  useEffect(() => {
    // Run initial checks
    runSystemChecks();
  }, []);

  const getStatusIcon = (status: SystemCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "checking":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: SystemCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "checking":
        return <Badge className="bg-blue-100 text-blue-800">Checking...</Badge>;
    }
  };

  const healthyCount = checks.filter((c) => c.status === "healthy").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;
  const errorCount = checks.filter((c) => c.status === "error").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <p className="mt-2 text-gray-600">
              Monitor the health and performance of all system components
            </p>
          </div>

          <Button
            onClick={runSystemChecks}
            disabled={isRunningChecks}
            className="min-w-[120px]"
          >
            {isRunningChecks ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Healthy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {healthyCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {warningCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {errorCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Cpu className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    System Health
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {errorCount === 0
                      ? warningCount === 0
                        ? "100%"
                        : "85%"
                      : "60%"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Status Checks */}
        <div className="space-y-4">
          {checks.map((check) => (
            <Card key={check.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center space-x-2">
                      {check.icon}
                      {getStatusIcon(check.status)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {check.name}
                        </h3>
                        {getStatusBadge(check.status)}
                      </div>

                      <p className="text-gray-600 mb-2">{check.description}</p>

                      {check.details && (
                        <p className="text-sm text-gray-500">{check.details}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    {check.lastChecked && (
                      <p>
                        Last checked: {check.lastChecked.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Framework</p>
                <p className="text-gray-600">Next.js 15.4.5</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Database</p>
                <p className="text-gray-600">SQLite with Prisma ORM</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Runtime</p>
                <p className="text-gray-600">Node.js</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Last Deployment</p>
                <p className="text-gray-600">Local Development</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Environment</p>
                <p className="text-gray-600">Development</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Version</p>
                <p className="text-gray-600">1.0.0-beta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
