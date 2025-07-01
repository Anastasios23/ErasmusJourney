import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

const ConnectionTester = () => {
  const [status, setStatus] = useState<
    "idle" | "testing" | "connected" | "failed"
  >("idle");

  const testConnection = async () => {
    setStatus("testing");

    // Wrap in try-catch and use setTimeout to prevent error bubbling
    setTimeout(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          try {
            controller.abort();
          } catch {
            // Silently ignore abort errors
          }
        }, 2000);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/health`,
          {
            method: "GET",
            signal: controller.signal,
          },
        ).catch(() => {
          // Catch fetch errors at the promise level
          return null;
        });

        clearTimeout(timeoutId);

        if (response && response.ok) {
          setStatus("connected");
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("failed");
          setTimeout(() => setStatus("idle"), 3000);
        }
      } catch (error) {
        // Silent error handling
        setStatus("failed");
        setTimeout(() => setStatus("idle"), 3000);
      }
    }, 0);
  };

  if (status === "idle") {
    return (
      <Button
        onClick={testConnection}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-40"
      >
        Test Backend Connection
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Badge
        variant={
          status === "connected"
            ? "default"
            : status === "failed"
              ? "destructive"
              : "secondary"
        }
        className={`
          flex items-center space-x-2 px-3 py-2
          ${status === "connected" ? "bg-green-600 text-white" : ""}
          ${status === "failed" ? "bg-red-600 text-white" : ""}
          ${status === "testing" ? "bg-blue-600 text-white" : ""}
        `}
      >
        {status === "testing" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "connected" && <Wifi className="h-4 w-4" />}
        {status === "failed" && <WifiOff className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {status === "testing" && "Testing..."}
          {status === "connected" && "Backend Connected!"}
          {status === "failed" && "Connection Failed"}
        </span>
      </Badge>
    </div>
  );
};

export default ConnectionTester;
