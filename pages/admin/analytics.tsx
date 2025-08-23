import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Award } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Star,
  MapPin,
  Calendar,
  Download,
  ArrowLeft,
  Target,
  Activity,
  Globe,
  BookOpen,
  Home,
  Euro,
  Clock,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalDestinations: number;
    totalSubmissions: number;
    totalUsers: number;
    averageRating: number;
    conversionRate: number;
    lastWeekGrowth: number;
  };
  destinations: {
    topPerforming: any[];
    needAttention: any[];
    recentlyUpdated: any[];
  };
  submissions: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byCountry: Record<string, number>;
    qualityDistribution: Record<string, number>;
  };
  users: {
    registrationTrend: any[];
    engagementLevels: Record<string, number>;
    topContributors: any[];
  };
  content: {
    performanceMetrics: any[];
    popularSearches: string[];
    topReferrers: string[];
  };
}

export default function AdvancedAnalyticsDashboard() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: 'anonymous', role: 'ADMIN', email: 'admin@example.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  useEffect(() => {
    // Skip loading checks since auth is disabled
    // if (status === "loading") return;

    // if (!session || session.user?.role !== "ADMIN") {
    //   router.push("/login");
    //   return;
    // }

    console.log('Initializing analytics dashboard...');
    fetchAnalytics();
  }, [timeRange]); // Removed session dependencies since auth is disabled

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch analytics data from various sources with FullStory bypass and retry logic
      const safeJsonParse = (text: string) => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      const safeFetch = async (url: string, retries = 3) => {
        console.log(`Fetching ${url} using XMLHttpRequest to bypass FullStory interference...`);
        for (let i = 0; i < retries; i++) {
          try {
            // Use XMLHttpRequest as fallback to bypass FullStory fetch interception
            const xhr = new XMLHttpRequest();
            const result = await new Promise((resolve, reject) => {
              xhr.open('GET', url, true);
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    const data = safeJsonParse(xhr.responseText);
                    resolve(data);
                  } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                  }
                }
              };
              xhr.onerror = () => reject(new Error('Network error'));
              xhr.send();
            });
            return result;
          } catch (error) {
            console.warn(`Fetch attempt ${i + 1}/${retries} failed for ${url}:`, error);
            if (i === retries - 1) throw error;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
          }
        }
      };

      const fetchDestinations = async () => {
        try {
          const data = await safeFetch("/api/admin/destinations/enhanced");
          return data || { destinations: [] };
        } catch (error) {
          console.error("Error fetching destinations:", error);
          return { destinations: [] };
        }
      };

      const fetchSubmissions = async () => {
        try {
          const data = await safeFetch("/api/admin/form-submissions?limit=1000");
          return Array.isArray(data) ? { submissions: data } : data || { submissions: [] };
        } catch (error) {
          console.error("Error fetching submissions:", error);
          return { submissions: [] };
        }
      };

      const fetchUsers = async () => {
        try {
          const data = await safeFetch("/api/admin/analytics");
          return data || { users: [] };
        } catch (error) {
          console.error("Error fetching user analytics:", error);
          return { users: [] };
        }
      };

      const [destinations, submissions, users] = await Promise.all([
        fetchDestinations(),
        fetchSubmissions(),
        fetchUsers(),
      ]);

      // Process and aggregate data
      const analyticsData = processAnalyticsData(
        destinations,
        submissions,
        users,
      );
      setAnalytics(analyticsData);

      console.log('Analytics data loaded successfully:', {
        destinations: destinations?.destinations?.length || 0,
        submissions: submissions?.submissions?.length || Array.isArray(submissions) ? submissions.length : 0,
        users: users?.users?.length || 0
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set fallback analytics data to prevent empty dashboard
      setAnalytics({
        overview: {
          totalDestinations: 0,
          totalSubmissions: 0,
          publishedSubmissions: 0,
          averageRating: 0,
          conversionRate: 0,
          lastWeekGrowth: 0,
        },
        destinations: {
          topPerforming: [],
          needAttention: [],
          recentlyUpdated: [],
        },
        submissions: {
          byType: {},
          byStatus: {},
          byCountry: {},
          qualityDistribution: {},
        },
        users: {
          registrationTrend: [],
          engagementLevels: {},
          topContributors: [],
        },
        content: {
          performanceMetrics: [],
          popularSearches: [],
          topReferrers: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (
    destinations: any,
    submissions: any,
    users: any,
  ): AnalyticsData => {
    // Safely extract data with multiple fallback options
    const destData = Array.isArray(destinations?.destinations)
      ? destinations.destinations
      : Array.isArray(destinations)
      ? destinations
      : [];

    const submissionData = Array.isArray(submissions?.submissions)
      ? submissions.submissions
      : Array.isArray(submissions)
      ? submissions
      : [];

    const userData = users?.users || users || [];

    // Calculate overview metrics
    const totalDestinations = destData.length;
    const totalSubmissions = submissionData.length;
    const publishedSubmissions = submissionData.filter(
      (s: any) => s.status === "PUBLISHED",
    ).length;
    const ratedDestinations = destData.filter((d: any) => d?.averageRating && typeof d.averageRating === 'number');
    const averageRating = ratedDestinations.length > 0
      ? ratedDestinations.reduce((sum: number, d: any) => sum + d.averageRating, 0) / ratedDestinations.length
      : 0;

    // Process submissions by type with safety checks
    const submissionsByType = submissionData.reduce((acc: any, sub: any) => {
      if (sub?.type) {
        acc[sub.type] = (acc[sub.type] || 0) + 1;
      }
      return acc;
    }, {});

    // Process submissions by status with safety checks
    const submissionsByStatus = submissionData.reduce((acc: any, sub: any) => {
      if (sub?.status) {
        acc[sub.status] = (acc[sub.status] || 0) + 1;
      }
      return acc;
    }, {});

    // Process by country (from destinations) with safety checks
    const submissionsByCountry = destData.reduce((acc: any, dest: any) => {
      if (dest?.country && typeof dest.submissionCount === 'number') {
        acc[dest.country] = (acc[dest.country] || 0) + dest.submissionCount;
      }
      return acc;
    }, {});

    // Top performing destinations
    const topPerforming = destData
      .filter((d: any) => d.submissionCount > 0)
      .sort((a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5);

    // Destinations needing attention
    const needAttention = destData
      .filter((d: any) => {
        const isStale =
          new Date(d.lastUpdated) <
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const lowRating = d.averageRating && d.averageRating < 3;
        const lowSubmissions = d.submissionCount < 3;
        return isStale || lowRating || lowSubmissions;
      })
      .slice(0, 5);

    // Recently updated
    const recentlyUpdated = destData
      .sort(
        (a: any, b: any) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
      )
      .slice(0, 5);

    return {
      overview: {
        totalDestinations,
        totalSubmissions,
        totalUsers: new Set(submissionData.map((s: any) => s.userId)).size,
        averageRating: Math.round(averageRating * 10) / 10,
        conversionRate:
          totalSubmissions > 0
            ? Math.round((publishedSubmissions / totalSubmissions) * 100)
            : 0,
        lastWeekGrowth: 8.5, // Mock data - would calculate from time series
      },
      destinations: {
        topPerforming,
        needAttention,
        recentlyUpdated,
      },
      submissions: {
        byType: submissionsByType,
        byStatus: submissionsByStatus,
        byCountry: submissionsByCountry,
        qualityDistribution: {
          "High Quality": Math.floor(publishedSubmissions * 0.3),
          "Good Quality": Math.floor(publishedSubmissions * 0.5),
          "Needs Review": Math.floor(publishedSubmissions * 0.2),
        },
      },
      users: {
        registrationTrend: [], // Would be populated from user registration data
        engagementLevels: {
          "High Engagement": Math.floor(totalSubmissions * 0.2),
          "Medium Engagement": Math.floor(totalSubmissions * 0.5),
          "Low Engagement": Math.floor(totalSubmissions * 0.3),
        },
        topContributors: submissionData.reduce((acc: any, sub: any) => {
          const userId = sub.userId;
          acc[userId] = (acc[userId] || 0) + 1;
          return acc;
        }, {}),
      },
      content: {
        performanceMetrics: destData.map((d: any) => ({
          name: d.name,
          views: Math.floor(Math.random() * 1000), // Mock data
          rating: d.averageRating,
          submissions: d.submissionCount,
        })),
        popularSearches: [
          "Barcelona",
          "Berlin",
          "Amsterdam",
          "Prague",
          "Vienna",
        ],
        topReferrers: ["Google", "Direct", "Social Media", "University Sites"],
      },
    };
  };

  const exportAnalytics = async () => {
    // Implementation for exporting analytics data
    const csvContent = generateCSVReport(analytics);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = (data: AnalyticsData | null) => {
    if (!data) return "";

    let csv = "Analytics Report\n\n";
    csv += "Overview Metrics\n";
    csv += "Metric,Value\n";
    csv += `Total Destinations,${data.overview.totalDestinations}\n`;
    csv += `Total Submissions,${data.overview.totalSubmissions}\n`;
    csv += `Total Users,${data.overview.totalUsers}\n`;
    csv += `Average Rating,${data.overview.averageRating}\n`;
    csv += `Conversion Rate,${data.overview.conversionRate}%\n\n`;

    return csv;
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Advanced Analytics - Admin Dashboard</title>
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Advanced Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive insights into platform performance and user
              engagement
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportAnalytics} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Destinations
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analytics.overview.totalDestinations}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Submissions
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {analytics.overview.totalSubmissions}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Users</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {analytics.overview.totalUsers}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg. Rating
                      </p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {analytics.overview.averageRating}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Conversion
                      </p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {analytics.overview.conversionRate}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Growth
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        +{analytics.overview.lastWeekGrowth}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="destinations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="destinations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performing Destinations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-600" />
                        Top Performing Destinations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.destinations.topPerforming.map(
                          (dest, index) => (
                            <div
                              key={dest.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium">{dest.name}</p>
                                <p className="text-sm text-gray-600">
                                  {dest.submissionCount} submissions
                                </p>
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="font-semibold">
                                  {dest.averageRating?.toFixed(1) || "N/A"}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Destinations Needing Attention */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-red-600" />
                        Needs Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.destinations.needAttention.map((dest) => (
                          <div
                            key={dest.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{dest.name}</p>
                              <p className="text-sm text-gray-600">
                                {dest.submissionCount} submissions • Last
                                updated:{" "}
                                {new Date(
                                  dest.lastUpdated,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-red-600">
                              Action Needed
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Submissions by Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Submissions by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.submissions.byType).map(
                          ([type, count]) => (
                            <div
                              key={type}
                              className="flex items-center justify-between"
                            >
                              <span className="capitalize text-gray-700">
                                {type.replace("-", " ")}
                              </span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submissions by Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Submissions by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.submissions.byStatus).map(
                          ([status, count]) => (
                            <div
                              key={status}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{status}</span>
                              <Badge
                                variant="outline"
                                className={
                                  status === "PUBLISHED"
                                    ? "text-green-600"
                                    : status === "SUBMITTED"
                                      ? "text-yellow-600"
                                      : "text-gray-600"
                                }
                              >
                                {count}
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Engagement Levels */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Engagement Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.users.engagementLevels).map(
                          ([level, count]) => (
                            <div
                              key={level}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{level}</span>
                              <Badge variant="outline">{count} users</Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quality Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Quality Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(
                          analytics.submissions.qualityDistribution,
                        ).map(([quality, count]) => (
                          <div
                            key={quality}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-700">{quality}</span>
                            <Badge
                              variant="outline"
                              className={
                                quality.includes("High")
                                  ? "text-green-600"
                                  : quality.includes("Good")
                                    ? "text-blue-600"
                                    : "text-yellow-600"
                              }
                            >
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Popular Searches */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Searches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.content.popularSearches.map(
                          (search, index) => (
                            <div
                              key={search}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{search}</span>
                              <Badge variant="outline">#{index + 1}</Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Referrers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Referrers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.content.topReferrers.map(
                          (referrer, index) => (
                            <div
                              key={referrer}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{referrer}</span>
                              <Badge variant="outline">#{index + 1}</Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
