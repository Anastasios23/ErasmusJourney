import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Server, ExternalLink } from "lucide-react";

const BackendStartupBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      if (hasChecked) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/health`,
          { method: "GET" },
        );

        if (!response.ok) {
          setIsVisible(true);
        }
      } catch (error) {
        setIsVisible(true);
      } finally {
        setHasChecked(true);
      }
    };

    // Delay the check to avoid showing immediately
    const timer = setTimeout(checkBackend, 2000);
    return () => clearTimeout(timer);
  }, [hasChecked]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
        <Server className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          Backend Server Not Running
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>
            The backend server is not running. The app will work in offline
            mode, but some features may be limited.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              onClick={() => {
                const instructions = `
To start the backend server:

1. Open a terminal
2. Navigate to the server folder: cd server
3. Install dependencies: npm install
4. Start the server: npm run dev

The server will run on http://localhost:5000
                `.trim();

                navigator.clipboard.writeText(instructions).then(() => {
                  alert("Instructions copied to clipboard!");
                });
              }}
            >
              Copy Setup Instructions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BackendStartupBanner;
