import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "../src/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function BackButton({
  fallbackUrl = "/",
  className = "",
  variant = "ghost",
  size = "sm",
}: BackButtonProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBack = async () => {
    try {
      console.log("Back button clicked"); // Debug log

      // Check if there's a previous page in the session
      const canGoBack =
        typeof window !== "undefined" &&
        window.history.length > 1 &&
        document.referrer !== "" &&
        document.referrer.includes(window.location.origin);

      console.log("Can go back:", canGoBack); // Debug log

      if (canGoBack) {
        router.back();
      } else {
        // If no history or came from external site, go to fallback URL
        await router.push(fallbackUrl);
      }
    } catch (error) {
      console.error("Error in back navigation:", error);
      // Fallback to home page if there's an error
      router.push("/");
    }
  };

  // Don't show back button on home page
  if (router.pathname === "/") {
    return null;
  }

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className} opacity-50`}
        disabled
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    );
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      type="button"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
