import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  MessageSquare,
  MapPin,
  Users,
  Bell,
  Star,
  Camera,
} from "lucide-react";

const ComingNext = () => {
  const upcomingFeatures = [
    {
      title: "AI-Powered Course Matcher",
      description:
        "Smart algorithm to match your courses with host university equivalents",
      icon: Sparkles,
      status: "In Development",
      timeline: "March 2024",
      color: "bg-purple-500",
    },
    {
      title: "Real-time Chat with Alumni",
      description:
        "Connect instantly with students who studied at your destination",
      icon: MessageSquare,
      status: "Coming Soon",
      timeline: "April 2024",
      color: "bg-blue-500",
    },
    {
      title: "Interactive Campus Maps",
      description:
        "3D virtual tours of university campuses and surrounding areas",
      icon: MapPin,
      status: "Planning",
      timeline: "May 2024",
      color: "bg-green-500",
    },
    {
      title: "Study Groups Finder",
      description: "Join study groups with other Erasmus students in your city",
      icon: Users,
      status: "Research",
      timeline: "June 2024",
      color: "bg-orange-500",
    },
    {
      title: "Smart Notifications",
      description: "Get personalized alerts for new accommodations and stories",
      icon: Bell,
      status: "In Development",
      timeline: "February 2024",
      color: "bg-red-500",
    },
    {
      title: "Photo Story Builder",
      description:
        "Create visual stories of your Erasmus journey with integrated tools",
      icon: Camera,
      status: "Beta",
      timeline: "January 2024",
      color: "bg-indigo-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Beta":
        return "bg-green-100 text-green-800";
      case "In Development":
        return "bg-blue-100 text-blue-800";
      case "Coming Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Planning":
        return "bg-purple-100 text-purple-800";
      case "Research":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 px-4 py-2">
            🚀 Roadmap 2024
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What's Coming Next
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're working hard to bring you the most comprehensive Erasmus
            experience platform. Here's what you can expect in the coming
            months.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`${feature.color} text-white p-3 rounded-lg flex-shrink-0`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(feature.status)}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {feature.timeline}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-2xl font-bold mb-4">
                Help Shape Our Platform
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Your feedback drives our development. Join our community of beta
                testers and get early access to new features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Join Beta Program
                </button>
                <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Share Feedback
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ComingNext;
