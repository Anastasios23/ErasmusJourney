import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Server } from "lucide-react";

const SimpleSetupBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after a delay if not previously dismissed
    const dismissed = localStorage.getItem("setup-banner-dismissed");
    if (dismissed !== "true") {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("setup-banner-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Server className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          Backend Setup Required
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-blue-700">
            To enable login, form saving, and admin features, start the backend
            server:
          </p>

          <div className="bg-blue-100 border border-blue-200 rounded p-3 font-mono text-sm">
            <div className="space-y-1 text-blue-800">
              <p>
                <strong>cd server</strong>
              </p>
              <p>
                <strong>npm install</strong>
              </p>
              <p>
                <strong>npm run dev</strong>
              </p>
            </div>
          </div>

          <p className="text-blue-600 text-sm">
            The app works offline but full features require the backend server.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SimpleSetupBanner;
