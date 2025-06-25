import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/health`,
        {
          method: "GET",
          signal: controller.signal,
          cache: "no-cache",
        },
      );

      clearTimeout(timeoutId);
      if (response.ok) {
        setIsConnected(true);
        setRetryCount(0); // Reset retry count on success
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      // Only log error details in development
      if (import.meta.env.DEV) {
        console.warn("Backend connection check failed:", error);
      }
      setIsConnected(false);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Use exponential backoff for retries when disconnected
    const getInterval = () => {
      if (isConnected) return 30000; // 30 seconds when connected
      return Math.min(5000 * Math.pow(2, retryCount), 60000); // Exponential backoff, max 60s
    };

    const interval = setInterval(checkConnection, getInterval());
    return () => clearInterval(interval);
  }, [isConnected, retryCount]);

  // Don't show anything on initial load
  if (isConnected === null && !isChecking) return null;

  // Auto-hide when connected for more than 10 seconds
  const [showWhenConnected, setShowWhenConnected] = useState(true);
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => setShowWhenConnected(false), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowWhenConnected(true);
    }
  }, [isConnected]);

  // Don't show when connected and auto-hide timer has passed
  if (isConnected && !showWhenConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className={`
          flex items-center space-x-2 px-3 py-2 cursor-pointer transition-all duration-200
          ${isChecking ? "animate-pulse" : ""}
          ${isConnected ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
        `}
        onClick={checkConnection}
        title={
          isConnected
            ? "Backend is connected"
            : `Backend unavailable. Working offline. Click to retry.`
        }
      >
        {isChecking ? (
          <AlertCircle className="h-4 w-4 animate-spin" />
        ) : isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isChecking
            ? "Checking..."
            : isConnected
              ? "Connected"
              : "Offline Mode"}
        </span>
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
