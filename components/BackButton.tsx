import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function BackButton({
  fallbackUrl = "/",
  className = "",
  children,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Simple approach: always go to fallback URL for reliability
    router.push(fallbackUrl);
  };

  // Don't show on home page
  if (router.pathname === "/") {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${className}`}
      type="button"
    >
      <ArrowLeft className="h-4 w-4" />
      {children || "Back"}
    </button>
  );
}
