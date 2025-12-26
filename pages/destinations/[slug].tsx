import { GetServerSideProps } from "next";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
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
import {
  ArrowLeft,
  MapPin,
  Users,
  Euro,
  Home,
  Utensils,
  Bus,
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  BookOpen,
  Lightbulb,
  Quote,
  GraduationCap,
  Heart,
  Building2,
  Sparkles,
} from "lucide-react";
import { aggregateCityData } from "../../src/services/cityAggregationService";
import { CityAggregatedData } from "../../src/types/cityData";
import { StatBar } from "../../src/components/ui/stat-bar";
import { InsightBadge } from "../../src/components/ui/insight-badge";
import { prisma } from "../../lib/prisma";
import { CourseMatchingInsights } from "../../src/components/CourseMatchingInsights";

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

export default function DestinationDetail({
  cityData,
  city,
  country,
  studentExperiences,
}: DestinationDetailProps) {
  const [selectedTab, setSelectedTab] = useState<"overview" | "experiences">(
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/destinations">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-blue-50 text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Destinations
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm mb-4">
                {country}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                {city}
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Based on {cityData.totalSubmissions} student{" "}
                {cityData.totalSubmissions === 1 ? "experience" : "experiences"}
              </p>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl">
              <Star className="w-8 h-8 text-yellow-300 mr-2 fill-yellow-300" />
              <div>
                <div className="text-3xl font-bold">
                  {cityData.ratings.avgOverallRating.toFixed(1)}
                </div>
                <div className="text-xs text-blue-100">Overall Rating</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Euro className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">
                €{Math.round(cityData.livingCosts.avgTotalMonthly)}
              </div>
              <div className="text-sm text-blue-100">Avg Monthly Cost</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Home className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">
                €{Math.round(cityData.livingCosts.avgMonthlyRent)}
              </div>
              <div className="text-sm text-blue-100">Avg Rent</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Users className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">
                {cityData.totalSubmissions}
              </div>
              <div className="text-sm text-blue-100">Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <TrendingUp className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">
                {cityData.recommendations.recommendationPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-blue-100">Would Recommend</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              selectedTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setSelectedTab("experiences")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              selectedTab === "experiences"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Student Experiences ({cityData.totalSubmissions})
          </button>
        </div>

        {/* Content */}
        {selectedTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Euro className="w-5 h-5 mr-2 text-blue-600" />
                    Monthly Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InsightBadge
                      icon={Home}
                      label="Rent"
                      value={`€${Math.round(cityData.livingCosts.avgMonthlyRent)}`}
                      color="blue"
                    />
                    <InsightBadge
                      icon={Utensils}
                      label="Food"
                      value={`€${Math.round(cityData.livingCosts.avgMonthlyFood)}`}
                      color="green"
                    />
                    <InsightBadge
                      icon={Bus}
                      label="Transport"
                      value={`€${Math.round(cityData.livingCosts.avgMonthlyTransport)}`}
                      color="orange"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Total Monthly Budget
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        €{Math.round(cityData.livingCosts.avgTotalMonthly)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Based on {cityData.livingCosts.costSubmissions} student
                      budgets
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ratings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
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
                  <p className="text-xs text-gray-500 pt-2">
                    Based on {cityData.ratings.ratingSubmissions} ratings
                  </p>
                </CardContent>
              </Card>

              {/* Accommodation Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                    Accommodation Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cityData.accommodation?.types?.map((accom, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {accom.type}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({accom.count} students)
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            €{Math.round(accom.avgRent)}/mo
                          </div>
                          <div className="text-xs text-gray-500">
                            {accom.percentage.toFixed(0)}% of students
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!cityData.accommodation?.types ||
                      cityData.accommodation.types.length === 0) && (
                      <p className="text-sm text-gray-500 italic">
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
              {/* Universities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Universities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cityData.universities.slice(0, 5).map((uni, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{typeof uni === "string" ? uni : uni.name}</span>
                      </div>
                    ))}
                    {cityData.universities.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{cityData.universities.length - 5} more universities
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {cityData.recommendations.recommendationPercentage.toFixed(
                        0,
                      )}
                      %
                    </div>
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Would Recommend
                    </p>
                    <p className="text-xs text-green-700">
                      {cityData.recommendations.wouldRecommendCount} out of{" "}
                      {cityData.recommendations.totalRecommendationResponses}{" "}
                      students
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Freshness */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
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
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full border border-violet-200/50">
                <Users className="w-4 h-4 mr-2" />
                {studentExperiences.length} Student Stories
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Real Experiences from Students in {city}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Learn from students who have studied here. Their tips, budgets,
                and honest reviews.
              </p>
            </div>

            {studentExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentExperiences.map((exp, index) => (
                  <Card
                    key={exp.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 dark:border-gray-800 group"
                  >
                    {/* Card Header with Gradient */}
                    <div
                      className={`h-3 bg-gradient-to-r ${gradients[index % gradients.length]}`}
                    />

                    <CardContent className="p-6">
                      {/* Student Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                          >
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {exp.university}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {exp.semester}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-sm">
                            {exp.overallRating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="text-center">
                          <Euro className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            €{exp.monthlyBudget}
                          </p>
                          <p className="text-xs text-gray-500">Monthly</p>
                        </div>
                        <div className="text-center border-x border-gray-200 dark:border-gray-700">
                          <Home className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate px-1">
                            {exp.accommodationType}
                          </p>
                          <p className="text-xs text-gray-500">Housing</p>
                        </div>
                        <div className="text-center">
                          <Heart
                            className={`w-4 h-4 mx-auto mb-1 ${exp.wouldRecommend ? "text-rose-500 fill-rose-500" : "text-gray-400"}`}
                          />
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {exp.wouldRecommend ? "Yes" : "No"}
                          </p>
                          <p className="text-xs text-gray-500">Recommend</p>
                        </div>
                      </div>

                      {/* Top Tip */}
                      {exp.topTip && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Top Tip
                            </span>
                          </div>
                          <div className="relative pl-4 border-l-2 border-amber-300 dark:border-amber-600">
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic line-clamp-3">
                              "{exp.topTip}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Budget Advice */}
                      {exp.budgetAdvice && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Euro className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Budget Tip
                            </span>
                          </div>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200 line-clamp-2">
                            {exp.budgetAdvice}
                          </p>
                        </div>
                      )}

                      {/* Rating Bars */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20">
                            Social Life
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${(exp.socialLifeRating / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8">
                            {exp.socialLifeRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20">
                            Academic
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${(exp.academicRating / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8">
                            {exp.academicRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  No Stories Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Be the first to share your experience studying in {city}!
                </p>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white rounded-xl">
                    <Sparkles className="w-4 h-4 mr-2" />
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
