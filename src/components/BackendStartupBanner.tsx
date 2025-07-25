import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Server, ExternalLink } from "lucide-react";

const BackendStartupBanner = () => {
  const [isVisible, setIsVisible] = useState(true); // Show by default
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed this banner
    const dismissed = localStorage.getItem("backend-banner-dismissed");
    if (dismissed === "true") {
      setIsVisible(false);
      setHasBeenDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    localStorage.setItem("backend-banner-dismissed", "true");
  };

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
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <div className="bg-yellow-100 border border-yellow-200 rounded p-3">
            <p className="font-semibold text-yellow-900 mb-2">
              ⚠️ Backend Required for Full Functionality
            </p>
            <p className="text-yellow-800 text-sm">
              Authentication, form saving, and admin features require the
              backend server.
            </p>
          </div>

          <div className="bg-gray-50 border rounded p-3 font-mono text-sm">
            <p className="font-semibold mb-2">🚀 Quick Start:</p>
            <div className="space-y-1 text-gray-700">
              <p>cd server</p>
              <p>npm install</p>
              <p>npm run dev</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              onClick={() => {
                const instructions = `# Erasmus Journey Backend Setup

## Terminal Commands:
cd server
npm install
npm run dev

## Expected Output:
Server running on port 5000

## Then refresh this page
The connection status will show "Connected" when working.

## Troubleshooting:
- Make sure you're in the project root directory
- Check if port 5000 is available
- Try 'node index.js' if npm run dev fails`;

                navigator.clipboard.writeText(instructions).then(() => {
                  const notification = document.createElement("div");
                  notification.innerHTML =
                    "✅ Instructions copied to clipboard!";
                  notification.style.cssText =
                    "position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 6px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);";
                  document.body.appendChild(notification);
                  setTimeout(() => notification.remove(), 3000);
                });
              }}
            >
              📋 Copy Full Instructions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              onClick={() => {
                // Clear the dismissed flag and reload to test connection
                localStorage.removeItem("backend-banner-dismissed");
                window.location.reload();
              }}
            >
              🔄 Test Connection
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BackendStartupBanner;
