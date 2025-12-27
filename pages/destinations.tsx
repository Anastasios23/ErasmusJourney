import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cityAggregationClient } from "../src/services/cityAggregationClient";
import { CityAggregatedData } from "../src/types/cityData";
import Link from "next/link";

// Floating orbs component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl"
      />
    </div>
  );
}

// Animated text component for hero
const AnimatedWord = ({
  children,
  delay,
}: {
  children: string;
  delay: number;
}) => (
  <motion.span
    initial={{ opacity: 0, y: 50, rotateX: -90 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.8,
      delay,
      ease: [0.215, 0.61, 0.355, 1],
    }}
    className="inline-block"
  >
    {children}
  </motion.span>
);

// Destination card images (placeholder URLs - these would be actual city images)
const cityImages: Record<string, string> = {
  default:
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop",
  barcelona:
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
  paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
  berlin:
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
  amsterdam:
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop",
  prague:
    "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&h=400&fit=crop",
  lisbon:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop",
  vienna:
    "https://images.unsplash.com/photo-1516550893885-985c836c68d6?w=600&h=400&fit=crop",
  madrid:
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop",
  milan:
    "https://images.unsplash.com/photo-1520440229-6469325e5744?w=600&h=400&fit=crop",
};

// Modern destination card component
function DestinationCard({
  city,
  index,
}: {
  city: CityAggregatedData;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const slug = `${city.city.toLowerCase().replace(/\s+/g, "-")}-${city.country.toLowerCase().replace(/\s+/g, "-")}`;
  const imageUrl = cityImages[city.city.toLowerCase()] || cityImages.default;

  return (
    <Link href={`/destinations/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer"
      >
        {/* Background Image */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </motion.div>

        {/* Top badges */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1.5 text-sm font-medium">
              <Icon
                icon="solar:map-point-bold"
                className="w-3.5 h-3.5 mr-1.5"
              />
              {city.country}
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full"
          >
            <Icon icon="solar:star-bold" className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">
              {city.ratings.avgOverallRating.toFixed(1)}
            </span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          {/* City name with animated underline */}
          <div className="mb-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight"
              animate={{ y: isHovered ? -4 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {city.city}
            </motion.h2>
            <motion.div
              className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
              initial={{ width: "40%" }}
              animate={{ width: isHovered ? "80%" : "40%" }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Stats row */}
          <motion.div
            className="flex items-center gap-6 mb-5"
            animate={{ opacity: isHovered ? 1 : 0.9 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                <Icon
                  icon="solar:wallet-bold"
                  className="w-4 h-4 text-emerald-400"
                />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">Monthly</p>
                <p className="text-white font-bold text-lg">
                  €{Math.round(city.livingCosts.avgTotalMonthly)}
                </p>
              </div>
            </div>

            <div className="w-px h-10 bg-white/20" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-4 h-4 text-blue-400"
                />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">Reviews</p>
                <p className="text-white font-bold text-lg">
                  {city.totalSubmissions}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cost chips - visible on hover */}
          <motion.div
            className="flex flex-wrap gap-2 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Icon
                icon="solar:home-2-bold"
                className="w-3.5 h-3.5 text-blue-400"
              />
              <span className="text-white/90 text-sm font-medium">
                €{Math.round(city.livingCosts.avgMonthlyRent)} rent
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Icon
                icon="solar:cup-hot-bold"
                className="w-3.5 h-3.5 text-emerald-400"
              />
              <span className="text-white/90 text-sm font-medium">
                €{Math.round(city.livingCosts.avgMonthlyFood)} food
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Icon
                icon="solar:bus-bold"
                className="w-3.5 h-3.5 text-orange-400"
              />
              <span className="text-white/90 text-sm font-medium">
                €{Math.round(city.livingCosts.avgMonthlyTransport)} transport
              </span>
            </div>
          </motion.div>

          {/* Explore button */}
          <motion.div
            className="flex items-center justify-between"
            animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white/80 text-sm font-medium">
              {city.ratings.avgSocialLifeRating >= 4
                ? "🔥 Popular destination"
                : "✨ Hidden gem"}
            </span>
            <motion.div
              className="flex items-center gap-2 text-white font-semibold"
              animate={{ x: isHovered ? 0 : -10 }}
              transition={{ duration: 0.3 }}
            >
              <span>Explore</span>
              <motion.div
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
}

// Glass card component for search
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
      relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 
      border border-white/20 dark:border-gray-700/30 
      rounded-3xl shadow-xl shadow-gray-900/5
      ${className}
    `}
    >
      {children}
    </motion.div>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full border border-blue-200/50 dark:border-blue-700/50 shadow-lg text-sm font-medium">
                <Icon icon="solar:global-bold" className="w-4 h-4 mr-2" />
                {cities.length}+ Cities to Discover
              </Badge>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 overflow-hidden">
              <div className="flex flex-wrap justify-center gap-x-4">
                <AnimatedWord delay={0}>Find</AnimatedWord>
                <AnimatedWord delay={0.1}>Your</AnimatedWord>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 mt-2">
                <motion.span
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                  className="inline-block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                >
                  Perfect
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                  className="inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                >
                  Destination
                </motion.span>
              </div>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Real insights from{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {cities.reduce((acc, c) => acc + c.totalSubmissions, 0)}+
              </span>{" "}
              students. Compare costs, ratings & find your dream city.
            </motion.p>

            {/* Animated scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex flex-col items-center text-gray-400"
              >
                <span className="text-sm font-medium mb-2">
                  Scroll to explore
                </span>
                <Icon icon="solar:alt-arrow-down-linear" className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Icon
                    icon="solar:magnifer-linear"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  />
                  <Input
                    placeholder="Search by city or country..."
                    className="pl-12 h-14 text-lg bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-56 h-14 text-base bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
                    <Icon
                      icon="solar:filter-linear"
                      className="w-4 h-4 mr-2 text-gray-400"
                    />
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
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-[420px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredCities.map((city, index) => (
                  <DestinationCard key={city.city} city={city} index={index} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <GlassCard className="text-center py-20 px-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Icon
                    icon="solar:map-point-search-linear"
                    className="w-12 h-12 text-gray-400"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No destinations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  We couldn't find any cities matching "{searchTerm}". Try
                  adjusting your search or explore all destinations.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow"
                >
                  <Icon icon="solar:restart-bold" className="w-5 h-5" />
                  Clear Search
                </motion.button>
              </motion.div>
            </GlassCard>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
