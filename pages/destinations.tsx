import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
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
  Sparkles,
  Globe,
  Filter,
} from "lucide-react";
import { cityAggregationClient } from "../src/services/cityAggregationClient";
import { CityAggregatedData } from "../src/types/cityData";
import { StatBar } from "../src/components/ui/stat-bar";
import Link from "next/link";

// Floating orbs component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl" />
    </div>
  );
}

// Glass card component
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
      relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 
      border border-white/20 dark:border-gray-700/30 
      rounded-3xl shadow-xl shadow-gray-900/5
      hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-200/50 hover:-translate-y-1 transition-all duration-500
      ${className}
    `}
    >
      {children}
    </div>
  );
}

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
        city.country.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "popularity")
        return b.totalSubmissions - a.totalSubmissions;
      if (sortBy === "cost-low")
        return a.livingCosts.avgTotalMonthly - b.livingCosts.avgTotalMonthly;
      if (sortBy === "cost-high")
        return b.livingCosts.avgTotalMonthly - a.livingCosts.avgTotalMonthly;
      if (sortBy === "rating")
        return b.ratings.avgOverallRating - a.ratings.avgOverallRating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Head>
        <title>Erasmus Destinations - Explore Cities & Costs</title>
        <meta
          name="description"
          content="Discover Erasmus destinations with real student data on costs, ratings, and experiences."
        />
      </Head>

      <Header />

      <main className="pt-24 pb-16 relative overflow-hidden">
        <FloatingOrbs />

        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full border border-amber-200/50 dark:border-amber-700/50 shadow-lg">
              <Globe className="w-4 h-4 mr-2" />
              {cities.length} Destinations Available
            </Badge>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-gray-900 dark:text-white">
                Explore Erasmus
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Destinations
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Real insights from students who have been there. Compare living
              costs, ratings, and experiences to find your perfect match.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by city or country..."
                    className="pl-12 h-14 text-lg bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:border-amber-500 focus:ring-amber-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-56 h-14 text-base bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="cost-low">Lowest Cost</SelectItem>
                    <SelectItem value="cost-high">Highest Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[420px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCities.map((city, index) => {
                const slug = `${city.city.toLowerCase().replace(/\s+/g, "-")}-${city.country.toLowerCase().replace(/\s+/g, "-")}`;
                const gradients = [
                  "from-violet-500 via-fuchsia-500 to-pink-500",
                  "from-blue-500 via-cyan-500 to-teal-500",
                  "from-amber-500 via-orange-500 to-red-500",
                  "from-emerald-500 via-green-500 to-lime-500",
                  "from-indigo-500 via-purple-500 to-pink-500",
                  "from-rose-500 via-pink-500 to-fuchsia-500",
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <Link key={city.city} href={`/destinations/${slug}`}>
                    <GlassCard className="overflow-hidden group cursor-pointer h-full">
                      {/* Header with gradient */}
                      <div
                        className={`h-36 bg-gradient-to-br ${gradient} relative p-6 flex flex-col justify-between overflow-hidden`}
                      >
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />

                        <div className="flex justify-between items-start relative z-10">
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm font-medium">
                            {city.country}
                          </Badge>
                          <div className="flex items-center text-white bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <Star className="w-4 h-4 text-yellow-300 mr-1 fill-yellow-300" />
                            <span className="font-bold text-sm">
                              {city.ratings.avgOverallRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight relative z-10">
                          {city.city}
                        </h2>
                      </div>

                      <CardContent className="p-6">
                        {/* Key Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center">
                            <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl mr-3">
                              <Euro className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Monthly
                              </p>
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                €{Math.round(city.livingCosts.avgTotalMonthly)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="p-2.5 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl mr-3">
                              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Reviews
                              </p>
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                {city.totalSubmissions}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="space-y-3 mb-6">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                            Cost Breakdown
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl text-center">
                              <Home className="w-4 h-4 mx-auto mb-1.5 text-blue-500" />
                              <span className="block font-bold text-gray-900 dark:text-white">
                                €{Math.round(city.livingCosts.avgMonthlyRent)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Rent
                              </span>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-xl text-center">
                              <Utensils className="w-4 h-4 mx-auto mb-1.5 text-green-500" />
                              <span className="block font-bold text-gray-900 dark:text-white">
                                €{Math.round(city.livingCosts.avgMonthlyFood)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Food
                              </span>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-3 rounded-xl text-center">
                              <Bus className="w-4 h-4 mx-auto mb-1.5 text-orange-500" />
                              <span className="block font-bold text-gray-900 dark:text-white">
                                €
                                {Math.round(
                                  city.livingCosts.avgMonthlyTransport,
                                )}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Transport
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ratings */}
                        <div className="space-y-3">
                          <StatBar
                            label="Social Life"
                            value={city.ratings.avgSocialLifeRating}
                            color="bg-gradient-to-r from-pink-500 to-rose-500"
                          />
                          <StatBar
                            label="Culture & Safety"
                            value={city.ratings.avgCulturalImmersionRating}
                            color="bg-gradient-to-r from-indigo-500 to-violet-500"
                          />
                        </div>

                        {/* Click indicator */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </CardContent>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          ) : (
            <GlassCard className="text-center py-20 px-8">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No destinations found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                We couldn't find any cities matching "{searchTerm}". Try
                adjusting your search or check back later for new submissions.
              </p>
            </GlassCard>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
