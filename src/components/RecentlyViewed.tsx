import React from "react";
import Link from "next/link";
import { Clock, X, MapPin, User, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";

interface RecentlyViewedProps {
  maxItems?: number;
  showClearAll?: boolean;
  className?: string;
}

export function RecentlyViewed({
  maxItems = 5,
  showClearAll = true,
  className = "",
}: RecentlyViewedProps) {
  const { recentItems, removeRecentItem, clearRecentItems, hasRecentItems } =
    useRecentlyViewed();

  if (!hasRecentItems) {
    return null;
  }

  const displayItems = recentItems.slice(0, maxItems);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "story":
        return <User className="h-4 w-4" />;
      case "accommodation":
        return <MapPin className="h-4 w-4" />;
      case "destination":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "story":
        return "bg-blue-100 text-blue-800";
      case "accommodation":
        return "bg-green-100 text-green-800";
      case "destination":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
      return "Recently";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Recently Viewed
          </CardTitle>
          {showClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecentItems}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 mt-1">
              <Badge variant="outline" className={getTypeColor(item.type)}>
                {getTypeIcon(item.type)}
                <span className="ml-1 capitalize">{item.type}</span>
              </Badge>
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={item.url}
                className="block hover:text-blue-600 transition-colors"
              >
                <h3 className="font-medium text-sm line-clamp-1 mb-1">
                  {item.title}
                </h3>
                {item.metadata && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    {item.metadata.city && item.metadata.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.metadata.city}, {item.metadata.country}
                      </span>
                    )}
                    {item.metadata.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.metadata.author}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(item.timestamp)}
                </p>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRecentItem(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {recentItems.length > maxItems && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All {recentItems.length} Items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
