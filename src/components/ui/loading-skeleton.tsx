import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({
  className = "",
  width,
  height,
  rounded = false,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`animate-pulse bg-gray-200 ${rounded ? "rounded-full" : "rounded"} ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton height="200px" />
      <Skeleton height="24px" width="75%" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="60%" />
      <div className="flex gap-2 pt-2">
        <Skeleton height="32px" width="80px" />
        <Skeleton height="32px" width="60px" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center p-4 border rounded">
          <Skeleton width="40px" height="40px" rounded />
          <div className="flex-1 space-y-2">
            <Skeleton height="16px" width="30%" />
            <Skeleton height="14px" width="60%" />
          </div>
          <Skeleton height="32px" width="80px" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4">
          <Skeleton width="50px" height="50px" rounded />
          <div className="flex-1 space-y-2">
            <Skeleton height="20px" width="40%" />
            <Skeleton height="16px" width="80%" />
            <Skeleton height="14px" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}
