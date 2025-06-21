import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Users, MapPin, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Experiences = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 text-blue-600 border-blue-200"
          >
            Student Experiences
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Erasmus Experiences
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read real stories from students who have completed their Erasmus
            journey and learn from their experiences.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-16 mb-8">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Student Stories Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We're collecting amazing Erasmus experiences from students across
              Europe. This section will feature detailed stories, tips, and
              insights from real students.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-8">
              <strong>What's Coming:</strong> Student testimonials, photo
              galleries, destination guides, budget breakdowns, and
              recommendation systems.
            </div>
            <Link to="/basic-information">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Share Your Experience
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Preview Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Destination Guides
            </h3>
            <p className="text-gray-600 text-sm">
              Comprehensive guides for popular Erasmus destinations with insider
              tips from students.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Student Reviews
            </h3>
            <p className="text-gray-600 text-sm">
              Honest reviews and ratings of universities, accommodations, and
              overall experiences.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Timeline Stories
            </h3>
            <p className="text-gray-600 text-sm">
              Month-by-month breakdowns of student experiences from application
              to return.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-white rounded-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Help Build This Community
          </h2>
          <p className="text-gray-600 mb-6">
            Your Erasmus experience could help future students make better
            decisions. Share your story and be part of building this resource.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/basic-information">
              <Button className="bg-black hover:bg-gray-800 text-white">
                Start Sharing Your Experience
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Learn More About the Platform</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiences;
