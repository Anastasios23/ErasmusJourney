import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { ArrowRight, GraduationCap } from "lucide-react";

// Sample featured exchanges for homepage
const featuredExchanges = [
  {
    student: {
      name: "Maria C.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria-featured",
      cyprusUni: "UCY",
      department: "Computer Science",
    },
    exchange: {
      university: "TU Munich",
      country: "Germany",
      flag: "🇩🇪",
    },
    courses: ["Database Systems", "Machine Learning", "Software Engineering"],
    rating: 4.8,
  },
  {
    student: {
      name: "Andreas G.",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas-featured",
      cyprusUni: "CUT",
      department: "Engineering",
    },
    exchange: {
      university: "KTH Stockholm",
      country: "Sweden",
      flag: "🇸🇪",
    },
    courses: ["Thermodynamics", "Sustainable Energy", "Fluid Mechanics"],
    rating: 4.9,
  },
  {
    student: {
      name: "Elena P.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena-featured",
      cyprusUni: "UNIC",
      department: "Business",
    },
    exchange: {
      university: "Bocconi Milan",
      country: "Italy",
      flag: "🇮🇹",
    },
    courses: ["International Marketing", "Corporate Finance", "Strategy"],
    rating: 4.7,
  },
];

export default function ExchangeHighlights() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Student Exchange Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See where Cyprus students have studied abroad and what courses they
            completed. Get inspiration for your own academic journey.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">150+</div>
            <div className="text-sm text-gray-600">Students Abroad</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">25+</div>
            <div className="text-sm text-gray-600">Partner Universities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">15+</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Featured Exchanges */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {featuredExchanges.map((exchange, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={exchange.student.avatar}
                      alt={exchange.student.name}
                    />
                    <AvatarFallback>
                      {exchange.student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {exchange.student.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {exchange.student.department} •{" "}
                      {exchange.student.cyprusUni}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Destination */}
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{exchange.exchange.flag}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {exchange.exchange.university}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exchange.exchange.country}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.floor(exchange.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {exchange.rating}/5
                  </span>
                </div>

                {/* Courses Preview */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Key Courses:
                  </p>
                  <div className="space-y-1">
                    {exchange.courses.slice(0, 2).map((course, courseIndex) => (
                      <div
                        key={courseIndex}
                        className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                      >
                        {course}
                      </div>
                    ))}
                    {exchange.courses.length > 2 && (
                      <div className="text-xs text-blue-600">
                        +{exchange.courses.length - 2} more courses
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Explore All Exchange History
              </h3>
              <p className="text-gray-600 mb-6">
                Browse detailed course mappings, student experiences, and find
                the perfect academic path for your exchange program.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/destinations">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View All Exchanges
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/course-matching-experiences">
                  <Button variant="outline">Browse Destinations</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
