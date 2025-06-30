import { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import { Skeleton } from "../src/components/ui/skeleton";
import { Label } from "../src/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../src/components/ui/pagination";
import { useStories, useLikeStory } from "../src/hooks/useQueries";
import { Search, Heart, Eye, Calendar, BookOpen, SlidersHorizontal, X, ChevronDown } from "lucide-react";

const ITEMS_PER_PAGE = 6;
  {
    id: "1",
    title: "My Amazing Semester in Barcelona",
    excerpt:
      "Studying at UPC Barcelona was a life-changing experience. The city's vibrant culture, amazing architecture, and friendly locals made my Erasmus journey unforgettable.",
    author: {
      firstName: "Maria",
      lastName: "K.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    university: "Universitat Politècnica de Catalunya",
    country: "Spain",
    city: "Barcelona",
    category: "EXPERIENCE",
    likes: 45,
    views: 230,
    createdAt: "2024-01-15",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop",
  },
  {
    id: "2",
    title: "Finding the Perfect Student Accommodation in Prague",
    excerpt:
      "Tips and tricks for finding affordable, comfortable housing in Prague. From dorms to shared apartments, here's what I learned during my search.",
    author: {
      firstName: "Andreas",
      lastName: "M.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    university: "Charles University",
    country: "Czech Republic",
    city: "Prague",
    category: "ACCOMMODATION",
    likes: 32,
    views: 145,
    createdAt: "2024-01-10",
    image:
      "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=400&h=200&fit=crop",
  },
  {
    id: "3",
    title: "Navigating Academic Life at Sorbonne University",
    excerpt:
      "From enrollment to exams, here's everything you need to know about the academic system in France and how to make the most of your studies.",
    author: {
      firstName: "Elena",
      lastName: "P.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
    university: "Sorbonne University",
    country: "France",
    city: "Paris",
    category: "ACADEMICS",
    likes: 28,
    views: 98,
    createdAt: "2024-01-08",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop",
  },
];

export default function StudentStoriesPage() {
  return (
    <>
      <Head>
        <title>Student Stories - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Read inspiring stories from Erasmus students sharing their experiences abroad."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Student Stories
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover inspiring experiences from students who've embarked on
                their Erasmus journey. Get insights, tips, and motivation for
                your own adventure.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search stories..." className="pl-10" />
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    All
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    Experience
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    Accommodation
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    Academics
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    Culture
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {sampleStories.map((story) => (
                <Card
                  key={story.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">
                        {story.category.toLowerCase()}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500 gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {story.excerpt}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={story.author.avatar}
                        alt={`${story.author.firstName} ${story.author.lastName}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {story.author.firstName} {story.author.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {story.university}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="text-sm text-blue-600 mb-3">
                      📍 {story.city}, {story.country}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {story.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {story.views}
                        </span>
                      </div>
                      <Link href={`/stories/${story.id}`}>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                Load More Stories
              </Button>
            </div>

            {/* CTA Section */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Share Your Erasmus Story
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Have an amazing Erasmus experience to share? Help future
                    students by sharing your insights, tips, and memorable
                    moments.
                  </p>
                  <Link href="/share-story">
                    <Button size="lg">Share Your Story</Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}