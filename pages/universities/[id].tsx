import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/ui/table";
import {
  ArrowLeft,
  MapPin,
  Globe,
  GraduationCap,
  Users,
  Building,
  Calendar,
  ExternalLink,
  Mail,
  Phone,
  Star,
  BookOpen,
  Award,
  ChevronRight,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  shortName: string;
  type: "PUBLIC" | "PRIVATE";
  country: string;
  city: string;
  website: string;
  description: string;
  founded: number;
  studentCount: number;
  internationalStudents: number;
  faculties: Array<{
    id: string;
    name: string;
    description: string;
    departmentCount: number;
    studentCount: number;
  }>;
  partnerships: Array<{
    id: string;
    partnerUniversity: {
      name: string;
      country: string;
      city: string;
    };
    faculty: string;
    isActive: boolean;
    studentExchanges: number;
  }>;
  contact: {
    address: string;
    phone: string;
    email: string;
    internationalOffice: {
      email: string;
      phone: string;
    };
  };
  statistics: {
    totalPartnerships: number;
    activeAgreements: number;
    outgoingStudents: number;
    incomingStudents: number;
  };
  campusImages: string[];
  rankings: Array<{
    name: string;
    rank: number;
    year: number;
  }>;
}

interface UniversityDetailPageProps {
  university: University | null;
}

