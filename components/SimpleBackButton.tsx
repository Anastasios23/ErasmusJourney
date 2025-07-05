import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

interface SimpleBackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

export default function SimpleBackButton({
  fallbackUrl = "/",
  className = "",
}: SimpleBackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        console.log("Simple back button clicked!");
        router.push(fallbackUrl);
      }}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 ${className}`}
      type="button"
    >
      <ArrowLeft className="h-4 w-4" />
      Go Back
    </button>
  );
}
