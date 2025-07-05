import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Separator } from "../../src/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Star,
  Euro,
  Users,
  Calendar,
  Globe,
  GraduationCap,
  Home,
  Utensils,
  Train,
  Heart,
  Share2,
  BookOpen,
  ExternalLink,
  List,
} from "lucide-react";

interface Destination {
  id: string;
  city: string;
  country: string;
  image: string;
  description: string;
  costLevel: "low" | "medium" | "high";
  rating: number;
  studentCount: number;
  popularUniversities: Array<{
    name: string;
    type: string;
    programs: string[];
  }>;
  highlights: string[];
  avgCostPerMonth: number;
  details: {
    population: number;
    language: string;
    currency: string;
    climate: string;
    timezone: string;
  };
  livingCosts: {
    accommodation: { min: number; max: number };
    food: { min: number; max: number };
    transport: number;
    entertainment: { min: number; max: number };
  };
  transportation: {
    publicTransport: string;
    bikeRentals: boolean;
    walkability: number;
    nearestAirport: string;
  };
  attractions: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  studentLife: {
    nightlife: number;
    culture: number;
    sports: number;
    internationalCommunity: number;
  };
  practicalInfo: {
    visa: string;
    healthcare: string;
    bankingTips: string;
    simCard: string;
  };
  gallery: string[];
}

interface DestinationDetailPageProps {
  destination: Destination | null;
}

