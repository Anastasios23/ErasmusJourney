import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import FormProgress from "../components/FormProgress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Progress } from "../src/components/ui/progress";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  nationality: string | null;
  homeCountry: string | null;
  homeCity: string | null;
}

interface Application {
  id: string;
  status: string;
  semester: string | null;
  academicYear: string | null;
  createdAt: string;
  homeUniversity: {
    name: string;
    shortName: string;
  };
  program: {
    name: string;
    level: string;
  };
  agreement: {
    partnerUniversity: {
      name: string;
      city: string;
      country: string;
    };
  };
}

interface Story {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Use session data or fallback to demo data
  const user = {
    id: session?.user?.id || session?.user?.email || "demo",
    firstName:
      (session?.user as any)?.firstName ||
      session?.user?.name?.split(" ")[0] ||
      "Demo",
    lastName:
      (session?.user as any)?.lastName ||
      session?.user?.name?.split(" ")[1] ||
      "User",
    email: session?.user?.email || "demo@erasmus.cy",
    nationality: "Cypriot",
    homeCountry: "Cyprus",
    homeCity: "Nicosia",
  };

  const applications: Application[] = [];
  const stories: Story[] = [];
  const stats = {
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    totalStories: 0,
    totalLikes: 0,
  };

  const profileCompletion = calculateProfileCompletion(user);

  return (
    <>
      <Head>
        <title>Dashboard - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Your personal Erasmus journey dashboard"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Track your Erasmus journey and discover new opportunities.
              </p>
            </div>

            {/* Profile Completion Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Completion
                  <Badge variant="outline" className="ml-2">
                    {profileCompletion}% Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={profileCompletion} className="w-full mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link href="/basic-information">
                    <Button variant="outline" size="sm">
                      Complete Profile
                    </Button>
                  </Link>
                  <Link href="/course-matching">
                    <Button variant="outline" size="sm">
                      Course Matching
                    </Button>
                  </Link>
                  <Link href="/accommodation">
                    <Button variant="outline" size="sm">
                      Find Housing
                    </Button>
                  </Link>
                </div>
                {profileCompletion < 100 && (
                  <p className="text-sm text-gray-600">
                    Complete your profile to unlock personalized recommendations
                    and connect with universities.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Applications & Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalApplications}
                      </div>
                      <div className="text-sm text-gray-600">Applications</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.pendingApplications}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.acceptedApplications}
                      </div>
                      <div className="text-sm text-gray-600">Accepted</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.totalStories}
                      </div>
                      <div className="text-sm text-gray-600">Stories</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Applications Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <div
                            key={application.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">
                                {application.program.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {application.agreement.partnerUniversity.name},{" "}
                                {application.agreement.partnerUniversity.city}
                              </p>
                              <p className="text-xs text-gray-500">
                                {application.semester}{" "}
                                {application.academicYear}
                              </p>
                            </div>
                            <Badge
                              variant={
                                application.status === "ACCEPTED"
                                  ? "default"
                                  : application.status === "SUBMITTED"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          No applications yet. Start your journey!
                        </p>
                        <Link href="/destinations">
                          <Button>Explore Destinations</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Your Stories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Your Stories
                      <Link href="/share-story">
                        <Button variant="outline" size="sm">
                          Share Story
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stories.length > 0 ? (
                      <div className="space-y-4">
                        {stories.map((story) => (
                          <div key={story.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">
                                  {story.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {story.excerpt}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>❤️ {story.likes} likes</span>
                                  <span>👁️ {story.views} views</span>
                                  <Badge variant="outline" className="text-xs">
                                    {story.category}
                                  </Badge>
                                </div>
                              </div>
                              <Badge
                                variant={story.isPublic ? "default" : "outline"}
                              >
                                {story.isPublic ? "Public" : "Private"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          Share your Erasmus experience with others!
                        </p>
                        <Link href="/share-story">
                          <Button>Write Your First Story</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Actions & Recommendations */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/basic-information" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        📝 Update Profile
                      </Button>
                    </Link>
                    <Link href="/destinations" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        🏫 Browse Destinations
                      </Button>
                    </Link>
                    <Link href="/destinations" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        �� Find Destinations
                      </Button>
                    </Link>
                    <Link href="/student-accommodations" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        🏠 Find Housing
                      </Button>
                    </Link>
                    <Link href="/student-stories" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        📖 Read Stories
                      </Button>
                    </Link>
                    <Link href="/community" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        👥 Join Community
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Recommended for You */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended for You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          Complete Your Profile
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Add more details to get personalized recommendations.
                        </p>
                        <Link href="/basic-information">
                          <Button size="sm">Complete Now</Button>
                        </Link>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          Explore Popular Destinations
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Discover the most popular study abroad destinations.
                        </p>
                        <Link href="/destinations">
                          <Button size="sm" variant="outline">
                            Explore
                          </Button>
                        </Link>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Share Your Story</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Help future students by sharing your experience.
                        </p>
                        <Link href="/share-story">
                          <Button size="sm" variant="outline">
                            Share
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function calculateProfileCompletion(user: UserData): number {
  const fields = [
    user.firstName,
    user.lastName,
    user.email,
    user.nationality,
    user.homeCountry,
    user.homeCity,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}
