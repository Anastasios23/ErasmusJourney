import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import AgreementDetails from "../components/AgreementDetails";
import UniversitySubmissions from "../components/UniversitySubmissions";
import {
  Search,
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  Filter,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";

// Function to generate exchange history from actual agreement data
const generateExchangeHistoryFromAgreements = () => {
  const sampleStudentNames = [
    "Maria Constantinou",
    "Andreas Georgiou",
    "Elena Pavlou",
    "Dimitris Christou",
    "Sofia Ioannou",
    "Georgios Nicolaou",
    "Christina Andreou",
    "Michalis Petrou",
    "Alexia Demetriou",
    "Panayiotis Vasiliou",
    "Despina Christofi",
    "Stavros Louca",
  ];

  const academicYears = ["2022-2023", "2023-2024", "2024-2025"];
  const semesters = ["Fall 2022", "Spring 2023", "Fall 2023", "Spring 2024"];

  // Sample courses for different departments
  const departmentCourses = {
    "Computer Science": [
      {
        code: "CS301",
        name: "Database Systems",
        credits: 6,
        cyprusCode: "CS350",
      },
      {
        code: "CS425",
        name: "Machine Learning",
        credits: 6,
        cyprusCode: "CS450",
      },
      {
        code: "CS380",
        name: "Software Engineering",
        credits: 8,
        cyprusCode: "CS370",
      },
    ],
    "Business Administration": [
      {
        code: "BUS301",
        name: "International Marketing",
        credits: 6,
        cyprusCode: "BUS380",
      },
      {
        code: "FIN350",
        name: "Corporate Finance",
        credits: 6,
        cyprusCode: "FIN350",
      },
      {
        code: "MGT450",
        name: "Strategic Management",
        credits: 6,
        cyprusCode: "BUS450",
      },
    ],
    Architecture: [
      {
        code: "ARC350",
        name: "Architectural Design",
        credits: 10,
        cyprusCode: "ARC350",
      },
      {
        code: "ARC320",
        name: "Urban Planning",
        credits: 5,
        cyprusCode: "ARC320",
      },
      {
        code: "ARC310",
        name: "Building Technology",
        credits: 5,
        cyprusCode: "ARC310",
      },
    ],
  };

  const generated = [];

  // Take a sample of agreements to generate realistic exchange history
  const sampleAgreements = ALL_UNIVERSITY_AGREEMENTS.filter(
    (agreement) => agreement.partnerCountry && agreement.partnerCity,
  ).slice(0, 20); // Take first 20 for demo

  sampleAgreements.forEach((agreement, index) => {
    if (index < sampleStudentNames.length) {
      const studentName = sampleStudentNames[index];
      const cyprusUni = CYPRUS_UNIVERSITIES.find(
        (uni) => uni.code === agreement.homeUniversity,
      );
      const department = agreement.homeDepartment.trim();
      const courses =
        departmentCourses[department] || departmentCourses["Computer Science"];

      generated.push({
        id: `generated-${index}`,
        student: {
          name: studentName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName.replace(" ", "")}`,
          cyprusUniversity: cyprusUni
            ? cyprusUni.name
            : agreement.homeUniversity,
          department: department,
          year: academicYears[index % academicYears.length],
        },
        exchange: {
          university: agreement.partnerUniversity,
          country: agreement.partnerCountry,
          city: agreement.partnerCity,
          duration: index % 2 === 0 ? "1 Semester" : "2 Semesters",
          period: semesters[index % semesters.length],
        },
        courses: courses.map((course, courseIndex) => ({
          ...course,
          grade: ["A", "A-", "B+", "A"][(index + courseIndex) % 4],
          cyprusEquivalent: `${course.cyprusCode} - ${course.name}`,
        })),
        rating: parseFloat((4.0 + (index % 10) * 0.1).toFixed(1)),
        review:
          "Great experience! The courses were excellent and the university facilities were world-class.",
      });
    }
  });

  return generated;
};

// Generate exchange history from actual agreements
const exchangeHistory = generateExchangeHistoryFromAgreements();

// Original sample data for demonstration - keeping some for variety
const originalSampleData = [
  {
    id: "1",
    student: {
      name: "Maria Constantinou",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
      cyprusUniversity: "University of Cyprus (UCY)",
      department: "Computer Science",
      year: "2023-2024",
    },
    exchange: {
      university: "Technical University of Munich",
      country: "Germany",
      city: "Munich",
      duration: "1 Semester",
      period: "Fall 2023",
    },
    courses: [
      {
        code: "IN2026",
        name: "Database Systems",
        credits: 6,
        grade: "A",
        cyprusEquivalent: "CS350 - Database Management Systems",
      },
      {
        code: "IN2028",
        name: "Software Engineering",
        credits: 8,
        grade: "A-",
        cyprusEquivalent: "CS370 - Software Engineering",
      },
      {
        code: "IN2322",
        name: "Machine Learning",
        credits: 6,
        grade: "B+",
        cyprusEquivalent: "CS450 - Artificial Intelligence",
      },
    ],
    rating: 4.8,
    review:
      "Amazing experience! The courses were very practical and the university facilities are world-class.",
  },
  {
    id: "2",
    student: {
      name: "Andreas Georgiou",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas",
      cyprusUniversity: "Cyprus University of Technology (CUT)",
      department: "Mechanical Engineering",
      year: "2022-2023",
    },
    exchange: {
      university: "KTH Royal Institute of Technology",
      country: "Sweden",
      city: "Stockholm",
      duration: "2 Semesters",
      period: "Full Year 2022-23",
    },
    courses: [
      {
        code: "ME2063",
        name: "Thermodynamics",
        credits: 7.5,
        grade: "A",
        cyprusEquivalent: "ME301 - Engineering Thermodynamics",
      },
      {
        code: "ME2064",
        name: "Fluid Mechanics",
        credits: 7.5,
        grade: "A-",
        cyprusEquivalent: "ME302 - Fluid Mechanics",
      },
      {
        code: "ME2090",
        name: "Sustainable Energy Systems",
        credits: 7.5,
        grade: "A",
        cyprusEquivalent: "ME450 - Renewable Energy Systems",
      },
    ],
    rating: 4.9,
    review:
      "The engineering programs in Sweden are exceptional. Great focus on sustainability and innovation.",
  },
  {
    id: "3",
    student: {
      name: "Elena Pavlou",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
      cyprusUniversity: "University of Nicosia (UNIC)",
      department: "Business Administration",
      year: "2023-2024",
    },
    exchange: {
      university: "Bocconi University",
      country: "Italy",
      city: "Milan",
      duration: "1 Semester",
      period: "Spring 2024",
    },
    courses: [
      {
        code: "30001",
        name: "International Marketing",
        credits: 6,
        grade: "A",
        cyprusEquivalent: "BUS380 - Global Marketing",
      },
      {
        code: "30015",
        name: "Corporate Finance",
        credits: 6,
        grade: "A-",
        cyprusEquivalent: "FIN350 - Corporate Financial Management",
      },
      {
        code: "30025",
        name: "Strategic Management",
        credits: 6,
        grade: "B+",
        cyprusEquivalent: "BUS450 - Strategic Management",
      },
    ],
    rating: 4.7,
    review:
      "Milan is the perfect city for business studies. The networking opportunities were incredible.",
  },
  {
    id: "4",
    student: {
      name: "Dimitris Christou",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dimitris",
      cyprusUniversity: "Frederick University",
      department: "Architecture",
      year: "2023-2024",
    },
    exchange: {
      university: "Delft University of Technology",
      country: "Netherlands",
      city: "Delft",
      duration: "1 Semester",
      period: "Fall 2023",
    },
    courses: [
      {
        code: "AR2A011",
        name: "Architectural Design",
        credits: 10,
        grade: "A",
        cyprusEquivalent: "ARC350 - Advanced Architectural Design",
      },
      {
        code: "AR2U050",
        name: "Urban Planning",
        credits: 5,
        grade: "A-",
        cyprusEquivalent: "ARC320 - Urban Design Principles",
      },
      {
        code: "AR2B020",
        name: "Building Technology",
        credits: 5,
        grade: "A",
        cyprusEquivalent: "ARC310 - Construction Technology",
      },
    ],
    rating: 4.6,
    review:
      "The Dutch approach to architecture and sustainability is inspiring. Great learning experience.",
  },
];

const cyprusUniversities = [...CYPRUS_UNIVERSITIES.map((uni) => uni.name)];

// Get all unique countries from actual agreements
const allCountries = [
  ...new Set(
    ALL_UNIVERSITY_AGREEMENTS.map((agreement) => agreement.partnerCountry),
  ),
].sort();
const countries = ["All Countries", ...allCountries];

// Get all unique departments from all Cyprus universities
const allDepartments = CYPRUS_UNIVERSITIES.reduce((deps, uni) => {
  return [...deps, ...uni.departments];
}, [] as string[]);
const uniqueDepartments = [...new Set(allDepartments)].sort();
const departments = ["All Departments", ...uniqueDepartments];

export default function UniversityExchanges() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCyprusUni, setSelectedCyprusUni] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedHostUniversity, setSelectedHostUniversity] = useState(
    "All Host Universities",
  );
  const [
    selectedUniversityForSubmissions,
    setSelectedUniversityForSubmissions,
  ] = useState<string | null>(null);

  // Ensure component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get available destinations based on selected filters
  const availableDestinations = useMemo(() => {
    if (!selectedCyprusUni || selectedDepartment === "All Departments") {
      return [];
    }

    const cyprusUni = CYPRUS_UNIVERSITIES.find(
      (uni) => uni.name === selectedCyprusUni,
    );
    if (!cyprusUni) return [];

    let agreements;
    if (cyprusUni.code === "UNIC" && selectedLevel !== "All Levels") {
      const level = selectedLevel.toLowerCase() as
        | "bachelor"
        | "master"
        | "phd";
      agreements = getAgreementsByDepartmentAndLevel(
        cyprusUni.code,
        selectedDepartment,
        level,
      );
    } else {
      agreements = getAgreementsByDepartment(
        cyprusUni.code,
        selectedDepartment,
      );
    }

    return agreements.map((agreement) => ({
      university: agreement.partnerUniversity,
      city: agreement.partnerCity,
      country: agreement.partnerCountry,
      level: agreement.academicLevel || "all",
    }));
  }, [selectedCyprusUni, selectedDepartment, selectedLevel]);

  // Get available host universities based on selected filters
  const availableHostUniversities = useMemo(() => {
    if (!selectedCyprusUni || selectedDepartment === "All Departments") {
      return [];
    }

    const cyprusUni = CYPRUS_UNIVERSITIES.find(
      (uni) => uni.name === selectedCyprusUni,
    );
    if (!cyprusUni) return [];

    let agreements;
    if (cyprusUni.code === "UNIC" && selectedLevel !== "All Levels") {
      const level = selectedLevel.toLowerCase() as
        | "bachelor"
        | "master"
        | "phd";
      agreements = getAgreementsByDepartmentAndLevel(
        cyprusUni.code,
        selectedDepartment,
        level,
      );
    } else {
      agreements = getAgreementsByDepartment(
        cyprusUni.code,
        selectedDepartment,
      );
    }

    // Get unique host universities from agreements
    const hostUniversities = [
      ...new Set(agreements.map((agreement) => agreement.partnerUniversity)),
    ];
    return hostUniversities.sort();
  }, [selectedCyprusUni, selectedDepartment, selectedLevel]);

  // Filter the exchange history based on search criteria and available agreements
  const filteredHistory = useMemo(() => {
    return exchangeHistory.filter((exchange) => {
      const matchesSearch =
        searchTerm === "" ||
        exchange.student.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.exchange.university
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.exchange.city
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.courses.some(
          (course) =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.cyprusEquivalent
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );

      const matchesCyprusUni =
        !selectedCyprusUni ||
        exchange.student.cyprusUniversity === selectedCyprusUni;

      const matchesCountry =
        selectedCountry === "All Countries" ||
        exchange.exchange.country === selectedCountry;

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        exchange.student.department === selectedDepartment;

      const matchesHostUniversity =
        selectedHostUniversity === "All Host Universities" ||
        exchange.exchange.university === selectedHostUniversity;

      // Check if this exchange destination is available based on actual agreements
      const matchesAgreements =
        availableDestinations.length === 0 ||
        availableDestinations.some(
          (dest) =>
            dest.university === exchange.exchange.university &&
            dest.city === exchange.exchange.city &&
            dest.country === exchange.exchange.country,
        );

      return (
        matchesSearch &&
        matchesCyprusUni &&
        matchesCountry &&
        matchesDepartment &&
        matchesHostUniversity &&
        matchesAgreements
      );
    });
  }, [
    searchTerm,
    selectedCyprusUni,
    selectedCountry,
    selectedDepartment,
    selectedHostUniversity,
    availableDestinations,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const totalStudents = exchangeHistory.length;
    const uniqueUniversities = new Set(
      exchangeHistory.map((e) => e.exchange.university),
    ).size;
    const uniqueCountries = new Set(
      exchangeHistory.map((e) => e.exchange.country),
    ).size;
    const avgRating = (
      exchangeHistory.reduce((sum, e) => sum + e.rating, 0) / totalStudents
    ).toFixed(1);

    return { totalStudents, uniqueUniversities, uniqueCountries, avgRating };
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <>
        <Head>
          <title>University Exchange History - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Explore the exchange history of Cyprus students and the courses they studied abroad"
          />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  University Exchange History
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Loading exchange history...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>University Exchange History - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore the exchange history of Cyprus students and the courses they studied abroad"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                University Exchange History
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover where Cyprus students have studied abroad, what courses
                they took, and how their experiences can guide your academic
                journey.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Students
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalStudents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <GraduationCap className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Universities
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.uniqueUniversities}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Countries
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.uniqueCountries}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg Rating
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avgRating}/5
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Agreements Info */}
            {availableDestinations.length > 0 && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {availableDestinations.length} Available Exchange
                      Destinations
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Based on official agreements for {selectedDepartment} at{" "}
                    {selectedCyprusUni}
                    {selectedLevel !== "All Levels" &&
                      ` (${selectedLevel} level)`}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students, universities, courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={selectedCyprusUni}
                    onValueChange={setSelectedCyprusUni}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="👆 Select Your University First" />
                    </SelectTrigger>
                    <SelectContent>
                      {cyprusUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Destination Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedHostUniversity}
                    onValueChange={setSelectedHostUniversity}
                    disabled={availableHostUniversities.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Host Universities">
                        All Host Universities
                      </SelectItem>
                      {availableHostUniversities.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Level of Study" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCyprusUni("");
                      setSelectedCountry("All Countries");
                      setSelectedHostUniversity("All Host Universities");
                      setSelectedDepartment("All Departments");
                      setSelectedLevel("All Levels");
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exchange History List */}
            <div className="space-y-6">
              {!selectedCyprusUni ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select Your Home University
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Please select your Cyprus university above to view
                      relevant exchange records and course mappings.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 This helps us show you the most relevant exchange
                        opportunities and course equivalencies for your academic
                        program.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No exchange records found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or filters.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredHistory.map((exchange) => (
                  <Card
                    key={exchange.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Student Info */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={exchange.student.avatar}
                                alt={exchange.student.name}
                              />
                              <AvatarFallback>
                                {exchange.student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {exchange.student.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {exchange.student.department}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">
                                {exchange.student.cyprusUniversity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">
                                {exchange.student.year}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Exchange Info */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Exchange Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-gray-600">
                                  {exchange.exchange.university}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {exchange.exchange.city},{" "}
                                {exchange.exchange.country}
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="secondary">
                                  {exchange.exchange.duration}
                                </Badge>
                                <Badge variant="outline">
                                  {exchange.exchange.period}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={
                                      i < Math.floor(exchange.rating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {exchange.rating}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 italic">
                              "{exchange.review}"
                            </p>
                          </div>
                        </div>

                        {/* Courses */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            Courses Taken
                          </h4>
                          <div className="space-y-3">
                            {exchange.courses.map((course, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {course.code} - {course.name}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      {course.credits} ECTS • Grade:{" "}
                                      {course.grade}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <p className="text-xs text-blue-600">
                                    Cyprus Equivalent: {course.cyprusEquivalent}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Call to Action */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Start Your Exchange?
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Join hundreds of Cyprus students who have successfully
                    completed their Erasmus journey. Start your application
                    today!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/basic-information">
                      <Button size="lg">
                        Start Application
                        <ExternalLink className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/destinations">
                      <Button variant="outline" size="lg">
                        Browse Destinations
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
