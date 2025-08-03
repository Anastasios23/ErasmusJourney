import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "../lib/prisma";
import Header from "../components/Header";
import TeaserGallery from "../components/TeaserGallery";
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
  Users,
  BookOpen,
  Home,
  Heart,
  Globe,
  Star,
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
  location?: {
    city: string;
    country: string;
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
  const steps = [
    {
      step: 1,
      title: "Personal Information",
      description: "Share your academic background and mobility details",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=240&fit=crop",
      href: "/basic-information",
      color: "bg-blue-500",
    },
    {
      step: 2,
      title: "Course Matching",
      description: "Details about courses and academic equivalents",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=240&fit=crop",
      href: "/course-matching",
      color: "bg-green-500",
    },
    {
      step: 3,
      title: "Accommodation Details",
      description: "Housing information and recommendations",
      image:
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=240&fit=crop",
      href: "/accommodation",
      color: "bg-orange-500",
    },
    {
      step: 4,
      title: "Living Expenses",
      description: "Budget planning and lifestyle information",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop",
      href: "/living-expenses",
      color: "bg-purple-500",
    },
  ];

  return (
    <>
      <Head>
        <title>Erasmus Journey Platform - Complete Guide to Study Abroad</title>
        <meta
          name="description"
          content="Your complete Erasmus journey guide. Connect with students, find accommodation, and get insider tips for study abroad adventure."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 bg-blue-100 text-blue-800">
                  ✨ Your Journey Starts Here
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Your Complete{" "}
                  <span className="text-blue-600">Erasmus Journey</span>{" "}
                  Platform
                </h1>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  The ultimate guide for Cyprus students planning their Erasmus
                  exchange. From university partnerships to accommodation, we
                  simplify your study abroad experience.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <p className="text-blue-800 font-medium">
                    🎯 <strong>For Cyprus Students:</strong> Access verified
                    partnerships between your university and 500+ European
                    destinations. Get step-by-step guidance from application to
                    arrival.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/destinations">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Explore Destinations
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/student-stories">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Read Stories
                      <BookOpen className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative aspect-[3/2] rounded-2xl shadow-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop"
                  alt="Students studying abroad"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">10,000+</p>
                      <p className="text-sm text-gray-600">Students helped</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                🚀 Getting Started
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                New to Erasmus? Start here to understand the platform and
                discover what's possible for your study abroad journey.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Link href="/destinations">
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      Explore Destinations
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Browse 500+ partner universities and discover where you
                      can study abroad
                    </p>
                    <div className="flex items-center justify-center mt-4 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
                <Link href="/student-accommodations">
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <Home className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      Accommodation
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Find student housing, dormitories, and accommodation
                      options at your destination
                    </p>
                    <div className="flex items-center justify-center mt-4 text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
                <Link href="/university-exchanges">
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                      <BookOpen className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      Exchanges
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Discover university exchange programs and academic
                      opportunities worldwide
                    </p>
                    <div className="flex items-center justify-center mt-4 text-orange-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Stories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Latest Student Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Read real experiences from students who have been there.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestStories && latestStories.length > 0 ? (
                latestStories.map((story) => (
                  <Link key={story.id} href={`/stories/${story.id}`}>
                    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="p-0">
                        <div className="aspect-video relative">
                          <Image
                            src={
                              story.imageUrl ||
                              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=240&fit=crop"
                            }
                            alt={
                              story.title ||
                              story.studentName ||
                              "Student story"
                            }
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 flex-grow">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                          {story.title ||
                            `${story.studentName}'s Experience in ${story.city}`}
                        </CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {story.excerpt ||
                            story.story?.substring(0, 150) + "..." ||
                            "Read about this student's experience abroad"}
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                        <div>
                          By{" "}
                          <span className="font-medium text-gray-800">
                            {story.author?.name || story.studentName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span>{story.likes}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No stories yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to share your Erasmus experience!
                  </p>
                  <Link href="/student-stories">
                    <Button variant="outline">
                      Share Your Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="text-center mt-12">
              <Link href="/student-stories">
                <Button variant="outline">
                  Read More Stories <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Essential Steps Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Your Application Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow our comprehensive guide to make your Erasmus journey
                smooth and memorable. Each step builds on the previous one.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <Image
                      src={step.image}
                      alt={`${step.title} - Step ${step.step}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute top-4 left-4">
                      <div
                        className={`${step.color} text-white px-3 py-1 rounded-full text-sm font-medium`}
                      >
                        Step {step.step}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Application Button */}
            <div className="text-center mt-12">
              {/* Login Requirement Notice */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-sm">🔒</span>
                  </div>
                  <span className="text-blue-800 font-medium text-sm">
                    Account Required
                  </span>
                </div>
                <p className="text-blue-700 text-sm">
                  You'll need an account to save and submit your application
                  details. Don't worry - it's quick and free!
                </p>
              </div>

              <Link href="/basic-information">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  Start Your Application Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-gray-600 text-sm mt-3">
                Begin with Step 1: Personal Information
              </p>

              {/* Value Without Login Notice */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm mb-2">
                  Want to explore first? You can browse destinations and read
                  stories without an account.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href="/destinations"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Browse Destinations →
                  </Link>
                  <Link
                    href="/student-stories"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Read Stories →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Teaser Gallery */}
        <TeaserGallery />

        {/* Become a Mentor Section */}
        <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Give Back as a Mentor
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Share your Erasmus experience and help the next generation of
                students navigate their study abroad journey. Join our alumni
                mentorship program.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Share Your Experience
                </h3>
                <p className="text-gray-600 text-center">
                  Help students with application tips, cultural insights, and
                  practical advice
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Make an Impact
                </h3>
                <p className="text-gray-600 text-center">
                  Guide students through their journey and watch them succeed
                  abroad
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Build Networks
                </h3>
                <p className="text-gray-600 text-center">
                  Connect with fellow alumni and expand your professional
                  network
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/help-future-students">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                  Become a Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Open to all Erasmus alumni • Flexible commitment • Make a
                difference
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-2 gap-8 border-t border-gray-200 pt-16 mt-16">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-gray-900">
                    Erasmus Journey
                  </span>
                </div>
                <p className="text-gray-600">
                  Empowering students to make the most of their Erasmus
                  experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <a
                      href="mailto:support@erasmusjourney.com?subject=Help Request"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Email Support
                    </a>
                  </li>
                  <li className="mt-2">
                    <Link
                      href="/community"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Community Help
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      href="/student-stories"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Student Stories
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
              © 2024 Erasmus Journey. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context,
) => {
  try {
    const totalUniversities = await prisma.university.count();

    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host;
    const apiUrl = `${protocol}://${host}/api/student-stories`;

    const storiesRes = await fetch(apiUrl);
    if (!storiesRes.ok) {
      throw new Error(
        `Failed to fetch stories with status: ${storiesRes.status}`,
      );
    }
    const storiesData = await storiesRes.json();
    const latestStories = storiesData.stories.slice(0, 3); // Take the top 3

    return {
      props: {
        totalUniversities,
        latestStories,
      },
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    // Fallback data if database or API is not available
    return {
      props: {
        totalUniversities: 50,
        latestStories: [],
      },
    };
  }
};
