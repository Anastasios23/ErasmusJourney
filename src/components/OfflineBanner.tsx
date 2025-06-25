import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, X, RefreshCw } from "lucide-react";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/health`,
        { method: "GET" },
      );
      setIsOffline(!response.ok);
    } catch (error) {
      setIsOffline(true);
    }
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    await checkConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline || isDismissed) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <strong>Offline Mode:</strong> Backend server is not available. You
          can still use the app with limited functionality. Your data will be
          saved locally.
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={retryConnection}
            disabled={isRetrying}
            className="border-orange-300 text-orange-800 hover:bg-orange-100"
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-orange-800 hover:bg-orange-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OfflineBanner;
