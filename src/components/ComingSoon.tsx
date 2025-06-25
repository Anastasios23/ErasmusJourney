import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Camera,
  MapPin,
  Euro,
  Star,
  BookOpen,
  Calendar,
  Bell,
  Heart,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  const upcomingFeatures = [
    {
      icon: Users,
      title: "Student Testimonials",
      description:
        "Real stories from students who've completed their Erasmus journey",
      status: "In Development",
      eta: "Coming in January 2024",
    },
    {
      icon: Camera,
      title: "Photo Galleries",
      description:
        "Visual journeys showcasing life, culture, and experiences abroad",
      status: "Design Phase",
      eta: "Coming in February 2024",
    },
    {
      icon: MapPin,
      title: "Destination Guides",
      description:
        "Comprehensive guides for each Erasmus destination with insider tips",
      status: "Content Creation",
      eta: "Coming in March 2024",
    },
    {
      icon: Euro,
      title: "Budget Breakdowns",
      description:
        "Detailed cost analysis and budget planning tools for each city",
      status: "In Development",
      eta: "Coming in January 2024",
    },
    {
      icon: Star,
      title: "Recommendation Systems",
      description:
        "Personalized destination and course recommendations based on your preferences",
      status: "Research Phase",
      eta: "Coming in April 2024",
    },
    {
      icon: BookOpen,
      title: "Course Reviews",
      description:
        "Student reviews and ratings for courses at partner universities",
      status: "Planning",
      eta: "Coming in May 2024",
    },
  ];

  const currentStats = [
    { label: "Students Interviewed", value: "150+", icon: Users },
    { label: "Universities Covered", value: "45", icon: Globe },
    { label: "Countries Mapped", value: "15", icon: MapPin },
    { label: "Photos Collected", value: "2,500+", icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="outline"
            className="mb-6 text-blue-600 border-blue-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Coming Soon
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Amazing Erasmus
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Experiences
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're collecting amazing Erasmus experiences from students across
            Europe. This section will feature detailed stories, tips, and
            insights from real students.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/basic-information">
              <Button size="lg" className="px-8">
                <Heart className="h-5 w-5 mr-2" />
                Share Your Experience
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Stats */}
      <section className="py-12 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What We're Building With
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {currentStats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Coming */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What's Coming Next
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're working hard to bring you the most comprehensive Erasmus
              experience platform. Here's what you can expect in the coming
              months.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                    <Badge
                      variant="outline"
                      className={
                        feature.status === "In Development"
                          ? "text-green-600 border-green-200 bg-green-50"
                          : feature.status === "Design Phase"
                            ? "text-blue-600 border-blue-200 bg-blue-50"
                            : feature.status === "Content Creation"
                              ? "text-purple-600 border-purple-200 bg-purple-50"
                              : "text-gray-600 border-gray-200 bg-gray-50"
                      }
                    >
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="text-sm text-blue-600 font-medium">
                    {feature.eta}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Be the First to Know
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get notified when new features launch and be among the first
            students to access our comprehensive Erasmus experience platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8">
              <Bell className="h-4 w-4 mr-2" />
              Notify Me
            </Button>
          </div>

          <p className="text-sm text-blue-200 mt-4">
            No spam, just updates on new features and student stories.
          </p>
        </div>
      </section>

      {/* Early Access */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
            <CardContent className="p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Want Early Access?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Share your Erasmus experience now and get exclusive early access
                to all new features as they launch. Plus, help us build a better
                platform for future students!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/basic-information">
                  <Button size="lg" className="px-8">
                    <Users className="h-5 w-5 mr-2" />
                    Share Your Experience
                  </Button>
                </Link>
                <Link to="/destinations">
                  <Button variant="outline" size="lg" className="px-8">
                    <MapPin className="h-5 w-5 mr-2" />
                    Explore Destinations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ComingSoon;
