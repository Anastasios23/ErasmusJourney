import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  TrendingUp,
  MapPin,
  Calendar,
  Star,
  Users,
  Clock,
  Target,
  Award,
} from "lucide-react";
import Link from "next/link";

interface DashboardWidgetProps {
  userProfile?: any;
}

const DashboardWidgets: React.FC<DashboardWidgetProps> = ({ userProfile }) => {
  const stats = {
    applicationProgress: 60,
    deadlines: [
      {
        title: "Course Matching Deadline",
        date: "2024-02-15",
        priority: "high",
      },
      {
        title: "Accommodation Application",
        date: "2024-02-28",
        priority: "medium",
      },
    ],
    recommendations: [
      {
        title: "Complete Your Profile",
        description: "Add more details to get better recommendations",
        action: "Update Profile",
        url: "/profile",
      },
      {
        title: "Explore Barcelona",
        description: "Based on your preferences, Barcelona might be perfect",
        action: "Learn More",
        url: "/destinations/barcelona",
      },
    ],
    recentConnections: [
      { name: "Ana M.", location: "Barcelona", status: "online" },
      { name: "Carlos R.", location: "Madrid", status: "offline" },
      { name: "Elena P.", location: "Valencia", status: "online" },
    ],
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Application Progress Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Application Progress
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">
              {stats.applicationProgress}%
            </div>
            <Progress value={stats.applicationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You're making great progress! Keep going.
            </p>
            <Link href="/dashboard">
              <Button size="sm" className="w-full">
                Continue Application
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Deadlines
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.deadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{deadline.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(deadline.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={getPriorityColor(deadline.priority)}
                >
                  {deadline.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recommendations.map((rec, index) => (
              <div key={index} className="space-y-2">
                <h4 className="text-sm font-medium">{rec.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {rec.description}
                </p>
                <Link href={rec.url}>
                  <Button size="sm" variant="outline" className="w-full">
                    {rec.action}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Connections Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Connections
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentConnections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {connection.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connection.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {connection.location}
                    </p>
                  </div>
                </div>
                <div
                  className={`h-2 w-2 rounded-full ${
                    connection.status === "online"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
            <Link href="/community">
              <Button size="sm" variant="outline" className="w-full">
                Browse Community
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badge Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Latest Achievement
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-sm font-medium">Profile Complete</h4>
              <p className="text-xs text-muted-foreground">
                You've completed your basic profile information!
              </p>
            </div>
            <Link href="/achievements">
              <Button size="sm" variant="outline" className="w-full">
                View All Achievements
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Your Journey Stats
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">3</div>
                <p className="text-xs text-muted-foreground">Forms Completed</p>
              </div>
              <div>
                <div className="text-lg font-bold">12</div>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div>
                <div className="text-lg font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Universities Viewed
                </p>
              </div>
              <div>
                <div className="text-lg font-bold">8</div>
                <p className="text-xs text-muted-foreground">Stories Read</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWidgets;
