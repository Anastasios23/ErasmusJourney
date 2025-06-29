import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import Header from "../components/Header";
import {
  Search,
  Filter,
  Star,
  Calendar,
  MapPin,
  Heart,
  MessageSquare,
  ArrowRight,
  Globe,
  BookOpen,
  Users,
  Lightbulb,
  Camera,
  FileText,
} from "lucide-react";

export default function Experiences() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const experienceCategories = [
    "Academic Life",
    "Social & Cultural",
    "Travel & Adventure",
    "Accommodation",
    "Food & Dining",
    "Language Learning",
    "Career & Internships",
    "Challenges & Growth",
    "Tips & Advice",
  ];

  const countries = [
    "Spain",
    "France",
    "Germany",
    "Italy",
    "Czech Republic",
    "Netherlands",
    "Portugal",
    "Poland",
    "Austria",
    "Belgium",
  ];

  const experiences = [
    {
      id: "1",
      title: "My Life-Changing Semester in Barcelona",
      excerpt:
        "From struggling with Spanish to falling in love with Catalan culture, my 6 months at UPC Barcelona completely transformed my perspective on life and learning.",
      author: {
        name: "Maria Rodriguez",
        university: "Technical University Munich",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      },
      destination: {
        city: "Barcelona",
        country: "Spain",
        university: "UPC Barcelona",
      },
      category: "Academic Life",
      rating: 5,
      date: "2024-01-15",
      likes: 45,
      comments: 12,
      readTime: "8 min read",
      featured: true,
      tags: ["Engineering", "Spanish", "Culture", "Personal Growth"],
    },
    {
      id: "2",
      title: "Navigating French Bureaucracy: A Survival Guide",
      excerpt:
        "Everything you need to know about paperwork, bank accounts, and administrative tasks in France. Plus tips for making the process less stressful!",
      author: {
        name: "Thomas Anderson",
        university: "University of Copenhagen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      destination: {
        city: "Paris",
        country: "France",
        university: "Sorbonne University",
      },
      category: "Tips & Advice",
      rating: 4,
      date: "2024-01-12",
      likes: 32,
      comments: 8,
      readTime: "6 min read",
      featured: false,
      tags: ["Bureaucracy", "Practical Tips", "France", "Administration"],
    },
    {
      id: "3",
      title: "Finding My Tribe: Building Friendships Abroad",
      excerpt:
        "How I overcame shyness and built lasting friendships during my exchange in Prague. From ESN events to casual coffee chats, here's what worked for me.",
      author: {
        name: "Elena Popovic",
        university: "University of Zagreb",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      },
      destination: {
        city: "Prague",
        country: "Czech Republic",
        university: "Charles University",
      },
      category: "Social & Cultural",
      rating: 5,
      date: "2024-01-10",
      likes: 28,
      comments: 15,
      readTime: "5 min read",
      featured: false,
      tags: ["Friendship", "Social Life", "ESN", "Prague"],
    },
    {
      id: "4",
      title: "Weekend Adventures: Traveling Europe on a Student Budget",
      excerpt:
        "My ultimate guide to exploring 15 European cities during my semester abroad. Budget tips, hidden gems, and unforgettable memories from Italy to Sweden.",
      author: {
        name: "Marcus Johnson",
        university: "University of Edinburgh",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
      destination: {
        city: "Berlin",
        country: "Germany",
        university: "Humboldt University",
      },
      category: "Travel & Adventure",
      rating: 5,
      date: "2024-01-08",
      likes: 67,
      comments: 23,
      readTime: "12 min read",
      featured: true,
      tags: ["Travel", "Budget", "Europe", "Adventure"],
    },
    {
      id: "5",
      title: "From Awkward to Fluent: My Italian Language Journey",
      excerpt:
        "How I went from basic phrases to having deep conversations in Italian. My strategies for language immersion and overcoming the fear of making mistakes.",
      author: {
        name: "Sophie Martin",
        university: "University of Lyon",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      },
      destination: {
        city: "Florence",
        country: "Italy",
        university: "University of Florence",
      },
      category: "Language Learning",
      rating: 4,
      date: "2024-01-05",
      likes: 41,
      comments: 19,
      readTime: "7 min read",
      featured: false,
      tags: ["Italian", "Language", "Immersion", "Learning"],
    },
  ];

  const filteredExperiences = experiences.filter((experience) => {
    const matchesSearch =
      searchTerm === "" ||
      experience.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experience.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experience.destination.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      experience.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "" ||
      selectedCategory === "all-categories" ||
      experience.category === selectedCategory;

    const matchesCountry =
      selectedCountry === "" ||
      selectedCountry === "all-countries" ||
      experience.destination.country === selectedCountry;

    const matchesRating =
      selectedRating === "" ||
      selectedRating === "all-ratings" ||
      experience.rating >= parseInt(selectedRating);

    return matchesSearch && matchesCategory && matchesCountry && matchesRating;
  });

  const featuredExperiences = filteredExperiences.filter((exp) => exp.featured);
  const regularExperiences = filteredExperiences.filter((exp) => !exp.featured);

  return (
    <>
      <Head>
        <title>Experiences - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Read detailed experiences from Erasmus students about their study abroad journey"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Student Experiences
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Dive deep into detailed experiences from Erasmus students.
                Learn, get inspired, and prepare for your own adventure abroad.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Link href="/share-story">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Share Your Story</h3>
                    <p className="text-sm text-gray-600">
                      Write about your Erasmus experience
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/photo-story">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <Camera className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Photo Story</h3>
                    <p className="text-sm text-gray-600">
                      Share your journey through photos
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/help-future-students">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <Lightbulb className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Become a Mentor</h3>
                    <p className="text-sm text-gray-600">
                      Help future students with advice
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search experiences..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">
                          All Categories
                        </SelectItem>
                        {experienceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={selectedCountry}
                      onValueChange={setSelectedCountry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-countries">
                          All Countries
                        </SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={selectedRating}
                      onValueChange={setSelectedRating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-ratings">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Experiences */}
            {featuredExperiences.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Featured Experiences
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredExperiences.map((experience) => (
                    <Card
                      key={experience.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">
                              {experience.rating}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">
                          {experience.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {experience.excerpt}
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={experience.author.avatar} />
                            <AvatarFallback>
                              {experience.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">
                              {experience.author.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {experience.author.university}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {experience.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {experience.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {experience.comments}
                            </span>
                            <span>{experience.readTime}</span>
                          </div>
                          <span>
                            📍 {experience.destination.city},{" "}
                            {experience.destination.country}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Experiences */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Experiences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularExperiences.map((experience) => (
                  <Card
                    key={experience.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{experience.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">
                            {experience.rating}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {experience.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {experience.excerpt}
                      </p>

                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={experience.author.avatar} />
                          <AvatarFallback>
                            {experience.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {experience.author.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            📍 {experience.destination.city}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {experience.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {experience.comments}
                          </span>
                        </div>
                        <span>{experience.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* No Results */}
            {filteredExperiences.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No experiences found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or be the first to share an
                  experience for this location.
                </p>
                <Link href="/share-story">
                  <Button>Share Your Experience</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
