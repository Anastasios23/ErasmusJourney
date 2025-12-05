import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Input } from "../../src/components/ui/input";
import CourseMatchingInsights from "../../src/components/CourseMatchingInsights";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  Star,
  Globe,
  Mail,
  ExternalLink,
  CheckCircle,
  Calendar,
  Building,
  Search,
  User,
  MessageCircle,
} from "lucide-react";

interface StudentExperience {
  studentName: string;
  department: string;
  studyLevel: string;
  submissionId: string;
  semester: string;
  year: string;
  rating?: number;
  courses?: string[];
  testimonial?: string;
  courseStats?: {
    totalCourses: number;
    averageDifficulty?: number;
    averageECTS?: number;
  };
  detailedCourses?: Array<{
    name: string;
    code?: string;
    ects?: number;
    difficulty?: string | number;
    grade?: string;
    workload?: string;
    examTypes?: string[];
    recommendation?: string;
    homeCourseName?: string;
    homeCourseCode?: string;
    homeCourseCredits?: number;
    finalExam?: string;
    oralExam?: string;
    writtenExam?: string;
    projectExam?: string;
    continuousAssessment?: string;
  }>;
  courseMatchingDifficult?: string;
  courseMatchingChallenges?: string;
  recommendCourses?: string;
  recommendationReason?: string;
  hostCourseCount?: number;
  homeCourseCount?: number;
}

interface DepartmentData {
  name: string;
  studentsCount: number;
  students: StudentExperience[];
  averageRating: number;
  studyLevels: string[];
  commonCourses: string[];
  courseMatchingStats?: {
    totalStudentsWithCourseData: number;
    averageDifficulty?: number;
    averageECTS?: number;
    difficultyPercentage?: number;
    commonExamTypes?: string[];
  };
}

interface UniversityDetail {
  id: string;
  universityName: string;
  location: string;
  country: string;
  studentsCount: number;
  departments: DepartmentData[];
  studyLevels: string[];
  cyprusUniversities: string[];
  courseMatches: number;
  image: string;
  description: string;
  highlights: string[];
  averageRating: number;
  academicStrength: string;
  researchFocus: string[];
  languageOfInstruction: string[];
  semesterOptions: string[];
  applicationDeadline: string;
  establishedYear: number;
  worldRanking?: number;
  erasmusCode: string;
  contactEmail: string;
  website: string;
}

