import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import { Card, CardContent } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  MapPin,
  Euro,
  Star,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  Home,
  Utensils,
  Bus,
} from "lucide-react";
import { cityAggregationClient } from "../src/services/cityAggregationClient";
import { CityAggregatedData } from "../src/types/cityData";
import { StatBar } from "../src/components/ui/stat-bar";
import Link from "next/link";

export default function Destinations() {
  const [cities, setCities] = useState<CityAggregatedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await cityAggregationClient.getAllCityStats();
        setCities(data);
      } catch (error) {
        console.error("Failed to fetch city data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCities = cities
    .filter(
      (city) =>
        city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "popularity") return b.totalSubmissions - a.totalSubmissions;
      if (sortBy === "cost-low") return a.livingCosts.avgTotalMonthly - b.livingCosts.avgTotalMonthly;
      if (sortBy === "cost-high") return b.livingCosts.avgTotalMonthly - a.livingCosts.avgTotalMonthly;
      if (sortBy === "rating") return b.ratings.avgOverallRating - a.ratings.avgOverallRating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Erasmus Destinations - Explore Cities & Costs</title>
        <meta name="description" content="Discover Erasmus destinations with real student data on costs, ratings, and experiences." />
      </Head>

      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 hover:bg-blue-50 text-blue-600">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Explore Erasmus <span className="text-blue-600">Destinations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real insights from students who have been there. Compare living costs, ratings, and experiences to find your perfect match.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by city or country..."
              className="pl-10 h-12 text-lg shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 h-12 text-base shadow-sm border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="cost-low">Lowest Cost</SelectItem>
              <SelectItem value="cost-high">Highest Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((city) => {
              const slug = `${city.city.toLowerCase().replace(/\s+/g, '-')}-${city.country.toLowerCase().replace(/\s+/g, '-')}`;
              
              return (
                <Link key={city.city} href={`/destinations/${slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 group cursor-pointer">
                    <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative p-6 flex flex-col justify-between group-hover:scale-105 transition-transform duration-500">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                          {city.country}
                        </Badge>
                        <div className="flex items-center text-white/90 bg-black/10 px-2 py-1 rounded-full backdrop-blur-sm">
                          <Star className="w-4 h-4 text-yellow-300 mr-1 fill-yellow-300" />
                          <span className="font-bold text-sm">{city.ratings.avgOverallRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">{city.city}</h2>
                    </div>

                    <CardContent className="p-6">
                      {/* Key Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-700">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">
                            <Euro className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Monthly</p>
                            <p className="font-bold text-lg">€{Math.round(city.livingCosts.avgTotalMonthly)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="p-2 bg-purple-50 rounded-lg mr-3 text-purple-600">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Students</p>
                            <p className="font-bold text-lg">{city.totalSubmissions}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                          Cost Breakdown
                        </h3>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <Home className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                            <span className="block font-semibold text-gray-900">€{Math.round(city.livingCosts.avgMonthlyRent)}</span>
                            Rent
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <Utensils className="w-4 h-4 mx-auto mb-1 text-green-500" />
                            <span className="block font-semibold text-gray-900">€{Math.round(city.livingCosts.avgMonthlyFood)}</span>
                            Food
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <Bus className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                            <span className="block font-semibold text-gray-900">€{Math.round(city.livingCosts.avgMonthlyTransport)}</span>
                            Transport
                          </div>
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="space-y-3">
                        <StatBar label="Social Life" value={city.ratings.avgSocialLifeRating} color="bg-pink-500" />
                        <StatBar label="Safety & Culture" value={city.ratings.avgCulturalImmersionRating} color="bg-indigo-500" />
                      </div>
                      
                      {/* Click indicator */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center text-sm text-blue-600 font-medium group-hover:text-blue-700">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any cities matching "{searchTerm}". Try adjusting your search or check back later for new submissions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
