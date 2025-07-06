import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

const SimpleBackendStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      if (!isMounted) return;

      try {
        // Use manual timeout instead of AbortSignal.timeout for better compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          try {
            controller.abort();
          } catch {
            // Silently ignore abort errors
          }
        }, 1500);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/health`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (isMounted && response && response.ok) {
          setIsConnected(true);
        } else if (isMounted) {
          setIsConnected(false);
        }
      } catch (error) {
        // Completely silent error handling - no logging, no propagation
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    // Check connection every 30 seconds
    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Badge
        variant={isConnected ? "default" : "secondary"}
        className={`
          flex items-center space-x-2 px-3 py-2
          ${isConnected ? "bg-green-600 text-white" : "bg-gray-500 text-white"}
        `}
      >
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isConnected ? "Backend Online" : "Offline Mode"}
        </span>
      </Badge>
    </div>
  );
};

export default SimpleBackendStatus;
