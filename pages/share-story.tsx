import Head from "next/head";
import Link from "next/link";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import Header from "../components/Header";
import {
  FileText,
  Camera,
  Heart,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
} from "lucide-react";

export default function ShareStory() {
  const storyTypes = [
    {
      icon: FileText,
      title: "Complete Experience Form",
      description:
        "Fill out our comprehensive 5-step form covering academics, accommodation, budget, and more",
      time: "15-20 minutes",
      impact: "Helps with course matching and university selection",
      color: "bg-blue-100 text-blue-600",
      link: "/basic-information",
    },
    {
      icon: Camera,
      title: "Photo Story",
      description:
        "Share your visual journey with photos and captions from your time abroad",
      time: "10 minutes",
      impact: "Gives future students a real sense of places and experiences",
      color: "bg-green-100 text-green-600",
      link: "/photo-story",
    },
    {
      icon: Heart,
      title: "Mentorship Program",
      description:
        "Become a mentor and directly help future students with questions and advice",
      time: "Ongoing",
      impact: "Direct personal impact on individual students",
      color: "bg-purple-100 text-purple-600",
      link: "/help-future-students",
    },
  ];

  const impactStats = [
    { icon: Users, value: "2,847", label: "Students Helped" },
    { icon: Globe, value: "156", label: "Cities Covered" },
    { icon: Star, value: "4.8", label: "Average Rating" },
    { icon: CheckCircle, value: "94%", label: "Would Recommend" },
  ];

  const benefits = [
    "Help future students make informed decisions",
    "Share your unique perspective and experiences",
    "Connect with a global community of students",
    "Build your personal portfolio and network",
    "Get featured in our student spotlight",
    "Access to exclusive alumni network",
  ];

  return (
    <>
      <Head>
        <title>Share Your Story - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your Erasmus experience and help future students on their journey"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Badge
                variant="secondary"
                className="mb-4 bg-white/20 text-white border-white/30"
              >
                Share Your Story
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Your Experience Matters
              </h1>
              <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
                Help future Erasmus students by sharing your journey. Every
                story, photo, and piece of advice makes a difference in someone
                else's adventure.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Impact So Far
              </h2>
              <p className="text-gray-600 text-lg">
                See how our community is making a difference
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-purple-600" />
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

        {/* Story Types */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose How to Share
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Pick the format that works best for you. Every contribution
                helps build our community knowledge base.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {storyTypes.map((type, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 ${type.color} rounded-full flex items-center justify-center mb-4`}
                    >
                      <type.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">{type.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Time needed:</span>
                        <span className="font-medium">{type.time}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Impact: </span>
                        <span className="text-green-600 font-medium">
                          {type.impact}
                        </span>
                      </div>
                    </div>

                    <Link href={type.link}>
                      <Button className="w-full">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Share Your Story?
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/basic-information">
                    <Button size="lg">
                      Start Sharing Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Join 2,847 Students
                    </h3>
                    <p className="text-gray-600">
                      Already helping others with their Erasmus journey
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Students Say
              </h2>
              <p className="text-gray-600 text-lg">
                Hear from students who've shared their experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sofia M.",
                  university: "University of Barcelona",
                  quote:
                    "Sharing my Prague experience helped me reflect on my journey and connect with amazing students planning their own adventures.",
                },
                {
                  name: "Marcus L.",
                  university: "TU Berlin",
                  quote:
                    "Being a mentor has been incredibly rewarding. I love helping students navigate the same challenges I faced in Amsterdam.",
                },
                {
                  name: "Elena K.",
                  university: "University of Athens",
                  quote:
                    "The photo story feature let me showcase the real Paris beyond tourist sites. Future students deserve authentic perspectives.",
                },
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.university}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Your Erasmus journey was unique. Share it with future students and
              help them make the most of their international experience.
            </p>
            <Link href="/basic-information">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                Start Your Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