export default function UniversityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchDepartment, setSearchDepartment] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentExperience | null>(null);

  useEffect(() => {
    if (id) {
      fetchUniversityDetail();
    }
  }, [id]);

  const fetchUniversityDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/university-exchanges/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUniversity(data);
      } else {
        console.error("University not found");
        router.push("/university-exchanges");
      }
    } catch (error) {
      console.error("Error fetching university details:", error);
      router.push("/university-exchanges");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments =
    university?.departments?.filter((dept) =>
      dept.name.toLowerCase().includes(searchDepartment.toLowerCase()),
    ) || [];

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading University Details - Erasmus Journey</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!university) {
    return (
      <>
        <Head>
          <title>University Not Found - Erasmus Journey</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                University Not Found
              </h1>
              <Link href="/university-exchanges">
                <Button>Back to Universities</Button>
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
        <title>{university.universityName} - University Details</title>
        <meta
          name="description"
          content={`Detailed information about ${university.universityName} with department-specific student experiences and course information.`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/university-exchanges">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Universities
                </Button>
              </Link>
            </div>

            {/* University Header */}
            <div className="relative mb-8">
              <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-4xl font-bold mb-2">
                        {university.universityName}
                      </h1>
                      <div className="flex items-center gap-4 text-lg">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-1" />
                          {university.location}, {university.country}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-1" />
                          {university.studentsCount} Cyprus students
                        </div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 mr-1" />
                          {university.averageRating}/5
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-white bg-opacity-90 text-black"
                      >
                        {university.academicStrength}
                      </Badge>
                      <p className="text-sm">
                        Est. {university.establishedYear}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {university.departments?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Departments</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {university.courseMatches}
                  </p>
                  <p className="text-sm text-gray-600">Course Data Available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {university.languageOfInstruction.join(", ")}
                  </p>
                  <p className="text-sm text-gray-600">Languages</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {university.applicationDeadline}
                  </p>
                  <p className="text-sm text-gray-600">Application Deadline</p>
                </CardContent>
              </Card>
            </div>

            {/* Course Matching Insights */}
            <div className="mb-8">
              <CourseMatchingInsights
                city={university.location}
                country={university.country}
                university={university.universityName}
                className="mb-8"
              />
            </div>

            <Tabs defaultValue="departments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="practical">Practical Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              {/* Departments Tab */}
              <TabsContent value="departments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Departments with Cyprus Student Experiences
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search departments..."
                        value={searchDepartment}
                        onChange={(e) => setSearchDepartment(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {filteredDepartments.map((department, index) => (
                        <Card
                          key={index}
                          className="border-l-4 border-blue-500"
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl">
                                  {department.name}
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {department.studentsCount} students
                                  </span>
                                  <span className="flex items-center">
                                    <Star className="h-4 w-4 mr-1" />
                                    {department.averageRating}/5 avg rating
                                  </span>
                                  <span className="flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-1" />
                                    {department.studyLevels.join(", ")}
                                  </span>
                                  {department.courseMatchingStats
                                    ?.totalStudentsWithCourseData > 0 && (
                                    <span className="flex items-center">
                                      <BookOpen className="h-4 w-4 mr-1" />
                                      {
                                        department.courseMatchingStats
                                          .totalStudentsWithCourseData
                                      }{" "}
                                      course data
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Course Matching Statistics */}
                              {department.courseMatchingStats
                                ?.totalStudentsWithCourseData > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-3">
                                    Course Matching Insights
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {department.courseMatchingStats
                                      .averageDifficulty > 0 && (
                                      <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-700">
                                          {
                                            department.courseMatchingStats
                                              .averageDifficulty
                                          }
                                          /5
                                        </div>
                                        <div className="text-blue-600">
                                          Avg Difficulty
                                        </div>
                                      </div>
                                    )}
                                    {department.courseMatchingStats
                                      .averageECTS > 0 && (
                                      <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-700">
                                          {
                                            department.courseMatchingStats
                                              .averageECTS
                                          }
                                        </div>
                                        <div className="text-blue-600">
                                          Avg ECTS
                                        </div>
                                      </div>
                                    )}
                                    {department.courseMatchingStats
                                      .difficultyPercentage > 0 && (
                                      <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-700">
                                          {
                                            department.courseMatchingStats
                                              .difficultyPercentage
                                          }
                                          %
                                        </div>
                                        <div className="text-blue-600">
                                          Found Difficult
                                        </div>
                                      </div>
                                    )}
                                    <div className="text-center">
                                      <div className="text-lg font-semibold text-blue-700">
                                        {
                                          department.courseMatchingStats
                                            .totalStudentsWithCourseData
                                        }
                                      </div>
                                      <div className="text-blue-600">
                                        Course Reports
                                      </div>
                                    </div>
                                  </div>

                                  {department.courseMatchingStats
                                    .commonExamTypes.length > 0 && (
                                    <div className="mt-3">
                                      <h5 className="text-sm font-medium text-blue-900 mb-2">
                                        Common Exam Types:
                                      </h5>
                                      <div className="flex flex-wrap gap-1">
                                        {department.courseMatchingStats.commonExamTypes
                                          .slice(0, 4)
                                          .map((type, i) => (
                                            <Badge
                                              key={i}
                                              variant="secondary"
                                              className="text-xs bg-blue-100 text-blue-800"
                                            >
                                              {type}
                                            </Badge>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Common Courses */}
                              {department.commonCourses.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Popular Courses:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {department.commonCourses
                                      .slice(0, 5)
                                      .map((course, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {course}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Student Experiences */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Student Experiences:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {department.students
                                    .slice(0, 6)
                                    .map((student, i) => (
                                      <div
                                        key={i}
                                        className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() =>
                                          setSelectedStudent(student)
                                        }
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              {student.studentName ||
                                                "Anonymous Student"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              {student.studyLevel
                                                .charAt(0)
                                                .toUpperCase() +
                                                student.studyLevel.slice(
                                                  1,
                                                )}{" "}
                                              • {student.semester}{" "}
                                              {student.year}
                                            </p>
                                            {student.rating && (
                                              <div className="flex items-center mt-1">
                                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                                <span className="text-xs text-gray-600">
                                                  {student.rating}/5
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <MessageCircle className="h-4 w-4 text-gray-400" />
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                {department.students.length > 6 && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    +{department.students.length - 6} more
                                    students
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>University Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Description
                      </h4>
                      <p className="text-gray-700">{university.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Highlights
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {university.highlights?.map((highlight, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Research Focus Areas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {university.researchFocus?.map((focus, index) => (
                          <Badge key={index} variant="outline">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Practical Info Tab */}
              <TabsContent value="practical" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Study Levels
                        </h4>
                        <p className="text-gray-700">
                          {university.studyLevels?.join(", ")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Language of Instruction
                        </h4>
                        <p className="text-gray-700">
                          {university.languageOfInstruction?.join(", ")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Semester Options
                        </h4>
                        <p className="text-gray-700">
                          {university.semesterOptions?.join(", ")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Erasmus Code
                        </h4>
                        <p className="text-gray-700 font-mono">
                          {university.erasmusCode}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>University Facts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Established
                        </h4>
                        <p className="text-gray-700">
                          {university.establishedYear}
                        </p>
                      </div>
                      {university.worldRanking && (
                        <div>
                          <h4 className="font-medium text-gray-900">
                            World Ranking
                          </h4>
                          <p className="text-gray-700">
                            #{university.worldRanking}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Academic Strength
                        </h4>
                        <Badge variant="outline">
                          {university.academicStrength}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Application Deadline
                        </h4>
                        <p className="text-gray-700">
                          {university.applicationDeadline}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          University Contact
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`mailto:${university.contactEmail}`}
                              className="text-blue-600 hover:underline"
                            >
                              {university.contactEmail}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={university.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Official Website
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Partner Universities in Cyprus
                        </h4>
                        <div className="space-y-1">
                          {university.cyprusUniversities?.map((uni, index) => (
                            <p key={index} className="text-gray-700">
                              {uni}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex gap-4">
                        <Button className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          Contact University
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Website
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {selectedStudent.studentName || "Anonymous Student"}
                  </CardTitle>
                  <p className="text-gray-600">
                    {selectedStudent.department} •{" "}
                    {selectedStudent.studyLevel.charAt(0).toUpperCase() +
                      selectedStudent.studyLevel.slice(1)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Semester:</span>
                  <p className="text-gray-600">
                    {selectedStudent.semester} {selectedStudent.year}
                  </p>
                </div>
                {selectedStudent.rating && (
                  <div>
                    <span className="font-medium">Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{selectedStudent.rating}/5</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Matching Summary */}
              {selectedStudent.courseStats?.totalCourses > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">
                    Course Matching Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-700">
                        {selectedStudent.courseStats.totalCourses}
                      </div>
                      <div className="text-blue-600">Courses Taken</div>
                    </div>
                    {selectedStudent.hostCourseCount && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700">
                          {selectedStudent.hostCourseCount}
                        </div>
                        <div className="text-blue-600">Host Courses</div>
                      </div>
                    )}
                    {selectedStudent.homeCourseCount && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700">
                          {selectedStudent.homeCourseCount}
                        </div>
                        <div className="text-blue-600">Cyprus Mappings</div>
                      </div>
                    )}
                    {selectedStudent.courseStats.averageDifficulty > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700">
                          {selectedStudent.courseStats.averageDifficulty.toFixed(
                            1,
                          )}
                          /5
                        </div>
                        <div className="text-blue-600">Avg Difficulty</div>
                      </div>
                    )}
                    {selectedStudent.courseStats.averageECTS > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700">
                          {selectedStudent.courseStats.averageECTS.toFixed(1)}
                        </div>
                        <div className="text-blue-600">Avg ECTS</div>
                      </div>
                    )}
                    {selectedStudent.courseMatchingDifficult && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700">
                          {selectedStudent.courseMatchingDifficult === "yes"
                            ? "❌"
                            : "✅"}
                        </div>
                        <div className="text-blue-600">Found Difficult</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Course Information with Mapping */}
              {selectedStudent.detailedCourses &&
                selectedStudent.detailedCourses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Course Mapping & Details:
                    </h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {selectedStudent.detailedCourses.map((course, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 p-4 rounded-md border border-gray-200"
                        >
                          {/* Host University Course */}
                          <div className="mb-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900 text-sm">
                                  🌍 Host University Course
                                </h5>
                                <p className="font-semibold text-blue-900">
                                  {course.name}
                                  {course.code && (
                                    <span className="text-gray-500 ml-2 font-normal">
                                      ({course.code})
                                    </span>
                                  )}
                                </p>
                              </div>
                              {course.ects && (
                                <Badge variant="outline" className="text-xs">
                                  {course.ects} ECTS
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Course Mapping Arrow */}
                          {course.homeCourseName && (
                            <>
                              <div className="flex items-center justify-center mb-3">
                                <div className="border-t border-dashed border-gray-300 flex-1"></div>
                                <span className="mx-3 text-gray-500 text-xs bg-white px-2">
                                  ↓ Mapped to ↓
                                </span>
                                <div className="border-t border-dashed border-gray-300 flex-1"></div>
                              </div>

                              {/* Home University Course */}
                              <div className="mb-3 bg-green-50 p-3 rounded border border-green-200">
                                <h5 className="font-medium text-gray-900 text-sm mb-1">
                                  🇨🇾 Cyprus University Course
                                </h5>
                                <p className="font-semibold text-green-900">
                                  {course.homeCourseName}
                                  {course.homeCourseCode && (
                                    <span className="text-gray-600 ml-2 font-normal">
                                      ({course.homeCourseCode})
                                    </span>
                                  )}
                                </p>
                                {course.homeCourseCredits && (
                                  <p className="text-xs text-green-700 mt-1">
                                    {course.homeCourseCredits} ECTS Credits
                                  </p>
                                )}
                              </div>
                            </>
                          )}

                          {/* Course Details */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {course.difficulty && (
                                <Badge variant="secondary" className="text-xs">
                                  Difficulty: {course.difficulty}
                                </Badge>
                              )}
                              {course.grade && (
                                <Badge variant="secondary" className="text-xs">
                                  Grade: {course.grade}
                                </Badge>
                              )}
                              {course.workload && (
                                <Badge variant="secondary" className="text-xs">
                                  {course.workload}
                                </Badge>
                              )}
                            </div>

                            {/* Exam Types Detailed */}
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                              <h6 className="text-xs font-medium text-yellow-900 mb-2">
                                📝 Exam Information:
                              </h6>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {course.finalExam && (
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                                    <span>Final Exam: {course.finalExam}</span>
                                  </div>
                                )}
                                {course.oralExam && (
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                    <span>Oral Exam: {course.oralExam}</span>
                                  </div>
                                )}
                                {course.writtenExam && (
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span>
                                      Written Exam: {course.writtenExam}
                                    </span>
                                  </div>
                                )}
                                {course.projectExam && (
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                    <span>Project: {course.projectExam}</span>
                                  </div>
                                )}
                                {course.continuousAssessment && (
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                                    <span>
                                      Continuous Assessment:{" "}
                                      {course.continuousAssessment}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Fallback to examTypes array if individual exam fields not available */}
                              {course.examTypes &&
                                course.examTypes.length > 0 &&
                                !course.finalExam &&
                                !course.oralExam &&
                                !course.writtenExam && (
                                  <div className="mt-2">
                                    <span className="text-yellow-800 text-xs">
                                      Exam types: {course.examTypes.join(", ")}
                                    </span>
                                  </div>
                                )}
                            </div>

                            {course.recommendation && (
                              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <h6 className="text-xs font-medium text-blue-900 mb-1">
                                  💬 Student Recommendation:
                                </h6>
                                <p className="text-xs text-blue-800 italic">
                                  "{course.recommendation}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Course Matching Challenges */}
              {selectedStudent.courseMatchingChallenges && (
                <div>
                  <h4 className="font-medium mb-2">
                    Course Matching Challenges:
                  </h4>
                  <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded-md">
                    {selectedStudent.courseMatchingChallenges}
                  </p>
                </div>
              )}

              {/* Basic Courses (fallback) */}
              {selectedStudent.courses &&
                selectedStudent.courses.length > 0 &&
                (!selectedStudent.detailedCourses ||
                  selectedStudent.detailedCourses.length === 0) && (
                  <div>
                    <h4 className="font-medium mb-2">Courses Taken:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.courses.map((course, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Course Recommendations */}
              {selectedStudent.recommendCourses &&
                selectedStudent.recommendationReason && (
                  <div>
                    <h4 className="font-medium mb-2">
                      Student Recommendation:
                    </h4>
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-green-900 mb-1">
                        Would recommend:{" "}
                        {selectedStudent.recommendCourses === "yes"
                          ? "✅ Yes"
                          : "❌ No"}
                      </p>
                      <p className="text-sm text-green-800">
                        {selectedStudent.recommendationReason}
                      </p>
                    </div>
                  </div>
                )}

              {selectedStudent.testimonial && (
                <div>
                  <h4 className="font-medium mb-2">Student Experience:</h4>
                  <p className="text-gray-700 text-sm italic">
                    "{selectedStudent.testimonial}"
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