export default function UniversityDetailPage({
  university,
}: UniversityDetailPageProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!university) {
    return (
      <>
        <Head>
          <title>University Not Found - Erasmus Journey Platform</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                University Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The university you're looking for doesn't exist or has been
                removed.
              </p>
              <Link href="/universities">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Universities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {university.name} - {university.city}, {university.country} | Erasmus
          Journey
        </title>
        <meta
          name="description"
          content={`Learn about ${university.name} in ${university.city}, ${university.country}. ${university.statistics.totalPartnerships} partnerships, ${university.faculties.length} faculties.`}
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
                Back to Universities
              </Button>
            </div>

            {/* Header Section */}
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* University Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            university.type === "PUBLIC"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {university.type}
                        </Badge>
                        <Badge variant="outline">
                          Founded {university.founded}
                        </Badge>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {university.name}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {university.city}, {university.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {university.studentCount.toLocaleString()} students
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    {university.description}
                  </p>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={`mailto:${university.contact.internationalOffice.email}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact International Office
                      </a>
                    </Button>
                    <Link href="/course-matching">
                      <Button variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Course Matching
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>University Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Students</span>
                        <span className="font-semibold">
                          {university.studentCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">International</span>
                        <span className="font-semibold">
                          {university.internationalStudents.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Faculties</span>
                        <span className="font-semibold">
                          {university.faculties.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Partnerships</span>
                        <span className="font-semibold">
                          {university.statistics.totalPartnerships}
                        </span>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-600 mb-2">
                          International Exchange
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Outgoing:</span>
                          <span>
                            {university.statistics.outgoingStudents}/year
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Incoming:</span>
                          <span>
                            {university.statistics.incomingStudents}/year
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="faculties">Faculties</TabsTrigger>
                <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Campus Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {university.campusImages.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-video overflow-hidden rounded-lg"
                        >
                          <img
                            src={image}
                            alt={`${university.name} campus ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Rankings */}
                {university.rankings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rankings & Recognition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {university.rankings.map((ranking, index) => (
                          <div
                            key={index}
                            className="text-center p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              #{ranking.rank}
                            </div>
                            <div className="text-sm font-medium">
                              {ranking.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ranking.year}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Facts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Academic Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span>{university.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Founded:</span>
                            <span>{university.founded}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Faculties:</span>
                            <span>{university.faculties.length}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">International</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Partner Universities:</span>
                            <span>
                              {university.statistics.totalPartnerships}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Agreements:</span>
                            <span>
                              {university.statistics.activeAgreements}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>International Students:</span>
                            <span>{university.internationalStudents}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faculties">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {university.faculties.map((faculty) => (
                    <Card key={faculty.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{faculty.name}</span>
                          <Badge variant="outline">
                            {faculty.studentCount} students
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {faculty.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{faculty.departmentCount} departments</span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/faculties/${faculty.id}`}>
                              <span>View Details</span>
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="partnerships">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Partnership Agreements ({university.partnerships.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partner University</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Faculty</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Exchanges/Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {university.partnerships.map((partnership) => (
                          <TableRow key={partnership.id}>
                            <TableCell className="font-medium">
                              {partnership.partnerUniversity.name}
                            </TableCell>
                            <TableCell>
                              {partnership.partnerUniversity.country}
                            </TableCell>
                            <TableCell>{partnership.faculty}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  partnership.isActive ? "default" : "secondary"
                                }
                              >
                                {partnership.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {partnership.studentExchanges}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="font-medium mb-1">Address</div>
                        <div className="text-gray-700">
                          {university.contact.address}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Phone</div>
                        <div className="text-gray-700">
                          <a
                            href={`tel:${university.contact.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {university.contact.phone}
                          </a>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Email</div>
                        <div className="text-gray-700">
                          <a
                            href={`mailto:${university.contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {university.contact.email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Website</div>
                        <div className="text-gray-700">
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {university.website}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>International Office</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="font-medium mb-1">Email</div>
                        <div className="text-gray-700">
                          <a
                            href={`mailto:${university.contact.internationalOffice.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {university.contact.internationalOffice.email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Phone</div>
                        <div className="text-gray-700">
                          <a
                            href={`tel:${university.contact.internationalOffice.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {university.contact.internationalOffice.phone}
                          </a>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>For Erasmus inquiries:</strong> Contact the
                          International Office directly for information about
                          exchange programs, application procedures, and student
                          support services.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA Section */}
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Interested in {university.name}?
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore course matching opportunities and connect with
                  students who have studied here.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/course-matching">
                    <Button size="lg">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Find Courses
                    </Button>
                  </Link>
                  <Link href="/student-stories">
                    <Button variant="outline" size="lg">
                      <Users className="h-5 w-5 mr-2" />
                      Read Student Stories
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

  // Sample university data (in production this would come from your database)
  const sampleUniversities: Record<string, University> = {
    ucy: {
      id: "ucy",
      name: "University of Cyprus",
      shortName: "UCY",
      type: "PUBLIC",
      country: "Cyprus",
      city: "Nicosia",
      website: "https://www.ucy.ac.cy",
      description:
        "The University of Cyprus is the oldest and largest university in Cyprus, and the major public university of the island. It was established in 1989 and opened its doors to students in September 1992. The University of Cyprus has earned a solid reputation for its high-quality research and teaching, and is internationally recognized for its academic excellence.",
      founded: 1989,
      studentCount: 7500,
      internationalStudents: 1200,
      faculties: [
        {
          id: "humanities",
          name: "Faculty of Humanities",
          description:
            "Offers programs in languages, literature, history, archaeology, and philosophy with a strong emphasis on research and cultural preservation.",
          departmentCount: 8,
          studentCount: 1200,
        },
        {
          id: "social-sciences",
          name: "Faculty of Social Sciences and Education",
          description:
            "Provides comprehensive education in social sciences, education, and human development with innovative teaching methods.",
          departmentCount: 6,
          studentCount: 1800,
        },
        {
          id: "engineering",
          name: "Faculty of Engineering",
          description:
            "Leading engineering education with state-of-the-art facilities and strong industry connections across multiple engineering disciplines.",
          departmentCount: 5,
          studentCount: 1500,
        },
        {
          id: "economics",
          name: "Faculty of Economics and Management",
          description:
            "Offers world-class business and economics education with strong links to the international business community.",
          departmentCount: 3,
          studentCount: 1000,
        },
      ],
      partnerships: [
        {
          id: "1",
          partnerUniversity: {
            name: "Technical University of Munich",
            country: "Germany",
            city: "Munich",
          },
          faculty: "Engineering",
          isActive: true,
          studentExchanges: 12,
        },
        {
          id: "2",
          partnerUniversity: {
            name: "Sorbonne University",
            country: "France",
            city: "Paris",
          },
          faculty: "Humanities",
          isActive: true,
          studentExchanges: 8,
        },
        {
          id: "3",
          partnerUniversity: {
            name: "Stockholm School of Economics",
            country: "Sweden",
            city: "Stockholm",
          },
          faculty: "Economics and Management",
          isActive: true,
          studentExchanges: 6,
        },
      ],
      contact: {
        address: "1 University Avenue, 2109 Aglantzia, Nicosia, Cyprus",
        phone: "+357 22894000",
        email: "info@ucy.ac.cy",
        internationalOffice: {
          email: "international@ucy.ac.cy",
          phone: "+357 22894180",
        },
      },
      statistics: {
        totalPartnerships: 150,
        activeAgreements: 145,
        outgoingStudents: 120,
        incomingStudents: 180,
      },
      campusImages: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop",
      ],
      rankings: [
        { name: "QS World University Rankings", rank: 501, year: 2024 },
        { name: "THE World University Rankings", rank: 401, year: 2024 },
      ],
    },
  };

  const university = sampleUniversities[id as string] || null;

  return {
    props: {
      university,
    },
  };
};
