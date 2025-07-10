import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import Header from "../components/Header";
import StepCard from "../components/StepCard";
import TeaserGallery from "../components/TeaserGallery";
import LocationBrowser from "../components/LocationBrowser";
import ExchangeHighlights from "../components/ExchangeHighlights";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { ArrowRight, Users, BookOpen, Home, Heart, Globe } from "lucide-react";

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
  totalUniversities: number;
}

export default function HomePage({ totalUniversities }: HomePageProps) {
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

              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop"
                  alt="Students studying abroad"
                  className="rounded-2xl shadow-2xl"
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
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    1. Explore Destinations
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Browse 500+ partner universities and discover where you can
                    study
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2. Read Student Stories
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get insights from students who've studied at your target
                    destinations
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    3. Start Your Application
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Use our step-by-step guide to complete your Erasmus
                    application
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/destinations">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 mr-4"
                  >
                    Start Exploring
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/student-stories">
                  <Button variant="outline" size="lg">
                    Read Stories First
                  </Button>
                </Link>
              </div>
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
                <StepCard key={step.step} {...step} />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Access Cards */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Destinations
              </h2>
              <p className="text-xl text-gray-600">
                Explore the most sought-after study destinations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link
                href="/destinations"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Choose your destination
                </h3>
                <p className="text-gray-600">
                  Explore universities and cities across Europe
                </p>
              </Link>

              <Link
                href="/student-stories"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Read student stories
                </h3>
                <p className="text-gray-600">
                  Get insights from students who've been there
                </p>
              </Link>

              <Link
                href="/student-accommodations"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Secure your stay
                </h3>
                <p className="text-gray-600">
                  Find accommodation where other students lived
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Teaser Gallery */}
        <TeaserGallery />

        {/* Exchange Highlights */}
        <ExchangeHighlights />

        {/* Location Browser */}
        <LocationBrowser />

        {/* University Partnerships Section */}
        <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                University Partnerships
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore comprehensive partnership agreements between Cyprus
                universities and institutions across Europe
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  500+ Destinations
                </h3>
                <p className="text-gray-600 text-center">
                  Partner universities across 30+ European countries
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  All Academic Fields
                </h3>
                <p className="text-gray-600 text-center">
                  From Engineering to Arts, Medicine to Business
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {totalUniversities} Cyprus Universities
                </h3>
                <p className="text-gray-600 text-center">
                  UNIC, UCY, UCLan, Frederick, and EUC partnerships
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/destinations">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                  Explore All Destinations
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Connect and Help Others Section */}
        <section className="py-16 lg:py-24 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Connect and Help Others
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join our community of Erasmus students and help others make the
              most of their study abroad experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8"
                >
                  Join Community
                </Button>
              </Link>
              <Link href="/share-story">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8"
                >
                  Share Your Story
                </Button>
              </Link>
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
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li className="mt-2">
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li className="mt-2">
                    <Link
                      href="/community"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Community
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch latest 3 stories for display
    const latestStories = await prisma.story.findMany({
      take: 3,
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
        totalUniversities: 5,
      },
    };
  }
};
