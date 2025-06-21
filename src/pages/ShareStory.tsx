import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
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
import { Link } from "react-router-dom";

const ShareStory = () => {
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
              Every Erasmus journey is unique. By sharing yours, you're helping
              future students make better decisions and feel more confident
              about their own adventures.
            </p>
            <Link to="/basic-information">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Start Sharing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Impact
            </h2>
            <p className="text-xl text-gray-600">
              See how shared stories are already making a difference
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

      {/* How to Share */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ways to Share Your Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the format that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {storyTypes.map((type, index) => (
              <Card
                key={index}
                className="h-full group hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <type.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                    {type.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-600 mb-4 flex-1">
                    {type.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div>⏰ Time needed: {type.time}</div>
                    <div>💡 Impact: {type.impact}</div>
                  </div>
                  <Link to={type.link}>
                    <Button className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
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

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Share Your Story?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Sharing your experience isn't just about helping others – it's
                also rewarding for you in many ways.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students collaborating"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    2,847
                  </div>
                  <div className="text-sm text-gray-600">Students Reached</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonial */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616c96f40b3?w=100&h=100&fit=crop&crop=face"
              alt="Maria"
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
              ))}
            </div>
          </div>
          <blockquote className="text-xl lg:text-2xl text-gray-900 mb-6 font-medium">
            "Sharing my Berlin experience helped 23 students make informed
            decisions about their accommodation and courses. It felt amazing
            knowing I made their journey easier!"
          </blockquote>
          <cite className="text-gray-600">
            — Maria K., University of Cyprus → TU Berlin
          </cite>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of students who are already helping shape the future
            of international education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/basic-information">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Share Your Experience
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-purple-600"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShareStory;
