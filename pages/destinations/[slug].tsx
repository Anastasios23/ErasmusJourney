import { GetServerSideProps } from "next";
import { useState, type ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Home, Utensils, Bus } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../src/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { aggregateCityData } from "../../src/services/cityAggregationService";
import { CityAggregatedData } from "../../src/types/cityData";
import { StatBar } from "../../src/components/ui/stat-bar";
import { InsightBadge } from "../../src/components/ui/insight-badge";
import { prisma } from "../../lib/prisma";
import CourseMatchingInsights from "../../src/components/CourseMatchingInsights";

interface StudentExperience {
  id: string;
  university: string;
  semester: string;
  overallRating: number;
  accommodationType: string;
  monthlyBudget: number;
  topTip: string;
  budgetAdvice: string;
  socialLifeRating: number;
  academicRating: number;
  wouldRecommend: boolean;
}

interface DestinationDetailProps {
  cityData: CityAggregatedData;
  city: string;
  country: string;
  studentExperiences: StudentExperience[];
}

// Dashboard-style background orbs with enhanced glow effects
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/25 to-fuchsia-600/25 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-40 right-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-20 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-full blur-[130px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-indigo-600/15 to-purple-600/15 rounded-full blur-[150px]" />
    </div>
  );
}

// Dashboard-style glass container
function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
      relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/40
      border border-white/20 dark:border-white/10
      rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20
      ${className}
    `}
    >
      {children}
    </motion.div>
  );
}

export default function DestinationDetail({
  cityData,
  city,
  country,
  studentExperiences,
}: DestinationDetailProps) {
  const [selectedTab, setSelectedTab] = useState<"overview" | "universities" | "cost" | "accommodation" | "matching" | "experiences">(
    "overview",
  );

  // Gradient colors for student cards
  const gradients = [
    "from-violet-500 to-fuchsia-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-indigo-500 to-purple-500",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Head>
        <title>
          {city}, {country} - Destination Details | Erasmus Journey
        </title>
        <meta
          name="description"
          content={`Detailed information about studying in ${city}, ${country}. Real student experiences, costs, and ratings.`}
        />
      </Head>

      <Header />

      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] -mt-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            {/* TOP CHOICE Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/30">
                <Icon icon="solar:shield-check-bold" className="w-3.5 h-3.5" />
                TOP CHOICE 2024
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
            >
              {city}, {country}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
            >
              The ultimate Erasmus destination for Cypriot students. Sun, sea, and world-class education await.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg">
                <Icon icon="solar:bookmark-bold" className="w-4 h-4 mr-2" />
                Save Destination
              </Button>
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-6 py-2.5 rounded-lg font-medium backdrop-blur-md">
                <Icon icon="solar:play-circle-bold" className="w-4 h-4 mr-2" />
                Watch Guide
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 sticky top-0 z-20 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab("universities")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === "universities"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Universities
            </button>
            <button
              onClick={() => setSelectedTab("cost")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === "cost"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Cost of Living
            </button>
            <button
              onClick={() => setSelectedTab("accommodation")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === "accommodation"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Accommodation
            </button>
            <button
              onClick={() => setSelectedTab("matching")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === "matching"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Course Matching
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8"
        >
          {/* Avg Monthly Cost */}
          <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:wallet-bold" className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-slate-500 dark:text-gray-400">Avg. Monthly Cost</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                €{Math.round(cityData.livingCosts.avgTotalMonthly).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <Icon icon="solar:arrow-down-linear" className="w-3 h-3" />
                <span>+5% vs last year</span>
              </div>
            </CardContent>
          </Card>

          {/* Safety Score */}
          <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:shield-check-bold" className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-slate-500 dark:text-gray-400">Safety Score</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {cityData.ratings.avgOverallRating.toFixed(1)}/10
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                Based on {cityData.ratings.ratingSubmissions} reviews
              </div>
            </CardContent>
          </Card>

          {/* Student Satisfaction */}
          <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:star-bold" className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-slate-500 dark:text-gray-400">Student Satisfaction</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {(cityData.ratings.avgOverallRating / 2).toFixed(1)}/5
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                Top rated nightlife
              </div>
            </CardContent>
          </Card>

          {/* Weather */}
          <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:sun-bold" className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-slate-500 dark:text-gray-400">Avg. Weather</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                18°C
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                Mediterranean climate
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        {selectedTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cost Breakdown */}
              <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <Icon
                      icon="solar:bill-list-bold"
                      className="w-5 h-5 mr-2 text-blue-600"
                    />
                    Cost of Living Breakdown
                  </CardTitle>
                  <Button variant="link" className="text-blue-600 text-sm">
                    Full Report
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost Items with Progress Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                          Rent (Shared Apartment)
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">\u20ac{Math.round(cityData.livingCosts.avgMonthlyRent)} <span className="text-xs font-normal text-slate-500">/mo</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(cityData.livingCosts.avgMonthlyRent / cityData.livingCosts.avgTotalMonthly) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                          Groceries & Food
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">\u20ac{Math.round(cityData.livingCosts.avgMonthlyFood)} <span className="text-xs font-normal text-slate-500">/mo</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${(cityData.livingCosts.avgMonthlyFood / cityData.livingCosts.avgTotalMonthly) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                          Transport
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">\u20ac{Math.round(cityData.livingCosts.avgMonthlyTransport)} <span className="text-xs font-normal text-slate-500">/mo</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${(cityData.livingCosts.avgMonthlyTransport / cityData.livingCosts.avgTotalMonthly) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                          Leisure & Activities
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">\u20ac{Math.round(cityData.livingCosts.avgMonthlyOther || 200)} <span className="text-xs font-normal text-slate-500">/mo</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${((cityData.livingCosts.avgMonthlyOther || 200) / cityData.livingCosts.avgTotalMonthly) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Money Saving Tip */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Icon icon="solar:lightbulb-bold" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Money Saving Tip
                        </h4>
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          Get the T-Jove travel card if you're under 30. It offers unlimited travel for 3 months for around \u20ac40 across all zones!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Ratings */}
              <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <Icon
                      icon="solar:star-bold"
                      className="w-5 h-5 mr-2 text-blue-600"
                    />
                    Student Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatBar
                    label="Overall Experience"
                    value={cityData.ratings.avgOverallRating}
                    color="bg-blue-500"
                  />
                  <StatBar
                    label="Social Life"
                    value={cityData.ratings.avgSocialLifeRating}
                    color="bg-pink-500"
                  />
                  <StatBar
                    label="Academic Quality"
                    value={cityData.ratings.avgAcademicRating}
                    color="bg-purple-500"
                  />
                  <StatBar
                    label="Cultural Immersion"
                    value={cityData.ratings.avgCulturalImmersionRating}
                    color="bg-indigo-500"
                  />
                  <StatBar
                    label="Cost of Living"
                    value={cityData.ratings.avgCostOfLivingRating}
                    color="bg-green-500"
                  />
                  <StatBar
                    label="Accommodation"
                    value={cityData.ratings.avgAccommodationRating}
                    color="bg-orange-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-gray-500 pt-2">
                    Based on {cityData.ratings.ratingSubmissions} ratings
                  </p>
                </CardContent>
              </Card>

              {/* Accommodation Options */}
              <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <Icon
                      icon="solar:home-2-bold"
                      className="w-5 h-5 mr-2 text-blue-600"
                    />
                    Accommodation Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cityData.accommodation?.types?.map((accom, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10"
                      >
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {accom.type}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-gray-400 ml-2">
                            ({accom.count} students)
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            €{Math.round(accom.avgRent)}/mo
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-500">
                            {accom.percentage.toFixed(0)}% of students
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!cityData.accommodation?.types ||
                      cityData.accommodation.types.length === 0) && (
                      <p className="text-sm text-slate-500 dark:text-gray-500 italic">
                        No accommodation data available yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Course Matching Insights */}
              <CourseMatchingInsights city={city} country={country} />
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Cypriot Community */}
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-700 shadow-xl text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Icon icon="solar:users-group-rounded-bold" className="w-5 h-5" />
                    Cypriot Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-50 mb-4">
                    There are currently <span className="font-bold text-white">42 students</span> from Cyprus in {city}. Join the WhatsApp group to find roommates and share tips!
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-blue-600 flex items-center justify-center text-xs font-medium">
                        👤
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center text-xs font-medium">
                        👤
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-blue-600 flex items-center justify-center text-xs font-medium">
                        👤
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-700">
                        +39
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium">
                    Join Group →
                  </Button>
                </CardContent>
              </Card>

              {/* Universities */}
              <Card className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">
                    Partner Universities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cityData.universities.slice(0, 5).map((uni, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-slate-600 dark:text-gray-300 flex items-start"
                      >
                        <Icon
                          icon="solar:map-point-bold-duotone"
                          className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500 flex-shrink-0 mt-0.5"
                        />
                        <span>{typeof uni === "string" ? uni : uni.name}</span>
                      </div>
                    ))}
                    {cityData.universities.length > 5 && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                        +{cityData.universities.length - 5} more universities
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-500/20 shadow-xl shadow-emerald-100/50 dark:shadow-emerald-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {cityData.recommendations.recommendationPercentage.toFixed(
                        0,
                      )}
                      %
                    </div>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium mb-1">
                      Would Recommend
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500/70">
                      {cityData.recommendations.wouldRecommendCount} out of{" "}
                      {cityData.recommendations.totalRecommendationResponses}{" "}
                      students
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Freshness */}
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/40 border border-white/20 dark:border-white/10 shadow-xl dark:shadow-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-center text-sm text-slate-500 dark:text-gray-400">
                    <Icon
                      icon="solar:calendar-bold-duotone"
                      className="w-4 h-4 mr-2"
                    />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Student Experiences Tab */
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full border border-violet-200 dark:border-violet-500/30 hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="w-4 h-4 mr-2"
                />
                {studentExperiences.length} Student Stories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Real Experiences from Students in {city}
              </h2>
              <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Learn from students who have studied here. Their tips, budgets,
                and honest reviews.
              </p>
            </div>

            {studentExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentExperiences.map((exp, index) => (
                  <Card
                    key={exp.id}
                    className="overflow-hidden hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 backdrop-blur-xl bg-white/70 dark:bg-gray-900/40 border border-white/20 dark:border-white/10 shadow-xl dark:shadow-2xl group"
                  >
                    {/* Card Header with Gradient */}
                    <div
                      className={`h-2 bg-gradient-to-r ${gradients[index % gradients.length]}`}
                    />

                    <CardContent className="p-8">
                      {/* Student Info */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white shadow-lg`}
                          >
                            <Icon
                              icon="solar:mortarboard-bold-duotone"
                              className="w-7 h-7"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">
                              {exp.university}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                              <Icon
                                icon="solar:calendar-bold-duotone"
                                className="w-3.5 h-3.5"
                              />
                              {exp.semester}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-500/30">
                          <Icon
                            icon="solar:star-bold-duotone"
                            className="w-4 h-4"
                          />
                          <span className="font-bold text-sm">
                            {exp.overallRating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                        <div className="text-center">
                          <Icon
                            icon="solar:wad-of-money-bold-duotone"
                            className="w-5 h-5 mx-auto mb-2 text-emerald-500 dark:text-emerald-400"
                          />
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            €{exp.monthlyBudget}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                            Monthly
                          </p>
                        </div>
                        <div className="text-center border-x border-slate-200 dark:border-white/10">
                          <Icon
                            icon="solar:home-2-bold-duotone"
                            className="w-5 h-5 mx-auto mb-2 text-blue-500 dark:text-blue-400"
                          />
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate px-2">
                            {exp.accommodationType}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                            Housing
                          </p>
                        </div>
                        <div className="text-center">
                          <Icon
                            icon="solar:heart-bold-duotone"
                            className={`w-5 h-5 mx-auto mb-2 ${exp.wouldRecommend ? "text-rose-500 dark:text-rose-400" : "text-slate-400 dark:text-gray-600"}`}
                          />
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {exp.wouldRecommend ? "Yes" : "No"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                            Recommend
                          </p>
                        </div>
                      </div>

                      {/* Top Tip */}
                      {exp.topTip && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon
                              icon="solar:lightbulb-bold-duotone"
                              className="w-4 h-4 text-amber-500 dark:text-amber-400"
                            />
                            <span className="text-xs font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                              Top Tip
                            </span>
                          </div>
                          <div className="relative pl-4 border-l-2 border-amber-500/30">
                            <p className="text-sm text-slate-600 dark:text-gray-300 italic line-clamp-3 leading-relaxed">
                              "{exp.topTip}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Budget Advice */}
                      {exp.budgetAdvice && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              icon="solar:wad-of-money-bold-duotone"
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                            />
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              Budget Tip
                            </span>
                          </div>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200/80 line-clamp-2 leading-relaxed">
                            {exp.budgetAdvice}
                          </p>
                        </div>
                      )}

                      {/* Rating Bars */}
                      <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 dark:text-gray-500 w-20">
                            Social Life
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                              style={{
                                width: `${(exp.socialLifeRating / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-gray-300 w-8 text-right">
                            {exp.socialLifeRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 dark:text-gray-500 w-20">
                            Academic
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{
                                width: `${(exp.academicRating / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-gray-300 w-8 text-right">
                            {exp.academicRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 backdrop-blur-xl bg-white/70 dark:bg-gray-900/40 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl dark:shadow-2xl">
                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/10">
                  <Icon
                    icon="solar:chat-round-dots-bold-duotone"
                    className="w-12 h-12 text-slate-400 dark:text-gray-600"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  No Stories Yet
                </h3>
                <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
                  Be the first to share your experience studying in {city}!
                </p>
                <Link href="/share-experience">
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white rounded-xl px-8 py-6 text-lg shadow-xl shadow-violet-600/20">
                    <Icon
                      icon="solar:stars-minimalistic-bold-duotone"
                      className="w-5 h-5 mr-2"
                    />
                    Share Your Story
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  // Parse slug (e.g., "barcelona-spain" -> city: "Barcelona", country: "Spain")
  const parts = slug.split("-");
  if (parts.length < 2) {
    return { notFound: true };
  }

  // Last part is country, rest is city
  const country = parts[parts.length - 1];
  const city = parts.slice(0, -1).join(" ");

  // Capitalize first letter of each word
  const capitalizeWords = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formattedCity = capitalizeWords(city);
  const formattedCountry = capitalizeWords(country);

  try {
    const cityData = await aggregateCityData(formattedCity, formattedCountry);

    if (cityData.totalSubmissions === 0) {
      return { notFound: true };
    }

    // Fetch individual student experiences for the Student Experiences tab
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        hostCity: { equals: formattedCity, mode: "insensitive" },
        hostCountry: { equals: formattedCountry, mode: "insensitive" },
        isComplete: true,
        status: { notIn: ["DRAFT", "REJECTED"] },
      },
      select: {
        id: true,
        basicInfo: true,
        accommodation: true,
        livingExpenses: true,
        experience: true,
        semester: true,
      },
      take: 20, // Limit to 20 experiences
      orderBy: { updatedAt: "desc" },
    });

    // Transform experiences to anonymized student stories
    const studentExperiences: StudentExperience[] = experiences.map((exp) => {
      const basicInfo = (exp.basicInfo as any) || {};
      const accommodation = (exp.accommodation as any) || {};
      const livingExpenses = (exp.livingExpenses as any) || {};
      const expData = (exp.experience as any) || {};

      // Calculate overall rating from accommodation rating or default
      const overallRating =
        parseFloat(accommodation.accommodationRating) || 4.0;

      // Calculate monthly budget from living expenses
      const monthlyBudget =
        (parseFloat(livingExpenses.groceries) || 0) +
        (parseFloat(livingExpenses.transportation) || 0) +
        (parseFloat(livingExpenses.eatingOut) || 0) +
        (parseFloat(livingExpenses.socialLife) || 0) +
        (parseFloat(accommodation.monthlyRent) || 0);

      return {
        id: exp.id,
        university: basicInfo.hostUniversity || "University Student",
        semester: exp.semester || basicInfo.exchangePeriod || "Exchange Period",
        overallRating: Math.min(5, Math.max(1, overallRating)),
        accommodationType: accommodation.accommodationType || "Not specified",
        monthlyBudget: monthlyBudget > 0 ? Math.round(monthlyBudget) : 800,
        topTip:
          expData.additionalAdvice || livingExpenses.overallBudgetAdvice || "",
        budgetAdvice:
          livingExpenses.budgetTips ||
          livingExpenses.moneyManagementTools ||
          "",
        socialLifeRating: parseFloat(accommodation.accommodationRating) || 4.0,
        academicRating: parseFloat(accommodation.accommodationRating) || 4.0,
        wouldRecommend:
          accommodation.wouldRecommend === "yes" ||
          accommodation.wouldRecommend === true,
      };
    });

    return {
      props: {
        cityData,
        city: formattedCity,
        country: formattedCountry,
        studentExperiences,
      },
    };
  } catch (error) {
    console.error("Error fetching city data:", error);
    return { notFound: true };
  }
};
