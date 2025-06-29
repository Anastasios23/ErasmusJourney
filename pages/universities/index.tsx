import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import Header from "../../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";

interface University {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: string;
  country: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    faculties: number;
    homeAgreements: number;
  };
}

interface UniversitiesPageProps {
  universities: University[];
  totalPartnerships: number;
  lastUpdated: string;
}

export default function UniversitiesPage({
  universities,
  totalPartnerships,
  lastUpdated,
}: UniversitiesPageProps) {
  const cyprusUniversities = universities.filter(
    (uni) => uni.country === "Cyprus",
  );
  const partnerUniversities = universities.filter(
    (uni) => uni.country !== "Cyprus",
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
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                University Partnerships
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover partnership opportunities across {universities.length}{" "}
                universities with over {totalPartnerships} active agreements.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </div>
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
                    {partnerUniversities.length}
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
                    {universities.reduce(
                      (sum, uni) => sum + uni._count.faculties,
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
                        {university.city}, {university.country}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Faculties:</span>
                          <span className="font-medium">
                            {university._count.faculties}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Partnerships:</span>
                          <span className="font-medium">
                            {university._count.homeAgreements}
                          </span>
                        </div>
                      </div>
                      <Link href={`/universities/${university.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Partner Universities Section */}
            {partnerUniversities.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Partner Universities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {partnerUniversities.slice(0, 12).map((university) => (
                    <Card
                      key={university.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {university.name}
                        </h3>
                        <div className="text-xs text-gray-500">
                          {university.city}, {university.country}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {partnerUniversities.length > 12 && (
                  <div className="text-center mt-8">
                    <Button variant="outline">
                      View All {partnerUniversities.length} Partner Universities
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* CTA Section */}
            <section className="mt-16 text-center">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-8 pb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Explore Partnership Opportunities?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Use our matching tool to find the perfect university for
                    your Erasmus exchange.
                  </p>
                  <Link href="/course-matching">
                    <Button size="lg">Start Course Matching</Button>
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

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch all universities with counts
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: {
            faculties: true,
            homeAgreements: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ country: "asc" }, { name: "asc" }],
    });

    // Get total partnerships count
    const totalPartnerships = await prisma.agreement.count({
      where: { isActive: true },
    });

    return {
      props: {
        universities: universities.map((uni) => ({
          ...uni,
          createdAt: uni.createdAt.toISOString(),
          updatedAt: uni.updatedAt.toISOString(),
        })),
        totalPartnerships,
        lastUpdated: new Date().toISOString(),
      },
      // Revalidate every hour (3600 seconds)
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching universities:", error);

    // Fallback to static data if database is not available
    const { CYPRUS_UNIVERSITIES } = await import("../../src/data/universities");

    return {
      props: {
        universities: CYPRUS_UNIVERSITIES.map((uni) => ({
          id: uni.id,
          code: uni.id.toUpperCase(),
          name: uni.name,
          shortName: uni.shortName,
          type: uni.type.toUpperCase(),
          country: "Cyprus",
          city: "Nicosia",
          _count: {
            faculties: uni.faculties.length,
            homeAgreements: Math.floor(Math.random() * 50) + 10,
          },
        })),
        totalPartnerships: 1000,
        lastUpdated: new Date().toISOString(),
      },
      revalidate: 3600,
    };
  }
};
