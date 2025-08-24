import { ErasmusIcon } from "@/components/icons/CustomIcons";
import Link from "next/link";

interface EnhancedLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function EnhancedLogo({
  className = "",
  showTagline = true,
  size = "md",
}: EnhancedLogoProps) {
  const sizeClasses = {
    sm: {
      icon: 28,
      title: "text-lg",
      tagline: "text-xs",
      spacing: "space-x-2",
    },
    md: {
      icon: 36,
      title: "text-xl",
      tagline: "text-xs",
      spacing: "space-x-3",
    },
    lg: {
      icon: 48,
      title: "text-2xl",
      tagline: "text-sm",
      spacing: "space-x-4",
    },
  };

  const config = sizeClasses[size];

  return (
    <Link
      href="/"
      className={`flex items-center ${config.spacing} group transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div className="relative">
        <ErasmusIcon
          size={config.icon}
          className="transition-all duration-300 group-hover:rotate-12 drop-shadow-sm"
        />
        <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span
            className={`${config.title} font-display font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight`}
          >
            Erasmus
          </span>
          <span
            className={`${config.title} font-display font-medium text-blue-600 dark:text-blue-400 ml-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors`}
          >
            Journey
          </span>
        </div>
        {showTagline && (
          <div className="flex items-center space-x-1 -mt-0.5">
            <span
              className={`${config.tagline} font-medium text-gray-700 dark:text-gray-300 transition-opacity ${showTagline ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              Cyprus Edition
            </span>
            <div className="w-1 h-1 rounded-full bg-blue-500 opacity-60"></div>
            <span
              className={`${config.tagline} font-medium text-blue-600 dark:text-blue-400 opacity-80`}
            >
              EU Programme
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
