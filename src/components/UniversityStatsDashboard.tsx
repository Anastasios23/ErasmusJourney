import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Building2,
  BookOpen,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getPartnerCountries,
} from "@/data/universityAgreements";
import { getDestinationStatistics } from "@/data/enhancedDestinations";

const UniversityStatsDashboard = () => {
  const stats = getDestinationStatistics();
  const partnerCountries = getPartnerCountries();

  // Calculate agreements per Cyprus university
  const universityStats = CYPRUS_UNIVERSITIES.map((uni) => ({
    ...uni,
    agreementCount: ALL_UNIVERSITY_AGREEMENTS.filter(
      (agreement) => agreement.homeUniversity === uni.code,
    ).length,
  })).sort((a, b) => b.agreementCount - a.agreementCount);

  // Get most popular partner countries
  const countryAgreements = partnerCountries.map((country) => ({
    country,
    agreementCount: ALL_UNIVERSITY_AGREEMENTS.filter(
      (agreement) => agreement.partnerCountry === country,
    ).length,
  }));

  const topCountries = countryAgreements
    .sort((a, b) => b.agreementCount - a.agreementCount)
    .slice(0, 6);

  // Get most popular departments
  const departmentCounts = new Map<string, number>();
  ALL_UNIVERSITY_AGREEMENTS.forEach((agreement) => {
    const current = departmentCounts.get(agreement.homeDepartment) || 0;
    departmentCounts.set(agreement.homeDepartment, current + 1);
  });

  const topDepartments = Array.from(departmentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Partnerships</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPartnerships}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Partner Countries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCountries}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Partner Cities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDestinations}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Academic Fields</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDepartments}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cyprus Universities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Cyprus Universities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {universityStats.map((university) => (
                <div
                  key={university.code}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {university.shortName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {university.departments.length} departments
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {university.agreementCount}
                    </div>
                    <div className="text-xs text-gray-600">partnerships</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Partner Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Top Partner Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCountries.map((country, index) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">
                      {country.country}
                    </span>
                  </div>
                  <Badge variant="secondary">{country.agreementCount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Academic Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
            Most Popular Academic Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {topDepartments.map(([department, count]) => (
              <div
                key={department}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border"
              >
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {department}
                </h4>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {count} partnerships
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversityStatsDashboard;
