import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Camera, MapPin, Calendar, Heart, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
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

      {/* Early Access */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50"></Card>
        </div>
      </section>
    </div>
  );
};

export default ComingSoon;
