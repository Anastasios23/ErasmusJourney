import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class StudentStoryErrorBoundary extends React.Component<
  React.PropsWithChildren<{ onRetry?: () => void }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ onRetry?: () => void }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "StudentStoryErrorBoundary caught an error:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              We encountered an error while loading the student stories. Please
              try again.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-sm text-red-600 cursor-pointer">
                  Technical details
                </summary>
                <pre className="text-xs bg-red-100 p-2 rounded mt-2 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onRetry?.();
                }}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-red-700 hover:bg-red-100"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function StoryCardSkeleton({
  count = 3,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || <AlertCircle className="h-8 w-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
