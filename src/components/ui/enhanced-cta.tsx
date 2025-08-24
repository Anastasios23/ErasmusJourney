import React from "react";
import Link from "next/link";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Users,
  Star,
  Clock,
  CheckCircle,
  Heart,
  TrendingUp,
  Globe,
} from "lucide-react";

interface SocialProofProps {
  studentCount?: number;
  rating?: number;
  recentActivity?: string;
  urgency?: string;
}

interface EnhancedCTAProps {
  title: string;
  description: string;
  primaryAction: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  socialProof?: SocialProofProps;
  variant?: "primary" | "success" | "urgent" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
  success: "bg-gradient-to-r from-green-600 to-teal-600 text-white",
  urgent: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  minimal: "bg-gray-50 border border-gray-200 text-gray-900",
};

const sizeStyles = {
  sm: "p-6",
  md: "p-8",
  lg: "p-12",
};

export function EnhancedCTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  socialProof,
  variant = "primary",
  size = "md",
  className,
  icon,
}: EnhancedCTAProps) {
  const isLightVariant = variant === "minimal";

  return (
    <div
      className={cn(
        "rounded-xl shadow-lg",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        {icon && (
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                "p-3 rounded-full",
                isLightVariant ? "bg-blue-100" : "bg-white/20",
              )}
            >
              {icon}
            </div>
          </div>
        )}

        {/* Main Content */}
        <h3
          className={cn(
            "text-2xl md:text-3xl font-bold mb-4",
            isLightVariant ? "text-gray-900" : "text-white",
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "text-lg mb-6 max-w-2xl mx-auto",
            isLightVariant ? "text-gray-600" : "text-white/90",
          )}
        >
          {description}
        </p>

        {/* Social Proof */}
        {socialProof && (
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {socialProof.studentCount && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
                  isLightVariant
                    ? "bg-blue-100 text-blue-800"
                    : "bg-white/20 text-white",
                )}
              >
                <Users className="h-4 w-4" />
                {socialProof.studentCount.toLocaleString()}+ students helped
              </div>
            )}

            {socialProof.rating && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
                  isLightVariant
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-white/20 text-white",
                )}
              >
                <Star className="h-4 w-4 fill-current" />
                {socialProof.rating}/5 rating
              </div>
            )}

            {socialProof.recentActivity && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
                  isLightVariant
                    ? "bg-green-100 text-green-800"
                    : "bg-white/20 text-white",
                )}
              >
                <TrendingUp className="h-4 w-4" />
                {socialProof.recentActivity}
              </div>
            )}

            {socialProof.urgency && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium animate-pulse",
                  isLightVariant
                    ? "bg-orange-100 text-orange-800"
                    : "bg-white/20 text-white",
                )}
              >
                <Clock className="h-4 w-4" />
                {socialProof.urgency}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={primaryAction.href}>
            <Button
              size="lg"
              className={cn(
                "min-w-[160px] shadow-lg",
                isLightVariant
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white text-blue-600 hover:bg-blue-50",
              )}
            >
              {primaryAction.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {secondaryAction && (
            <Link href={secondaryAction.href}>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "min-w-[160px]",
                  isLightVariant
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-white/30 text-white hover:bg-white/10",
                )}
              >
                {secondaryAction.text}
              </Button>
            </Link>
          )}
        </div>

        {/* Trust Indicators */}
        <div
          className={cn(
            "mt-6 text-sm",
            isLightVariant ? "text-gray-500" : "text-white/70",
          )}
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Free to use
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Trusted by universities
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              EU-wide support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preset CTA components for common use cases
export function ApplicationCTA({ className }: { className?: string }) {
  return (
    <EnhancedCTA
      title="Ready to Start Your Erasmus Journey?"
      description="Join thousands of Cyprus students who've successfully studied abroad with our comprehensive guidance and support."
      primaryAction={{
        text: "Start Application",
        href: "/basic-information",
      }}
      secondaryAction={{
        text: "Browse Destinations",
        href: "/destinations",
      }}
      socialProof={{
        studentCount: 2547,
        rating: 4.8,
        recentActivity: "12 students applied today",
        urgency: "Spring deadline in 45 days",
      }}
      variant="primary"
      className={className}
      icon={<Users className="h-6 w-6 text-blue-600" />}
    />
  );
}

export function StoryCTA({ className }: { className?: string }) {
  return (
    <EnhancedCTA
      title="Share Your Erasmus Story"
      description="Help future students by sharing your insights, tips, and memorable moments from your exchange experience."
      primaryAction={{
        text: "Share Your Story",
        href: "/share-story",
      }}
      secondaryAction={{
        text: "Read Stories",
        href: "/student-stories",
      }}
      socialProof={{
        studentCount: 456,
        rating: 4.9,
        recentActivity: "3 new stories this week",
      }}
      variant="success"
      className={className}
      icon={<Heart className="h-6 w-6 text-green-600" />}
    />
  );
}

export function CommunityJoinCTA({ className }: { className?: string }) {
  return (
    <EnhancedCTA
      title="Want to Help Future Students?"
      description="Share your Erasmus experience and become a mentor. Help future students navigate their exchange journey with confidence."
      primaryAction={{
        text: "Join as Mentor",
        href: "/help-future-students",
      }}
      secondaryAction={{
        text: "Explore Community",
        href: "/community",
      }}
      socialProof={{
        studentCount: 189,
        rating: 4.9,
        recentActivity: "5 students helped this week",
      }}
      variant="minimal"
      className={className}
      icon={<Users className="h-6 w-6 text-blue-600" />}
    />
  );
}
