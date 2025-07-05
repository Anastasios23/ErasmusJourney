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
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to fallback URL
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
