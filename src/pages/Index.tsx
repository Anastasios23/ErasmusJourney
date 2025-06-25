import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import StepCard from "@/components/StepCard";
import {
  ArrowRight,
  Users,
  BookOpen,
  Home,
  DollarSign,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import TeaserGallery from "@/components/TeaserGallery";
import LocationBrowser from "@/components/LocationBrowser";
import ComingNext from "@/components/ComingNext";

const Index = () => {
  const steps = [
    {
      step: 1,
      title: "Personal Information",
      description: "Share your academic background and mobility details",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=240&fit=crop",
      href: "/basic-information",
      color: "bg-blue-500",
    },
    {
      step: 2,
      title: "Course Matching",
      description: "Details about courses and academic equivalents",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=240&fit=crop",
      href: "/course-matching",
      color: "bg-green-500",
    },
    {
      step: 3,
      title: "Accommodation Details",
      description: "Housing information and recommendations",
      image:
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=240&fit=crop",
      href: "/accommodation",
      color: "bg-orange-500",
    },
    {
      step: 4,
      title: "Living Expenses",
      description: "Budget planning and lifestyle information",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop",
      href: "/living-expenses",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-6 text-blue-600 border-blue-200"
              >
                Erasmus Journey
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Your Guide to Studying
                <span className="text-blue-600"> Abroad</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Navigate your Erasmus experience with ease. Share your journey
                and help future students make informed decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/basic-information">
                  <Button
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white px-8"
                  >
                    Start Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/student-stories">
                  <Button variant="outline" size="lg" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop"
                alt="Students studying abroad"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">10,000+</p>
                    <p className="text-sm text-gray-600">Students helped</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Steps Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Essential Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our comprehensive guide to document and share your Erasmus
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Helpful guides and tips for your Erasmus journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/basic-information" className="group cursor-pointer">
              <div className="bg-yellow-100 rounded-2xl p-8 mb-6 aspect-square flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop"
                  alt="Complete your application"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Complete your application
              </h3>
              <p className="text-gray-600">
                Essential tips for a successful Erasmus application
              </p>
            </Link>

            <Link to="/destinations" className="group cursor-pointer">
              <div className="bg-blue-100 rounded-2xl p-8 mb-6 aspect-square flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2F27f8f1ff719e4d429c98e6c083c70785?format=webp&width=800"
                  alt="Choose your destination"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Choose your destination
              </h3>
              <p className="text-gray-600">
                Explore universities and cities across Europe
              </p>
            </Link>

            <Link to="/student-accommodations" className="group cursor-pointer">
              <div className="bg-green-100 rounded-2xl p-8 mb-6 aspect-square flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3ab1e1015f654e219ee7dc3d44bc47c8%2Fa61eeadc6a6c4179b45dc1cf7f6e2b96?format=webp&width=800"
                  alt="Secure your stay"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Secure your stay
              </h3>
              <p className="text-gray-600">
                Find accommodation where other students lived
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Teaser Gallery */}
      <TeaserGallery />

      {/* Location Browser */}
      <LocationBrowser />

      {/* What's Coming Next */}
      <ComingNext />

      {/* Connect and Help Others Section */}
      <section className="py-16 lg:py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Connect and Help Others
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join our community of Erasmus students and help others make the most
            of their study abroad experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/community">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-8"
              >
                Join Community
              </Button>
            </Link>
            <Link to="/share-story">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8"
              >
                Share Your Story
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-700">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-gray-300">Universities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">25+</div>
              <div className="text-gray-300">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                10k+
              </div>
              <div className="text-gray-300">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
              <div className="text-gray-300">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Erasmus Journey
                </span>
              </div>
              <p className="text-gray-600">
                Empowering students to make the most of their Erasmus
                experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/basic-information" className="hover:text-blue-600">
                    Get Started
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Erasmus Journey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
