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
  Award,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useFormSubmissions } from "../hooks/useFormSubmissions";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Skeleton } from "./ui/skeleton";

interface DashboardWidgetProps {
  userProfile?: any;
}

const DashboardWidgets: React.FC<DashboardWidgetProps> = ({ userProfile }) => {
  const { submissions, isLoading: submissionsLoading } = useFormSubmissions();
  const { stats, loading: statsLoading } = useDashboardStats();

  // Define the core steps for the application
  const coreApplicationSteps = [
    "basic-info",
    "course-matching",
    "accommodation",
    "living-expenses",
    "experience",
  ];

  const completedSteps = coreApplicationSteps.filter((step) =>
    submissions.some((s) => s.type === step && s.status !== "DRAFT"),
  ).length;

  const applicationProgress =
    coreApplicationSteps.length > 0
      ? (completedSteps / coreApplicationSteps.length) * 100
      : 0;

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
          {submissionsLoading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-7 w-1/4" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {Math.round(applicationProgress)}%
              </div>
              <Progress value={applicationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedSteps} of {coreApplicationSteps.length} steps
                completed.
              </p>
              <Link href="/dashboard">
                <Button size="sm" className="w-full">
                  Continue Application
                </Button>
              </Link>
            </div>
          )}
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
          {statsLoading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.deadlines.map((deadline, index) => (
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
          )}
        </CardContent>
      </Card>

      {/* Personalized Recommendations Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recommendations.map((rec, index) => (
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
          )}
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
          {statsLoading ? (
            <div className="grid grid-cols-2 gap-4 text-center pt-2">
              <div>
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
              </div>
              <div>
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
              </div>
              <div>
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
              </div>
              <div>
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{completedSteps}</div>
                <p className="text-xs text-muted-foreground">Forms Completed</p>
              </div>
              <div>
                <div className="text-lg font-bold">{stats?.daysActive}</div>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {stats?.universitiesViewed}
                </div>
                <p className="text-xs text-muted-foreground">
                  Universities Viewed
                </p>
              </div>
              <div>
                <div className="text-lg font-bold">{stats?.storiesRead}</div>
                <p className="text-xs text-muted-foreground">Stories Read</p>
              </div>
            </div>
          )}
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
          {statsLoading ? (
            <div className="space-y-3 pt-2 text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-sm font-medium">
                {applicationProgress > 99
                  ? "Application Complete!"
                  : "Profile Pro"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {applicationProgress > 99
                  ? "Congratulations on finishing your application!"
                  : `You've completed ${completedSteps} key steps.`}
              </p>
            </div>
          )}
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
            <p className="text-sm text-center text-muted-foreground py-4">
              Community features coming soon!
            </p>
            <Link href="/community">
              <Button size="sm" variant="outline" className="w-full">
                Browse Community
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWidgets;
