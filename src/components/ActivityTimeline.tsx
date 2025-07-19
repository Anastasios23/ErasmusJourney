import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  User,
  BookOpen,
  Home,
  Euro,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type:
    | "profile"
    | "application"
    | "accommodation"
    | "course"
    | "story"
    | "message";
  title: string;
  description: string;
  timestamp: Date;
  status?: "completed" | "pending" | "in_progress";
  url?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "profile",
    title: "Profile Updated",
    description: "You updated your personal information",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "completed",
    url: "/profile",
  },
  {
    id: "2",
    type: "application",
    title: "Basic Information Saved",
    description: "Your basic application information has been saved as draft",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "completed",
    url: "/basic-information",
  },
  {
    id: "3",
    type: "accommodation",
    title: "Accommodation Search",
    description: "You searched for accommodations in Barcelona, Spain",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: "completed",
    url: "/student-accommodations",
  },
  {
    id: "4",
    type: "course",
    title: "Course Matching Pending",
    description: "Complete your course matching preferences",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: "pending",
    url: "/course-matching",
  },
  {
    id: "5",
    type: "story",
    title: "Welcome to Erasmus Journey!",
    description: "Your account was created successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    status: "completed",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "profile":
      return User;
    case "application":
      return FileText;
    case "accommodation":
      return Home;
    case "course":
      return BookOpen;
    case "story":
      return MessageSquare;
    default:
      return Clock;
  }
};

const getActivityColor = (type: string, status?: string) => {
  if (status === "pending") return "text-yellow-600 bg-yellow-100";
  if (status === "completed") return "text-green-600 bg-green-100";

  switch (type) {
    case "profile":
      return "text-blue-600 bg-blue-100";
    case "application":
      return "text-purple-600 bg-purple-100";
    case "accommodation":
      return "text-orange-600 bg-orange-100";
    case "course":
      return "text-indigo-600 bg-indigo-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          In Progress
        </Badge>
      );
    default:
      return null;
  }
};

const ActivityTimeline: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type, activity.status);

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {activity.url && (
                  <a
                    href={activity.url}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
