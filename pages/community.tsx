import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import Header from "../components/Header";
import {
  Users,
  MessageSquare,
  Star,
  MapPin,
  Heart,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function Community() {
  const communityStats = [
    { icon: Users, label: "Active Students", value: "2,847" },
    { icon: MessageSquare, label: "Shared Stories", value: "1,203" },
    { icon: MapPin, label: "Cities Covered", value: "156" },
    { icon: Star, label: "Average Rating", value: "4.8" },
  ];

  const testimonials = [
    {
      id: 1,
      student: {
        name: "Maria Rodriguez",
        university: "University of Barcelona",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      },
      destination: "Prague, Czech Republic",
      rating: 5,
      text: "The Erasmus Journey platform was invaluable in planning my exchange. The detailed information and student testimonials helped me prepare for everything from academic requirements to daily life in Prague.",
      date: "2024-01-15",
    },
    {
      id: 2,
      student: {
        name: "Andreas Mueller",
        university: "TU Munich",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      destination: "Barcelona, Spain",
      rating: 5,
      text: "Amazing community! I connected with students who had studied at UPC Barcelona before me. Their advice on housing and course selection made my transition so much smoother.",
      date: "2024-01-10",
    },
    {
      id: 3,
      student: {
        name: "Elena Popovic",
        university: "University of Zagreb",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      },
      destination: "Paris, France",
      rating: 4,
      text: "The platform's detailed cost breakdowns and budget planning tools were exactly what I needed. Now I'm helping other students plan their budgets for Paris!",
      date: "2024-01-08",
    },
  ];

  const destinations = [
    {
      id: "barcelona",
      city: "Barcelona",
      country: "Spain",
      studentCount: 324,
      image:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop",
    },
    {
      id: "prague",
      city: "Prague",
      country: "Czech Republic",
      studentCount: 189,
      image:
        "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=300&h=200&fit=crop",
    },
    {
      id: "berlin",
      city: "Berlin",
      country: "Germany",
      studentCount: 267,
      image:
        "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=300&h=200&fit=crop",
    },
    {
      id: "amsterdam",
      city: "Amsterdam",
      country: "Netherlands",
      studentCount: 156,
      image:
        "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=300&h=200&fit=crop",
    },
  ];

  return (
    <>
      <Head>
        <title>Community - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Join our global community of Erasmus students sharing experiences and helping each other"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Badge
                variant="secondary"
                className="mb-4 bg-white/20 text-white border-white/30"
              >
                Erasmus Community
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Join Our Global Community
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Connect with thousands of Erasmus students, share experiences,
                and get advice from those who've been where you're going.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/basic-information">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Share Your Experience
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/student-stories">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Browse Stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {communityStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Stories */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Real Stories from Students
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover how our community has helped students make the most of
                their Erasmus experience.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={testimonial.student.avatar}
                          alt={testimonial.student.name}
                        />
                        <AvatarFallback>
                          {testimonial.student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {testimonial.student.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {testimonial.student.university}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.destination}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(testimonial.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Helpful
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/student-stories">
                <Button variant="outline" size="lg">
                  Read More Stories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Popular Destinations
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                See where our community members are studying and get insights
                from their experiences.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.id}`}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video overflow-hidden rounded-t-lg relative">
                      <Image
                        src={destination.image}
                        alt={destination.city}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {destination.city}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {destination.country}
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {destination.studentCount} students
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Share Your Story?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join thousands of students who are helping shape the future of
              Erasmus exchanges. Your experience matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/share-story">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Share Your Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/help-future-students">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-indigo-600"
                >
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
