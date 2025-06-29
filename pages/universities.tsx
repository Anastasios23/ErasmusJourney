import Head from "next/head";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";

const cyprusUniversities = [
  {
    id: "ucy",
    name: "University of Cyprus",
    shortName: "UCY",
    type: "PUBLIC",
    city: "Nicosia",
    faculties: 6,
    partnerships: 250,
  },
  {
    id: "euc",
    name: "European University Cyprus",
    shortName: "EUC",
    type: "PRIVATE",
    city: "Nicosia",
    faculties: 4,
    partnerships: 180,
  },
  {
    id: "uclan",
    name: "University of Central Lancashire Cyprus",
    shortName: "UCLan Cyprus",
    type: "PRIVATE",
    city: "Larnaca",
    faculties: 4,
    partnerships: 120,
  },
  {
    id: "frederick",
    name: "Frederick University",
    shortName: "Frederick",
    type: "PRIVATE",
    city: "Nicosia",
    faculties: 5,
    partnerships: 150,
  },
  {
    id: "unic",
    name: "University of Nicosia",
    shortName: "UNIC",
    type: "PRIVATE",
    city: "Nicosia",
    faculties: 7,
    partnerships: 200,
  },
];

export default function UniversitiesPage() {
  const totalPartnerships = cyprusUniversities.reduce(
    (sum, uni) => sum + uni.partnerships,
    0,
  );

  return (
    <>
      <Head>
        <title>Universities - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore Cyprus universities and their international partnerships for Erasmus exchanges."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EJ</span>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  Erasmus Journey
                </span>
              </Link>
              <nav className="flex space-x-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Home
                </Link>
                <Link
                  href="/universities"
                  className="text-blue-600 font-medium"
                >
                  Universities
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="pt-8 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                University Partnerships
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover partnership opportunities across{" "}
                {cyprusUniversities.length} universities with over{" "}
                {totalPartnerships} active agreements.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {cyprusUniversities.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cyprus Universities
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    50+
                  </div>
                  <div className="text-sm text-gray-600">
                    Partner Universities
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {totalPartnerships}
                  </div>
                  <div className="text-sm text-gray-600">
                    Active Partnerships
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {cyprusUniversities.reduce(
                      (sum, uni) => sum + uni.faculties,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Faculties</div>
                </CardContent>
              </Card>
            </div>

            {/* Cyprus Universities Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Cyprus Universities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cyprusUniversities.map((university) => (
                  <Card
                    key={university.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {university.name}
                        </CardTitle>
                        <Badge
                          variant={
                            university.type === "PUBLIC"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {university.type.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {university.city}, Cyprus
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Faculties:</span>
                          <span className="font-medium">
                            {university.faculties}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Partnerships:</span>
                          <span className="font-medium">
                            {university.partnerships}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full">View Details</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-8 pb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Explore Partnership Opportunities?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Use our matching tool to find the perfect university for
                    your Erasmus exchange.
                  </p>
                  <Link href="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
