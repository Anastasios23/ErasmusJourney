import { GetServerSideProps } from "next";
import Head from "next/head";
import { prisma } from "../lib/prisma";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
  university: {
    name: string;
    country: string;
  } | null;
  category: string;
  likes: number;
  views: number;
}

interface HomePageProps {
  latestStories: Story[];
  totalUniversities: number;
  totalPartnerships: number;
}

export default function HomePage({
  latestStories,
  totalUniversities,
  totalPartnerships,
}: HomePageProps) {
  return (
    <>
      <Head>
        <title>Erasmus Journey Platform - Connect, Share, Explore</title>
        <meta
          name="description"
          content="Connect with fellow Erasmus students, share your experiences, and explore partnership opportunities across Cyprus universities."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />

        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Your <span className="text-blue-600">Erasmus Journey</span> Starts
              Here
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with fellow students, share your experiences, and discover
              partnership opportunities across Cyprus universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/universities">
                <Button size="lg" className="text-lg px-8 py-3">
                  Explore Universities
                </Button>
              </Link>
              <Link href="/stories">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  Read Stories
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {totalUniversities}
                </div>
                <div className="text-gray-600">Partner Universities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {totalPartnerships}+
                </div>
                <div className="text-gray-600">Active Partnerships</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {latestStories.length}
                </div>
                <div className="text-gray-600">Student Stories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Stories Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Latest Stories
              </h2>
              <p className="text-gray-600 text-lg">
                Discover experiences from students around the world
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestStories.map((story) => (
                <Card
                  key={story.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{story.category}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {story.excerpt ||
                        "Read this amazing Erasmus experience..."}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        by {story.author.firstName} {story.author.lastName}
                      </span>
                      <div className="flex gap-4">
                        <span>❤️ {story.likes}</span>
                        <span>👁️ {story.views}</span>
                      </div>
                    </div>
                    {story.university && (
                      <div className="mt-2 text-sm text-blue-600">
                        📍 {story.university.name}, {story.university.country}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {latestStories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  No stories yet. Be the first to share your experience!
                </div>
                <Link href="/share-story">
                  <Button className="mt-4">Share Your Story</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students exploring educational opportunities
              across Europe.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch latest 10 stories with author and university info
    const latestStories = await prisma.story.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: { isPublic: true },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        university: {
          select: {
            name: true,
            country: true,
          },
        },
      },
    });

    // Get total counts for stats
    const [totalUniversities, totalPartnerships] = await Promise.all([
      prisma.university.count(),
      prisma.agreement.count({ where: { isActive: true } }),
    ]);

    return {
      props: {
        latestStories: latestStories.map((story) => ({
          ...story,
          createdAt: story.createdAt.toISOString(),
        })),
        totalUniversities,
        totalPartnerships,
      },
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);

    // Fallback data if database is not available
    return {
      props: {
        latestStories: [],
        totalUniversities: 5,
        totalPartnerships: 1000,
      },
    };
  }
};
