import { cn } from "@/lib/utils";
import { brandingTokens } from "@/utils/brandingTokens";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Heading Components with consistent branding
export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "text-4xl font-display font-bold tracking-tight",
      brandingTokens.colors.text.primary,
      className
    )}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "text-3xl font-display font-semibold tracking-tight",
      brandingTokens.colors.text.primary,
      className
    )}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "text-2xl font-display font-semibold tracking-tight",
      brandingTokens.colors.text.primary,
      className
    )}>
      {children}
    </h3>
  );
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "text-xl font-display font-medium tracking-tight",
      brandingTokens.colors.text.primary,
      className
    )}>
      {children}
    </h4>
  );
}

// Body Text Components
export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-lg font-sans leading-relaxed",
      brandingTokens.colors.text.secondary,
      className
    )}>
      {children}
    </p>
  );
}

export function BodyText({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-base font-sans leading-relaxed",
      brandingTokens.colors.text.secondary,
      className
    )}>
      {children}
    </p>
  );
}

export function SmallText({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm font-sans",
      brandingTokens.colors.text.tertiary,
      className
    )}>
      {children}
    </p>
  );
}

// Special text components
export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-xl font-sans text-muted-foreground leading-relaxed",
      brandingTokens.colors.text.secondary,
      className
    )}>
      {children}
    </p>
  );
}

export function Caption({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-xs font-medium uppercase tracking-wider",
      brandingTokens.colors.text.tertiary,
      className
    )}>
      {children}
    </span>
  );
}

// Brand-specific text
export function BrandText({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "font-display font-semibold",
      brandingTokens.colors.text.accent,
      className
    )}>
      {children}
    </span>
  );
}
