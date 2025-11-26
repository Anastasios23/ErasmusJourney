import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "../lib/prisma";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Home,
  Globe,
  Star,
  CheckCircle,
  MapPin,
  Users,
  Plane,
} from "lucide-react";

interface Story {
  id: string;
  title?: string;
  studentName?: string;
  excerpt?: string | null;
  story?: string;
  imageUrl?: string | null;
  createdAt: string;
  city?: string;
  country?: string;
  university?: string;
  author?: {
    name: string;
  };
  likes?: number;
}

interface HomePageProps {
  totalUniversities: number;
  latestStories: Story[];
}

export default function HomePage({
  totalUniversities,
  latestStories,
}: HomePageProps) {
  return (
    <>
      <Head>
        <title>Erasmus Journey - Share & Discover Student Experiences</title>
        <meta
          name="description"
          content="The easiest way to share your Erasmus experience and help future students. Find accommodation reviews, course matching, and city guides."
        />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5 text-sm font-medium rounded-full transition-colors">
              ✨ The Official Platform for Erasmus Students
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Share Your <span className="text-blue-600">Erasmus Story</span>
              <br />
              Inspire Future Students
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of students helping each other. Share your experience about courses, accommodation, and city life in just 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/basic-information">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-7 h-auto rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-semibold"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/destinations">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 text-lg px-10 py-7 h-auto rounded-full font-medium"
                >
                  Explore Destinations
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>500+ Universities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Verified Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Free for Everyone</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Link href="/submissions" className="group">
                <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    <Plane className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Share Experience</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Help others by rating your university, housing, and cost of living. Your insights matter.
                  </p>
                  <span className="text-blue-600 font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    Start Sharing <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>

              {/* Feature 2 */}
              <Link href="/student-accommodations" className="group">
                <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                    <Home className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Housing</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Discover verified student accommodations and read honest reviews from previous tenants.
                  </p>
                  <span className="text-green-600 font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    Browse Housing <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>

              {/* Feature 3 */}
              <Link href="/university-exchanges" className="group">
                <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Match Courses</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    See which courses are approved for credit transfer at your host university.
                  </p>
                  <span className="text-purple-600 font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    Check Courses <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works - Simplified */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 text-lg">Three simple steps to start your journey</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>

              {/* Step 1 */}
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-900 z-10">
                  <span className="text-3xl font-bold text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create Profile</h3>
                <p className="text-gray-400">Sign up in seconds to save your progress and access all features.</p>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-900 z-10">
                  <span className="text-3xl font-bold text-blue-400">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Fill Details</h3>
                <p className="text-gray-400">Complete the 5-step form about your university, housing, and costs.</p>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-900 z-10">
                  <span className="text-3xl font-bold text-blue-400">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Help Others</h3>
                <p className="text-gray-400">Submit your experience to help thousands of future Erasmus students.</p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href="/register">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 font-semibold">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Stories (Preserved) */}
        {latestStories && latestStories.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Stories</h2>
                  <p className="text-gray-600">Real experiences from real students</p>
                </div>
                <Link href="/student-stories" className="text-blue-600 font-medium hover:underline hidden sm:block">
                  View all stories →
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {latestStories.map((story) => (
                  <Link key={story.id} href={`/stories/${story.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-none shadow-sm">
                      <div className="aspect-video relative overflow-hidden rounded-t-xl">
                        <Image
                          src={story.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=240&fit=crop"}
                          alt={story.title || "Student story"}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <MapPin className="h-3 w-3" />
                          {story.city}, {story.country}
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                          {story.title || `${story.studentName}'s Experience`}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {story.excerpt || story.story || "Read about this experience..."}
                        </p>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                            {story.studentName?.[0] || "S"}
                          </div>
                          {story.studentName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          {story.likes || 0}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 text-center sm:hidden">
                <Link href="/student-stories">
                  <Button variant="outline" className="w-full">View all stories</Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  try {
    if (!prisma) {
      return { props: { totalUniversities: 0, latestStories: [] } };
    }

    const totalUniversities = await prisma.universities.count();

    // Fetch stories from form_submissions for now (legacy compatibility)
    const storySubmissions = await prisma.form_submissions.findMany({
      where: {
        OR: [
          { type: "EXPERIENCE", status: { in: ["SUBMITTED", "PUBLISHED"] } },
          { type: "STORY", status: { in: ["SUBMITTED", "PUBLISHED"] } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const latestStories = await Promise.all(
      storySubmissions.map(async (submission) => {
        const userData = await prisma.user.findUnique({
          where: { id: submission.userId },
          select: { firstName: true },
        });

        const basicInfo = await prisma.formSubmission.findFirst({
          where: { userId: submission.userId, type: "BASIC_INFO", status: "SUBMITTED" },
        });

        return {
          id: submission.id,
          studentName: (submission.data as any).nickname || userData?.firstName || "Student",
          university: (basicInfo?.data as any)?.hostUniversity || "University",
          city: (basicInfo?.data as any)?.hostCity || "City",
          country: (basicInfo?.data as any)?.hostCountry || "Country",
          story: (submission.data as any).personalExperience || (submission.data as any).adviceForFutureStudents || "",
          createdAt: submission.createdAt.toISOString(),
          likes: 0,
        };
      })
    );

    return {
      props: {
        totalUniversities,
        latestStories,
      },
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      props: {
        totalUniversities: 0,
        latestStories: [],
      },
    };
  }
};
