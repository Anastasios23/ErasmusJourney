import { useSession, signOut } from "next-auth/react";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface AuthErrorHandlerProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function AuthErrorHandler({
  error,
  onRetry,
  className,
}: AuthErrorHandlerProps) {
  const { data: session } = useSession();

  const handleSignOutAndIn = async () => {
    try {
      // Sign out and redirect to sign in
      await signOut({
        callbackUrl: window.location.href,
        redirect: true,
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      // Fallback: refresh the page
      window.location.reload();
    }
  };

  if (
    error.message.includes("sign out and sign in") ||
    error.message.includes("session has expired")
  ) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Session Refresh Required
          </CardTitle>
          <CardDescription className="text-orange-700">
            Your session needs to be refreshed to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-orange-700">{error.message}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSignOutAndIn}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Session
            </Button>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Try Again
              </Button>
            )}
          </div>
          {session && (
            <div className="mt-4 p-3 bg-orange-100 rounded-md">
              <p className="text-xs text-orange-600">
                Current session: {session.user?.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For other authentication errors
  if (error.name === "AuthenticationError") {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-700">{error.message}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSignOutAndIn}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sign In Again
            </Button>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Return null for non-auth errors (let parent component handle)
  return null;
}

export default AuthErrorHandler;
