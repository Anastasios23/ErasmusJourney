import React from "react";
import {
  MapPin,
  GraduationCap,
  Users,
  Euro,
  Home,
  Calendar,
  Globe,
  Star,
  BookOpen,
  Heart,
  Plane,
  TrendingUp,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  Share2,
} from "lucide-react";

/**
 * Standardized icon sizes for consistent visual hierarchy
 */
export const ICON_SIZES = {
  xs: "h-3 w-3", // 12px - Very small badges, inline text
  sm: "h-4 w-4", // 16px - Buttons, small badges, navigation
  md: "h-5 w-5", // 20px - Default size, cards, forms
  lg: "h-6 w-6", // 24px - Section headers, important actions
  xl: "h-8 w-8", // 32px - Page headers, hero sections
  "2xl": "h-10 w-10", // 40px - Large decorative icons
} as const;

/**
 * Standardized color classes for consistent theming
 */
export const ICON_COLORS = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  muted: "text-gray-400",
  white: "text-white",
} as const;

/**
 * Semantic icon mapping for consistent usage across the app
 */
export const SEMANTIC_ICONS = {
  // Navigation & Structure
  location: MapPin,
  university: GraduationCap,
  users: Users,
  home: Home,
  calendar: Calendar,
  globe: Globe,

  // Content & Data
  star: Star,
  rating: Star,
  book: BookOpen,
  document: FileText,

  // Actions
  edit: Edit,
  delete: Trash2,
  download: Download,
  filter: Filter,
  search: Search,
  favorite: Heart,
  share: Share2,
  external: ExternalLink,

  // Status
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  pending: Clock,
  view: Eye,

  // Navigation
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  next: ArrowRight,
  previous: ArrowLeft,

  // Contact
  email: Mail,
  phone: Phone,
  message: MessageCircle,

  // Financial
  cost: Euro,

  // Platform Specific
  travel: Plane,
  trending: TrendingUp,
  settings: Settings,
} as const;

/**
 * Utility component for consistent icon rendering
 */
interface StandardIconProps {
  icon: keyof typeof SEMANTIC_ICONS;
  size?: keyof typeof ICON_SIZES;
  color?: keyof typeof ICON_COLORS;
  className?: string;
}

export function StandardIcon({
  icon,
  size = "md",
  color = "secondary",
  className = "",
}: StandardIconProps) {
  const IconComponent = SEMANTIC_ICONS[icon];
  const sizeClass = ICON_SIZES[size];
  const colorClass = ICON_COLORS[color];

  return (
    <IconComponent className={`${sizeClass} ${colorClass} ${className}`} />
  );
}

export default StandardIcon;
