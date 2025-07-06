import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, X } from "lucide-react";

interface AuthErrorBannerProps {
  message?: string;
  onDismiss?: () => void;
  showSignIn?: boolean;
}

export default function AuthErrorBanner({
  message = "Your session has expired. Please sign in again to continue.",
  onDismiss,
  showSignIn = true,
}: AuthErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleSignIn = () => {
    signIn();
  };

  if (!isVisible) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <span>{message}</span>
          <div className="flex items-center gap-2 ml-4">
            {showSignIn && (
              <Button
                size="sm"
                onClick={handleSignIn}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Sign In
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-orange-600 hover:text-orange-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
