import { useRouter } from "next/router";
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

  const handleBack = () => {
    // Check if there's a previous page in the session
    const canGoBack = window.history.length > 1 && document.referrer !== "";

    if (canGoBack) {
      router.back();
    } else {
      // If no history or came from external site, go to fallback URL
      router.push(fallbackUrl);
    }
  };

  // Don't show back button on home page
  if (router.pathname === "/") {
    return null;
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