// Table of Contents Component
const TableOfContents = ({ destination }: { destination: Destination }) => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "universities", title: "Universities" },
    { id: "costs", title: "Living Costs" },
    { id: "student-life", title: "Student Life" },
    { id: "practical-info", title: "Practical Info" },
    { id: "accommodation-links", title: "Where to Stay" },
    { id: "course-links", title: "Course Planning" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section]");
      const scrollTop = window.scrollY + 100;

      sections.forEach((section) => {
        const element = section as HTMLElement;
        const offsetTop = element.offsetTop;
        const height = element.offsetHeight;
        const id = element.getAttribute("data-section");

        if (scrollTop >= offsetTop && scrollTop < offsetTop + height) {
          setActiveSection(id || "overview");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className="sticky top-24 self-start">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <List className="h-5 w-5" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav aria-label="Page contents">
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left w-full px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};

export default function DestinationDetailPage({
  destination,
}: DestinationDetailPageProps) {
  const router = useRouter();

  if (!destination) {
    return (
      <>
        <Head>
          <title>Destination Not Found - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Destination Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The destination you're looking for doesn't exist.
              </p>
              <Link href="/destinations">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Destinations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case "low":
        return "bg-green-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "high":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <>
      <Head>
        <title>
          {destination.city}, {destination.country} - Erasmus Journey Platform
        </title>
        <meta
          name="description"
          content={`Discover ${destination.city} as your Erasmus destination. ${destination.description}`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Destinations
              </Button>
            </div>

            {/* Header Section */}
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Image */}
                <div className="lg:col-span-2">
                  <div className="aspect-video overflow-hidden rounded-lg mb-4 relative">
                    <Image
                      src={destination.image}
                      alt={`${destination.city}, ${destination.country} - Beautiful cityscape showing iconic landmarks and architecture perfect for Erasmus students`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">
                            {destination.city}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-gray-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{destination.country}</span>
                          </div>
                        </div>
                        <Badge
                          className={getCostBadgeColor(destination.costLevel)}
                        >
                          {destination.costLevel} cost
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">
                            {destination.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Students</span>
                        <span className="font-medium">
                          {destination.studentCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg. Cost</span>
                        <span className="font-medium">
                          €{destination.avgCostPerMonth}/month
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Language</span>
                        <span className="font-medium">
                          {destination.details.language}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          aria-label={`Add ${destination.city} to favorites`}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          aria-label={`Share ${destination.city} destination page`}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Title and Description */}
              <div className="mt-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Study in {destination.city}
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {destination.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mt-4">
                {destination.highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="universities">Universities</TabsTrigger>
                <TabsTrigger value="costs">Living Costs</TabsTrigger>
                <TabsTrigger value="life">Student Life</TabsTrigger>
                <TabsTrigger value="practical">Practical Info</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>City Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Population:</span>
                        <span>
                          {destination.details.population.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Climate:</span>
                        <span>{destination.details.climate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span>{destination.details.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timezone:</span>
                        <span>{destination.details.timezone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Transportation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Public Transport:</span>
                        <span>
                          {destination.transportation.publicTransport}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bike Rentals:</span>
                        <span>
                          {destination.transportation.bikeRentals
                            ? "Available"
                            : "Limited"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Walkability:</span>
                        <span>{destination.transportation.walkability}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nearest Airport:</span>
                        <span>{destination.transportation.nearestAirport}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Attractions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {destination.attractions.map((attraction, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-1">
                            {attraction.name}
                          </h4>
                          <p className="text-sm text-blue-600 mb-2">
                            {attraction.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {attraction.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="universities">
                <div className="space-y-4">
                  {destination.popularUniversities.map((uni, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{uni.name}</span>
                          <Badge variant="outline">{uni.type}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <h4 className="font-medium mb-2">
                            Popular Programs:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {uni.programs.map((program, i) => (
                              <Badge key={i} variant="secondary">
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="costs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Living Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Accommodation</span>
                          <span className="font-medium">
                            €{destination.livingCosts.accommodation.min} - €
                            {destination.livingCosts.accommodation.max}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Food</span>
                          <span className="font-medium">
                            €{destination.livingCosts.food.min} - €
                            {destination.livingCosts.food.max}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: "40%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Transport</span>
                          <span className="font-medium">
                            €{destination.livingCosts.transport}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: "20%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Entertainment</span>
                          <span className="font-medium">
                            €{destination.livingCosts.entertainment.min} - €
                            {destination.livingCosts.entertainment.max}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: "30%" }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          €{destination.avgCostPerMonth}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          Average monthly cost
                        </div>
                        <Badge
                          className={getCostBadgeColor(destination.costLevel)}
                        >
                          {destination.costLevel.toUpperCase()} COST CITY
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="life">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Life Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(destination.studentLife).map(
                      ([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="font-medium">{value}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${value * 10}%` }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="practical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(destination.practicalInfo).map(
                    ([key, value]) => (
                      <Card key={key}>
                        <CardHeader>
                          <CardTitle className="capitalize">
                            {key === "simCard" ? "SIM Card" : key}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{value}</p>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA Section */}
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Study in {destination.city}?
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your application process and connect with other students
                  who have studied here.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/basic-information">
                    <Button size="lg">Start Application</Button>
                  </Link>
                  <Link href="/student-stories">
                    <Button variant="outline" size="lg">
                      Read Stories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params!;

  // Sample destination data (in production this would come from your database)
  const destinations: Record<string, Destination> = {
    barcelona: {
      id: "barcelona",
      city: "Barcelona",
      country: "Spain",
      image:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
      description:
        "A vibrant Mediterranean city perfect for students seeking culture, beaches, and excellent universities. Barcelona combines stunning architecture, rich cultural heritage, and a thriving student community.",
      costLevel: "medium",
      rating: 4.8,
      studentCount: 1200,
      popularUniversities: [
        {
          name: "Universitat Politècnica de Catalunya",
          type: "Public",
          programs: ["Engineering", "Architecture", "Technology"],
        },
        {
          name: "Universitat de Barcelona",
          type: "Public",
          programs: ["Medicine", "Law", "Philosophy", "Sciences"],
        },
        {
          name: "Universitat Pompeu Fabra",
          type: "Public",
          programs: ["Economics", "Political Science", "Communication"],
        },
      ],
      highlights: [
        "Beautiful architecture",
        "Beach proximity",
        "Rich cultural scene",
        "Great nightlife",
        "Mediterranean climate",
      ],
      avgCostPerMonth: 800,
      details: {
        population: 1620343,
        language: "Spanish, Catalan",
        currency: "Euro (EUR)",
        climate: "Mediterranean",
        timezone: "CET (UTC+1)",
      },
      livingCosts: {
        accommodation: { min: 400, max: 800 },
        food: { min: 200, max: 400 },
        transport: 50,
        entertainment: { min: 100, max: 300 },
      },
      transportation: {
        publicTransport: "Metro, Bus, Tram",
        bikeRentals: true,
        walkability: 8,
        nearestAirport: "Barcelona-El Prat Airport (BCN)",
      },
      attractions: [
        {
          name: "Sagrada Familia",
          type: "Architecture",
          description: "Gaudí's masterpiece and iconic symbol of Barcelona",
        },
        {
          name: "Park Güell",
          type: "Park",
          description: "Colorful park designed by Antoni Gaudí",
        },
        {
          name: "Las Ramblas",
          type: "Street",
          description: "Famous pedestrian street in central Barcelona",
        },
        {
          name: "Gothic Quarter",
          type: "Historic District",
          description: "Medieval neighborhood with narrow streets and squares",
        },
      ],
      studentLife: {
        nightlife: 9,
        culture: 9,
        sports: 7,
        internationalCommunity: 8,
      },
      practicalInfo: {
        visa: "EU students don't need a visa. Non-EU students need a student visa.",
        healthcare:
          "European Health Insurance Card (EHIC) or private insurance required.",
        bankingTips:
          "Major banks: BBVA, Santander, CaixaBank. Most accept international cards.",
        simCard:
          "Major providers: Movistar, Vodafone, Orange. Prepaid options available.",
      },
      gallery: [
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&h=600&fit=crop",
      ],
    },
    prague: {
      id: "prague",
      city: "Prague",
      country: "Czech Republic",
      image:
        "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=800&h=600&fit=crop",
      description:
        "A historic gem in Central Europe offering affordable living and world-class education. Prague's stunning architecture and rich history make it an ideal destination for students.",
      costLevel: "low",
      rating: 4.6,
      studentCount: 800,
      popularUniversities: [
        {
          name: "Charles University",
          type: "Public",
          programs: ["Medicine", "Law", "Sciences", "Humanities"],
        },
        {
          name: "Czech Technical University",
          type: "Public",
          programs: ["Engineering", "Architecture", "Technology"],
        },
        {
          name: "University of Economics",
          type: "Public",
          programs: ["Economics", "Business", "Finance"],
        },
      ],
      highlights: [
        "Historic architecture",
        "Affordable living",
        "Central European culture",
        "Great beer",
        "Beautiful old town",
      ],
      avgCostPerMonth: 600,
      details: {
        population: 1308632,
        language: "Czech",
        currency: "Czech Koruna (CZK)",
        climate: "Continental",
        timezone: "CET (UTC+1)",
      },
      livingCosts: {
        accommodation: { min: 300, max: 600 },
        food: { min: 150, max: 300 },
        transport: 30,
        entertainment: { min: 80, max: 200 },
      },
      transportation: {
        publicTransport: "Metro, Tram, Bus",
        bikeRentals: true,
        walkability: 9,
        nearestAirport: "Václav Havel Airport Prague (PRG)",
      },
      attractions: [
        {
          name: "Prague Castle",
          type: "Historic Site",
          description: "One of the largest ancient castles in the world",
        },
        {
          name: "Charles Bridge",
          type: "Bridge",
          description: "Historic stone bridge with baroque statues",
        },
        {
          name: "Old Town Square",
          type: "Square",
          description: "Historic square with astronomical clock",
        },
        {
          name: "Wenceslas Square",
          type: "Square",
          description: "Main commercial area and cultural center",
        },
      ],
      studentLife: {
        nightlife: 8,
        culture: 9,
        sports: 6,
        internationalCommunity: 7,
      },
      practicalInfo: {
        visa: "EU students don't need a visa. Non-EU students need a student visa.",
        healthcare:
          "European Health Insurance Card (EHIC) or Czech health insurance.",
        bankingTips: "Major banks: Česká spořitelna, ČSOB, UniCredit Bank.",
        simCard:
          "Major providers: O2, T-Mobile, Vodafone. Good coverage throughout the city.",
      },
      gallery: [
        "https://images.unsplash.com/photo-1542324151-ee2b73cb0d95?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1574116195003-84f95ca3b8e2?w=800&h=600&fit=crop",
      ],
    },
  };

  const destination = destinations[id as string] || null;

  return {
    props: {
      destination,
    },
  };
};
