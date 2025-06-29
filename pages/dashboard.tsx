import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import Head from "next/head";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import Header from "@/src/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

interface DashboardProps {
  user: UserData;
  applications: Application[];
  stories: Story[];
  stats: {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    totalStories: number;
    totalLikes: number;
  };
}

export default function DashboardPage({
  user,
  applications,
  stories,
  stats,
}: DashboardProps) {
  const profileCompletion = calculateProfileCompletion(user);

  return (
    <>
      <Head>
        <title>Dashboard - Erasmus Journey Platform</title>
        <meta name="description" content="Your Erasmus Journey dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Track your Erasmus journey and explore new opportunities.
              </p>
            </div>

            {/* Profile Completion */}
            {profileCompletion < 100 && (
              <Card className="mb-8 border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Complete Your Profile</span>
                    <Badge variant="secondary">{profileCompletion}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={profileCompletion} className="mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your profile to get better partnership
                    recommendations and increase your application success rate.
                  </p>
                  <Link href="/basic-information">
                    <Button>Complete Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.totalApplications}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Applications
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {stats.pendingApplications}
                  </div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.acceptedApplications}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {stats.totalStories}
                  </div>
                  <div className="text-sm text-gray-600">Stories Shared</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Applications */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Applications
                  </h2>
                  <Link href="/course-matching">
                    <Button variant="outline">New Application</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {applications.length > 0 ? (
                    applications.map((application) => (
                      <Card key={application.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">
                                {application.program.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {application.homeUniversity.name}
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
                              {application.status.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Partner:{" "}
                            {application.agreement.partnerUniversity.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            📍 {application.agreement.partnerUniversity.city},{" "}
                            {application.agreement.partnerUniversity.country}
                          </div>
                          {application.semester && (
                            <div className="text-sm text-gray-600 mt-1">
                              📅 {application.semester}{" "}
                              {application.academicYear}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500 mb-4">
                          No applications yet. Start your Erasmus journey!
                        </p>
                        <Link href="/course-matching">
                          <Button>Find Opportunities</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

              {/* Recent Stories */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Stories
                  </h2>
                  <Link href="/share-story">
                    <Button variant="outline">Share Story</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {stories.length > 0 ? (
                    stories.map((story) => (
                      <Card key={story.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold line-clamp-1">
                              {story.title}
                            </h3>
                            <Badge variant="secondary">
                              {story.category.toLowerCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {story.excerpt || "No excerpt available"}
                          </p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>
                              {story.isPublic ? "🌍 Public" : "🔒 Private"}
                            </span>
                            <div className="flex gap-4">
                              <span>❤️ {story.likes}</span>
                              <span>👁️ {story.views}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500 mb-4">
                          No stories shared yet. Share your experience!
                        </p>
                        <Link href="/share-story">
                          <Button>Share Your Story</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>
            </div>

            {/* Quick Actions */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/universities">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl mb-2">🏫</div>
                      <h3 className="font-semibold">Explore Universities</h3>
                      <p className="text-sm text-gray-600">
                        Discover partnership opportunities
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/student-stories">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl mb-2">📖</div>
                      <h3 className="font-semibold">Read Stories</h3>
                      <p className="text-sm text-gray-600">
                        Learn from other students
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/help-future-students">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl mb-2">💬</div>
                      <h3 className="font-semibold">Help Others</h3>
                      <p className="text-sm text-gray-600">
                        Share your knowledge
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </section>
          </div>
        </div>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        nationality: true,
        homeCountry: true,
        homeCity: true,
      },
    });

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    // Fetch user's applications
    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        homeUniversity: {
          select: { name: true, shortName: true },
        },
        program: {
          select: { name: true, level: true },
        },
        agreement: {
          include: {
            partnerUniversity: {
              select: { name: true, city: true, country: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Fetch user's stories
    const stories = await prisma.story.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        excerpt: true,
        category: true,
        isPublic: true,
        likes: true,
        views: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Calculate stats
    const [
      totalApplications,
      pendingApplications,
      acceptedApplications,
      totalStories,
      likesSum,
    ] = await Promise.all([
      prisma.application.count({ where: { userId: session.user.id } }),
      prisma.application.count({
        where: { userId: session.user.id, status: "SUBMITTED" },
      }),
      prisma.application.count({
        where: { userId: session.user.id, status: "ACCEPTED" },
      }),
      prisma.story.count({ where: { authorId: session.user.id } }),
      prisma.story.aggregate({
        where: { authorId: session.user.id },
        _sum: { likes: true },
      }),
    ]);

    return {
      props: {
        user,
        applications: applications.map((app) => ({
          ...app,
          createdAt: app.createdAt.toISOString(),
        })),
        stories: stories.map((story) => ({
          ...story,
          createdAt: story.createdAt.toISOString(),
        })),
        stats: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          totalStories,
          totalLikes: likesSum._sum.likes || 0,
        },
      },
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);

    // Fallback data if database is not available
    return {
      props: {
        user: {
          id: session.user.id,
          firstName: session.user.firstName || "User",
          lastName: session.user.lastName || "",
          email: session.user.email,
          nationality: null,
          homeCountry: null,
          homeCity: null,
        },
        applications: [],
        stories: [],
        stats: {
          totalApplications: 0,
          pendingApplications: 0,
          acceptedApplications: 0,
          totalStories: 0,
          totalLikes: 0,
        },
      },
    };
  }
};
