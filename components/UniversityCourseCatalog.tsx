import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Search,
  BookOpen,
  Users,
  Star,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react";

interface CourseRecord {
  id: string;
  foreignCourse: {
    code: string;
    name: string;
    credits: number;
    language: string;
    level: string;
  };
  cyprusEquivalent: {
    code: string;
    name: string;
    university: string;
    department: string;
  };
  students: {
    taken: number;
    avgGrade: string;
    satisfaction: number;
  };
  transferStatus: "approved" | "conditional" | "not_approved";
  lastUpdated: string;
}

interface UniversityCourseCatalogProps {
  universityName: string;
  country: string;
  courses: CourseRecord[];
}

const sampleCourses: CourseRecord[] = [
  {
    id: "1",
    foreignCourse: {
      code: "IN2026",
      name: "Database Systems",
      credits: 6,
      language: "English",
      level: "Undergraduate",
    },
    cyprusEquivalent: {
      code: "CS350",
      name: "Database Management Systems",
      university: "University of Cyprus",
      department: "Computer Science",
    },
    students: {
      taken: 12,
      avgGrade: "A-",
      satisfaction: 4.6,
    },
    transferStatus: "approved",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    foreignCourse: {
      code: "IN2028",
      name: "Software Engineering",
      credits: 8,
      language: "English",
      level: "Undergraduate",
    },
    cyprusEquivalent: {
      code: "CS370",
      name: "Software Engineering",
      university: "University of Cyprus",
      department: "Computer Science",
    },
    students: {
      taken: 8,
      avgGrade: "B+",
      satisfaction: 4.4,
    },
    transferStatus: "approved",
    lastUpdated: "2024-01-15",
  },
  {
    id: "3",
    foreignCourse: {
      code: "IN2322",
      name: "Machine Learning",
      credits: 6,
      language: "English",
      level: "Graduate",
    },
    cyprusEquivalent: {
      code: "CS450",
      name: "Artificial Intelligence",
      university: "University of Cyprus",
      department: "Computer Science",
    },
    students: {
      taken: 5,
      avgGrade: "A",
      satisfaction: 4.8,
    },
    transferStatus: "approved",
    lastUpdated: "2024-01-15",
  },
];

export default function UniversityCourseCatalog({
  universityName,
  country,
  courses = sampleCourses,
}: UniversityCourseCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchTerm === "" ||
      course.foreignCourse.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course.foreignCourse.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course.cyprusEquivalent.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevel === "all" ||
      course.foreignCourse.level.toLowerCase() === selectedLevel;

    const matchesStatus =
      selectedStatus === "all" || course.transferStatus === selectedStatus;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "conditional":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Conditional
          </Badge>
        );
      case "not_approved":
        return (
          <Badge className="bg-red-100 text-red-800">
            <Info className="w-3 h-3 mr-1" />
            Not Approved
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Course Catalog - {universityName}
        </h2>
        <p className="text-gray-600">
          Browse courses taken by Cyprus students and their credit transfer
          status
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Course Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Transfer Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="not_approved">Not Approved</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedLevel("all");
                setSelectedStatus("all");
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Foreign Course */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {course.foreignCourse.code}
                      </Badge>
                      <Badge variant="secondary">
                        {course.foreignCourse.level}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.foreignCourse.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Credits: {course.foreignCourse.credits} ECTS</p>
                      <p>Language: {course.foreignCourse.language}</p>
                    </div>
                  </div>

                  {/* Cyprus Equivalent */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Cyprus Equivalent
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <Badge variant="outline">
                          {course.cyprusEquivalent.code}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-gray-800">
                        {course.cyprusEquivalent.name}
                      </h5>
                      <div className="text-sm text-gray-600">
                        <p>{course.cyprusEquivalent.university}</p>
                        <p>{course.cyprusEquivalent.department}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics & Status */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Transfer Status
                      </h4>
                      {getStatusBadge(course.transferStatus)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Students taken:</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">
                            {course.students.taken}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Average grade:</span>
                        <span className="font-medium">
                          {course.students.avgGrade}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Satisfaction:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="font-medium">
                            {course.students.satisfaction}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(course.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card className="bg-blue-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {courses.length}
              </p>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {courses.filter((c) => c.transferStatus === "approved").length}
              </p>
              <p className="text-sm text-gray-600">Approved for Transfer</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {courses.reduce((sum, c) => sum + c.students.taken, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {(
                  courses.reduce((sum, c) => sum + c.students.satisfaction, 0) /
                  courses.length
                ).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Avg Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
