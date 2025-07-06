import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { prisma } from "../lib/prisma";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Search,
  ArrowRight,
  Users,
  BookOpen,
  Home,
  Globe,
  Plane,
  Heart,
  Edit3,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";

interface HubPageProps {
  stats: {
    totalUniversities: number;
    totalPartnerships: number;
    totalStories: number;
    totalDestinations: number;
  };
}

export default function HubPage({ stats }: HubPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to destinations with search query
      window.location.href = `/destinations?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const exploreOptions = [
    {
      title: "University Destinations",
      description: "Browse 500+ partner universities across Europe",
      icon: BookOpen,
      href: "/destinations",
      color: "bg-blue-500",
      stats: `${stats.totalDestinations} destinations`,
    },
    {
      title: "Student Stories",
      description: "Real experiences from Erasmus students",
      icon: Users,
      href: "/student-stories",
      color: "bg-green-500",
      stats: `${stats.totalStories} stories`,
    },
    {
      title: "Accommodation",
      description: "Find verified student housing options",
      icon: Home,
      href: "/student-accommodations",
      color: "bg-orange-500",
      stats: "Verified listings",
    },
    {
      title: "University Exchanges",
      description: "Explore partnership agreements",
      icon: Globe,
      href: "/university-exchanges",
      color: "bg-purple-500",
      stats: `${stats.totalPartnerships} partnerships`,
    },
  ];

  const contributeOptions = [
    {
      title: "Share Your Story",
      description: "Help future students with your experience",
      icon: Edit3,
      href: "/share-story",
      color: "bg-pink-500",
    },
    {
      title: "Rate Accommodations",
      description: "Review places where you've stayed",
      icon: Star,
      href: "/rate-accommodation",
      color: "bg-indigo-500",
    },
    {
      title: "Join Community",
      description: "Connect with other Erasmus students",
      icon: Heart,
      href: "/community",
      color: "bg-red-500",
    },
    {
      title: "Suggest Improvements",
      description: "Help us make the platform better",
      icon: TrendingUp,
      href: "/feedback",
      color: "bg-cyan-500",
    },
  ];

  return (
    <>
      <Head>
        <title>Erasmus Hub - Your Complete Study Abroad Platform</title>
        <meta
          name="description"
          content="Central hub for Cyprus students planning their Erasmus journey. Explore destinations, read stories, find accommodation, and contribute to the community."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                <Plane className="h-4 w-4 mr-2" />
                Your Erasmus Journey Starts Here
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Erasmus Hub
              </h1>

              <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                The central platform for Cyprus students planning their study
                abroad adventure. Discover destinations, connect with peers, and
                make informed decisions.
              </p>

              {/* Global Search */}
              <div className="max-w-2xl mx-auto mb-12">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search destinations, universities, cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg bg-white/95 backdrop-blur-sm border-white/20 placeholder:text-gray-500"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                  >
                    Search
                  </Button>
                </form>
                <p className="text-blue-200 text-sm mt-2">
                  Try searching: "Germany", "Computer Science", "Barcelona"
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {stats.totalDestinations}+
                  </div>
                  <div className="text-blue-200 text-sm">Destinations</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {stats.totalUniversities}
                  </div>
                  <div className="text-blue-200 text-sm">Universities</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {stats.totalPartnerships}+
                  </div>
                  <div className="text-blue-200 text-sm">Partnerships</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {stats.totalStories}+
                  </div>
                  <div className="text-blue-200 text-sm">Student Stories</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Action Sections */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Explore Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  🌍 Explore Opportunities
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover everything you need to plan your perfect Erasmus
                  experience
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {exploreOptions.map((option) => (
                  <Link key={option.title} href={option.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <CardHeader className="pb-4">
                        <div
                          className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <option.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {option.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-3">
                          {option.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {option.stats}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/destinations">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Exploring
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contribute Section */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 lg:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  🤝 Contribute & Connect
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Share your knowledge and help future Erasmus students succeed
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {contributeOptions.map((option) => (
                  <Link key={option.title} href={option.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white/70 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div
                          className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <option.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                          {option.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{option.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/community">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Join the Community
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Quick Actions
              </h2>
              <p className="text-xl text-gray-600">
                Common tasks our students use daily
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link href="/basic-information" className="group">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Start Application
                  </h3>
                  <p className="text-gray-600">
                    Begin your Erasmus application with our step-by-step guide
                  </p>
                </div>
              </Link>

              <Link href="/destinations?featured=true" className="group">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    Popular Destinations
                  </h3>
                  <p className="text-gray-600">
                    Explore the most popular study abroad destinations
                  </p>
                </div>
              </Link>

              <Link href="/course-matching" className="group">
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    Course Matching
                  </h3>
                  <p className="text-gray-600">
                    Find courses that match your academic requirements
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of Cyprus students who have successfully completed
              their Erasmus experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/basic-information">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Begin Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/student-stories">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8"
                >
                  Read Success Stories
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch stats for KPIs
    const [totalUniversities, totalPartnerships, totalStories] =
      await Promise.all([
        prisma.university.count(),
        prisma.agreement.count({ where: { isActive: true } }),
        prisma.story.count({ where: { isPublic: true } }),
      ]);

    // Calculate total destinations from partnerships
    const totalDestinations = await prisma.agreement.count({
      where: { isActive: true },
      distinct: ["partnerUniversityId"],
    });

    return {
      props: {
        stats: {
          totalUniversities,
          totalPartnerships,
          totalStories,
          totalDestinations,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching hub page stats:", error);

    // Fallback data if database is not available
    return {
      props: {
        stats: {
          totalUniversities: 5,
          totalPartnerships: 1000,
          totalStories: 150,
          totalDestinations: 500,
        },
      },
    };
  }
};
