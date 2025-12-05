import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { Button } from '../../src/components/ui/button';
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
} from 'lucide-react';
import { aggregateCityData } from '../../src/services/cityAggregationService';
import { CityAggregatedData } from '../../src/types/cityData';
import { StatBar } from '../../src/components/ui/stat-bar';
import { InsightBadge } from '../../src/components/ui/insight-badge';

interface DestinationDetailProps {
  cityData: CityAggregatedData;
  city: string;
  country: string;
}

export default function DestinationDetail({ cityData, city, country }: DestinationDetailProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'experiences'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{city}, {country} - Destination Details | Erasmus Journey</title>
        <meta name="description" content={`Detailed information about studying in ${city}, ${country}. Real student experiences, costs, and ratings.`} />
      </Head>

      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/destinations">
          <Button variant="ghost" className="mb-6 hover:bg-blue-50 text-blue-600">
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
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{city}</h1>
              <p className="text-xl text-blue-100 mb-6">
                Based on {cityData.totalSubmissions} student {cityData.totalSubmissions === 1 ? 'experience' : 'experiences'}
              </p>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl">
              <Star className="w-8 h-8 text-yellow-300 mr-2 fill-yellow-300" />
              <div>
                <div className="text-3xl font-bold">{cityData.ratings.avgOverallRating.toFixed(1)}</div>
                <div className="text-xs text-blue-100">Overall Rating</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Euro className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">€{Math.round(cityData.livingCosts.avgTotalMonthly)}</div>
              <div className="text-sm text-blue-100">Avg Monthly Cost</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Home className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">€{Math.round(cityData.livingCosts.avgMonthlyRent)}</div>
              <div className="text-sm text-blue-100">Avg Rent</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Users className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">{cityData.totalSubmissions}</div>
              <div className="text-sm text-blue-100">Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <TrendingUp className="w-6 h-6 mb-2 text-blue-200" />
              <div className="text-2xl font-bold">{cityData.recommendations.recommendationPercentage.toFixed(0)}%</div>
              <div className="text-sm text-blue-100">Would Recommend</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              selectedTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setSelectedTab('experiences')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              selectedTab === 'experiences'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student Experiences ({cityData.totalSubmissions})
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'overview' ? (
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
                    <InsightBadge icon={Home} label="Rent" value={`€${Math.round(cityData.livingCosts.avgMonthlyRent)}`} color="blue" />
                    <InsightBadge icon={Utensils} label="Food" value={`€${Math.round(cityData.livingCosts.avgMonthlyFood)}`} color="green" />
                    <InsightBadge icon={Bus} label="Transport" value={`€${Math.round(cityData.livingCosts.avgMonthlyTransport)}`} color="orange" />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Monthly Budget</span>
                      <span className="text-2xl font-bold text-gray-900">€{Math.round(cityData.livingCosts.avgTotalMonthly)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Based on {cityData.livingCosts.costSubmissions} student budgets</p>
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
                  <StatBar label="Overall Experience" value={cityData.ratings.avgOverallRating} color="bg-blue-500" />
                  <StatBar label="Social Life" value={cityData.ratings.avgSocialLifeRating} color="bg-pink-500" />
                  <StatBar label="Academic Quality" value={cityData.ratings.avgAcademicRating} color="bg-purple-500" />
                  <StatBar label="Cultural Immersion" value={cityData.ratings.avgCulturalImmersionRating} color="bg-indigo-500" />
                  <StatBar label="Cost of Living" value={cityData.ratings.avgCostOfLivingRating} color="bg-green-500" />
                  <StatBar label="Accommodation" value={cityData.ratings.avgAccommodationRating} color="bg-orange-500" />
                  <p className="text-xs text-gray-500 pt-2">Based on {cityData.ratings.ratingSubmissions} ratings</p>
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
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{accom.type}</span>
                          <span className="text-sm text-gray-500 ml-2">({accom.count} students)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">€{Math.round(accom.avgRent)}/mo</div>
                          <div className="text-xs text-gray-500">{accom.percentage.toFixed(0)}% of students</div>
                        </div>
                      </div>
                    ))}
                    {(!cityData.accommodation?.types || cityData.accommodation.types.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No accommodation data available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                      <div key={idx} className="text-sm text-gray-700 flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{typeof uni === 'string' ? uni : uni.name}</span>
                      </div>
                    ))}
                    {cityData.universities.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">+{cityData.universities.length - 5} more universities</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {cityData.recommendations.recommendationPercentage.toFixed(0)}%
                    </div>
                    <p className="text-sm text-green-800 font-medium mb-1">Would Recommend</p>
                    <p className="text-xs text-green-700">
                      {cityData.recommendations.wouldRecommendCount} out of {cityData.recommendations.totalRecommendationResponses} students
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
          <div className="space-y-6">
            <p className="text-gray-600 text-center py-8">
              Individual student experiences will be displayed here. This feature is coming soon!
            </p>
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Stories Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're working on displaying detailed individual experiences from students who studied in {city}.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };
  
  // Parse slug (e.g., "barcelona-spain" -> city: "Barcelona", country: "Spain")
  const parts = slug.split('-');
  if (parts.length < 2) {
    return { notFound: true };
  }
  
  // Last part is country, rest is city
  const country = parts[parts.length - 1];
  const city = parts.slice(0, -1).join(' ');
  
  // Capitalize first letter of each word
  const capitalizeWords = (str: string) =>
    str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const formattedCity = capitalizeWords(city);
  const formattedCountry = capitalizeWords(country);

  try {
    const cityData = await aggregateCityData(formattedCity, formattedCountry);
    
    if (cityData.totalSubmissions === 0) {
      return { notFound: true };
    }

    return {
      props: {
        cityData,
        city: formattedCity,
        country: formattedCountry,
      },
    };
  } catch (error) {
    console.error('Error fetching city data:', error);
    return { notFound: true };
  }
};
