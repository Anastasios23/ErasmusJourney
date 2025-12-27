import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { prisma } from "../lib/prisma";
import { Card, CardContent } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Footer from "../src/components/Footer";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  hostCity: string | null;
  hostCountry: string | null;
  hostUniversity: string | null;
  semester: string | null;
  academicYear: string | null;
  title: string | null;
  data: any;
  author: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: Date;
}

interface Props {
  stories: Story[];
  countries: string[];
  stats: {
    totalStories: number;
    totalCountries: number;
    totalUniversities: number;
  };
}

export default function StudentStories({ stories, countries, stats }: Props) {
  const [filteredStories, setFilteredStories] = useState(stories);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  useEffect(() => {
    let filtered = stories;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.hostCity?.toLowerCase().includes(term) ||
          s.hostCountry?.toLowerCase().includes(term) ||
          s.hostUniversity?.toLowerCase().includes(term) ||
          s.title?.toLowerCase().includes(term) ||
          s.author.firstName?.toLowerCase().includes(term) ||
          s.author.lastName?.toLowerCase().includes(term),
      );
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((s) => s.hostCountry === countryFilter);
    }

    setFilteredStories(filtered);
  }, [searchTerm, countryFilter, stories]);

  const getExcerpt = (story: Story) => {
    if (story.data?.overallExperience) {
      return story.data.overallExperience.substring(0, 200) + "...";
    }
    if (story.data?.tips) {
      return story.data.tips.substring(0, 200) + "...";
    }
    return "Read about this student's amazing Erasmus journey...";
  };

  const getRating = (story: Story) => {
    return story.data?.rating || story.data?.overallRating || 4.5;
  };

  return (
    <>
      <Head>
        <title>Student Stories | ErasmusJourney</title>
        <meta
          name="description"
          content="Read real experiences from Erasmus students across Europe. Get inspired by their stories and tips for your exchange journey."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-pink-950/20">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 px-5 py-2.5 rounded-full mb-8">
              <Icon
                icon="solar:users-group-rounded-linear"
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                Community Stories
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Real Stories from
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Real Students
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
              Discover authentic experiences from students who&apos;ve been on
              their Erasmus journey. Get inspired, learn from their tips, and
              start planning your own adventure.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[
                {
                  label: "Stories Shared",
                  value: stats.totalStories,
                  icon: "solar:notebook-linear",
                },
                {
                  label: "Countries",
                  value: stats.totalCountries,
                  icon: "solar:global-linear",
                },
                {
                  label: "Universities",
                  value: stats.totalUniversities,
                  icon: "solar:buildings-2-linear",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <Icon
                      icon={stat.icon}
                      className="w-6 h-6 text-indigo-600"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}+
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/dashboard">
              <Button className="rounded-2xl px-8 py-6 text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all">
                <Icon
                  icon="solar:pen-new-square-linear"
                  className="w-5 h-5 mr-2"
                />
                Share Your Story
                <Icon
                  icon="solar:arrow-right-linear"
                  className="w-5 h-5 ml-2"
                />
              </Button>
            </Link>
          </div>
        </section>

        {/* Filters Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Icon
                      icon="solar:magnifer-linear"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    />
                    <Input
                      placeholder="Search by city, country, university, or student name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 rounded-2xl text-base border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <Select
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger className="w-full md:w-56 h-14 rounded-2xl">
                      <Icon
                        icon="solar:global-linear"
                        className="w-4 h-4 mr-2 text-gray-400"
                      />
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {filteredStories.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon
                      icon="solar:heart-linear"
                      className="w-10 h-10 text-indigo-600"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No stories found
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {searchTerm || countryFilter !== "all"
                      ? "Try adjusting your search or filters to find more stories."
                      : "Be the first to share your Erasmus experience with the community!"}
                  </p>
                  <Link href="/dashboard">
                    <Button className="rounded-2xl px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Icon
                        icon="solar:pen-new-square-linear"
                        className="w-4 h-4 mr-2"
                      />
                      Share Your Story
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story, idx) => (
                  <Card
                    key={story.id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white dark:bg-gray-900"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Gradient Header */}
                    <div className="h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]" />

                      {/* Location badge */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white">
                          <Icon
                            icon="solar:map-point-linear"
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">
                            {story.hostCity}, {story.hostCountry}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Icon
                          icon="solar:star-bold"
                          className="w-4 h-4 text-yellow-300"
                        />
                        <span className="text-white font-semibold text-sm">
                          {getRating(story).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Author */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {story.author.firstName?.[0] || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {story.author.firstName} {story.author.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {story.academicYear} • {story.semester}
                          </p>
                        </div>
                      </div>

                      {/* University */}
                      {story.hostUniversity && (
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                          <Icon
                            icon="solar:square-academic-cap-linear"
                            className="w-4 h-4"
                          />
                          <span className="line-clamp-1">
                            {story.hostUniversity}
                          </span>
                        </div>
                      )}

                      {/* Quote/Excerpt */}
                      <div className="relative mb-4">
                        <Icon
                          icon="solar:quote-opening-linear"
                          className="absolute -top-2 -left-2 w-8 h-8 text-indigo-200 dark:text-indigo-800"
                        />
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 pl-4">
                          {getExcerpt(story)}
                        </p>
                      </div>

                      {/* Read More */}
                      <Link
                        href={`/destinations/${story.hostCity?.toLowerCase().replace(/\s+/g, "-")}`}
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm group/link"
                      >
                        Read Full Story
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                        />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results count */}
            {filteredStories.length > 0 && (
              <p className="text-center text-gray-500 mt-8">
                Showing {filteredStories.length} of {stories.length} stories
              </p>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:30px_30px]" />
              <CardContent className="relative p-12 md:p-16">
                <Icon
                  icon="solar:users-group-rounded-linear"
                  className="w-16 h-16 mx-auto mb-6 opacity-90"
                />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Join Our Community
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Your story could inspire thousands of future Erasmus students.
                  Share your experience and help others make the most of their
                  journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button className="rounded-2xl px-8 py-6 text-lg bg-white text-indigo-600 hover:bg-gray-100 shadow-xl">
                      <Icon
                        icon="solar:pen-new-square-linear"
                        className="w-5 h-5 mr-2"
                      />
                      Share Your Story
                    </Button>
                  </Link>
                  <Link href="/destinations">
                    <Button
                      variant="outline"
                      className="rounded-2xl px-8 py-6 text-lg border-2 border-white text-white hover:bg-white/10"
                    >
                      <Icon
                        icon="solar:global-linear"
                        className="w-5 h-5 mr-2"
                      />
                      Explore Destinations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const stories = await prisma.form_submissions.findMany({
      where: {
        status: "approved",
        hostCity: { not: null },
        hostCountry: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        hostCity: true,
        hostCountry: true,
        hostUniversity: true,
        semester: true,
        academicYear: true,
        title: true,
        data: true,
        createdAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Also get experiences
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        isApproved: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        city: true,
        country: true,
        university: true,
        semester: true,
        year: true,
        title: true,
        overallExperience: true,
        tips: true,
        rating: true,
        createdAt: true,
        users: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Transform experiences to match stories format
    const transformedExperiences = experiences.map((exp) => ({
      id: exp.id,
      hostCity: exp.city,
      hostCountry: exp.country,
      hostUniversity: exp.university,
      semester: exp.semester,
      academicYear: exp.year,
      title: exp.title,
      data: {
        overallExperience: exp.overallExperience,
        tips: exp.tips,
        rating: exp.rating,
      },
      createdAt: exp.createdAt,
      author: {
        firstName: exp.users?.firstName,
        lastName: exp.users?.lastName,
      },
    }));

    // Combine and dedupe
    const allStories = [...stories, ...transformedExperiences];

    // Get unique countries
    const countries = [
      ...new Set(allStories.map((s) => s.hostCountry).filter(Boolean)),
    ] as string[];

    // Get unique universities
    const universities = [
      ...new Set(allStories.map((s) => s.hostUniversity).filter(Boolean)),
    ];

    const stats = {
      totalStories: allStories.length,
      totalCountries: countries.length,
      totalUniversities: universities.length,
    };

    return {
      props: {
        stories: JSON.parse(JSON.stringify(allStories)),
        countries: countries.sort(),
        stats,
      },
    };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return {
      props: {
        stories: [],
        countries: [],
        stats: { totalStories: 0, totalCountries: 0, totalUniversities: 0 },
      },
    };
  }
};
