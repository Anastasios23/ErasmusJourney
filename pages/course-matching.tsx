import { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { authOptions } from "./api/auth/[...nextauth]";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
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
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import Header from "../components/Header";
import { ArrowRight, ArrowLeft, Upload, BookOpen, X } from "lucide-react";
import { CYPRUS_UNIVERSITIES } from "../src/data/universityAgreements";

interface Course {
  name: string;
  code: string;
  ects: string;
  difficulty: string;
  examTypes: string[];
}

interface EquivalentCourse {
  name: string;
  code: string;
  ects: string;
}

export default function CourseMatching() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hostUniversity: "",
    hostDepartment: "",
    homeUniversity: "",
    homeDepartment: "",
    hostCourseCount: "",
    homeCourseCount: "",
    courseMatchingDifficult: "",
    courseMatchingChallenges: "",
    recommendCourses: "",
    recommendationReason: "",
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [equivalentCourses, setEquivalentCourses] = useState<
    EquivalentCourse[]
  >([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [selectedHostUniversityId, setSelectedHostUniversityId] = useState("");
  const [selectedHomeUniversityId, setSelectedHomeUniversityId] = useState("");
  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    Array<{ university: string; city: string; country: string }>
  >([]);

  const cyprusUniversities = CYPRESS_UNIVERSITIES;

  // Get departments for selected Cyprus university
  const homeDepartments = selectedHomeUniversityId
    ? cyprusUniversities.find((u) => u.code === selectedHomeUniversityId)
        ?.departments || []
    : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "homeUniversity") {
      setSelectedHomeUniversityId(value);
      setFormData((prev) => ({
        ...prev,
        homeDepartment: "",
        hostUniversity: "",
        hostDepartment: "",
      }));
      setAvailableHostUniversities([]);
    }

    if (field === "homeDepartment") {
      // Filter available host universities based on department
      const agreements = ALL_UNIVERSITY_AGREEMENTS.filter(
        (agreement) =>
          agreement.homeUniversity === formData.homeUniversity &&
          agreement.homeDepartment === value,
      );

      const hostUniversities = Array.from(
        new Set(
          agreements.map((agreement) => ({
            university: agreement.partnerUniversity,
            city: agreement.partnerCity,
            country: agreement.partnerCountry,
          })),
        ),
      );

      setAvailableHostUniversities(hostUniversities);
      setFormData((prev) => ({
        ...prev,
        hostUniversity: "",
        hostDepartment: "",
      }));
    }
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        name: "",
        code: "",
        ects: "",
        difficulty: "",
        examTypes: [],
      },
    ]);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (index: number, field: string, value: string) => {
    const updatedCourses = courses.map((course, i) =>
      i === index ? { ...course, [field]: value } : course,
    );
    setCourses(updatedCourses);
  };

  const addEquivalentCourse = () => {
    setEquivalentCourses([
      ...equivalentCourses,
      {
        name: "",
        code: "",
        ects: "",
      },
    ]);
  };

  const removeEquivalentCourse = (index: number) => {
    setEquivalentCourses(equivalentCourses.filter((_, i) => i !== index));
  };

  const updateEquivalentCourse = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedCourses = equivalentCourses.map((course, i) =>
      i === index ? { ...course, [field]: value } : course,
    );
    setEquivalentCourses(updatedCourses);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", {
      formData,
      courses,
      equivalentCourses,
      uploadedFile,
    });
    // Handle form submission logic here
  };

  return (
    <>
      <Head>
        <title>Course Matching - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Match courses between universities for your Erasmus exchange"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Course Matching
              </h1>
              <p className="text-gray-600">
                Match courses between your home and host universities
              </p>
            </div>

            <div className="space-y-8">
              {/* University Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>University Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home University */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Home University (Cyprus)
                      </Label>
                      <div>
                        <Label htmlFor="homeUniversity">University</Label>
                        <Select
                          value={formData.homeUniversity}
                          onValueChange={(value) =>
                            handleInputChange("homeUniversity", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your university" />
                          </SelectTrigger>
                          <SelectContent>
                            {cyprusUniversities.map((university) => (
                              <SelectItem
                                key={university.code}
                                value={university.code}
                              >
                                {university.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="homeDepartment">Department</Label>
                        <Select
                          value={formData.homeDepartment}
                          onValueChange={(value) =>
                            handleInputChange("homeDepartment", value)
                          }
                          disabled={!formData.homeUniversity}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {homeDepartments.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Host University */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Host University
                      </Label>
                      <div>
                        <Label htmlFor="hostUniversity">University</Label>
                        <Select
                          value={formData.hostUniversity}
                          onValueChange={(value) =>
                            handleInputChange("hostUniversity", value)
                          }
                          disabled={availableHostUniversities.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select host university" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableHostUniversities.map(
                              (university, index) => (
                                <SelectItem
                                  key={index}
                                  value={university.university}
                                >
                                  {university.university} - {university.city},{" "}
                                  {university.country}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="hostDepartment">Department</Label>
                        <Input
                          placeholder="Enter department name"
                          value={formData.hostDepartment}
                          onChange={(e) =>
                            handleInputChange("hostDepartment", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hostCourseCount">
                        Number of courses taken at host university
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter number"
                        value={formData.hostCourseCount}
                        onChange={(e) =>
                          handleInputChange("hostCourseCount", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="homeCourseCount">
                        Number of equivalent courses at home university
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter number"
                        value={formData.homeCourseCount}
                        onChange={(e) =>
                          handleInputChange("homeCourseCount", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="courseMatchingDifficult">
                      Was course matching difficult?
                    </Label>
                    <RadioGroup
                      value={formData.courseMatchingDifficult}
                      onValueChange={(value) =>
                        handleInputChange("courseMatchingDifficult", value)
                      }
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="difficult-yes" />
                        <Label htmlFor="difficult-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="difficult-no" />
                        <Label htmlFor="difficult-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="courseMatchingChallenges">
                      What challenges did you face during course matching?
                    </Label>
                    <Textarea
                      placeholder="Describe the challenges..."
                      value={formData.courseMatchingChallenges}
                      onChange={(e) =>
                        handleInputChange(
                          "courseMatchingChallenges",
                          e.target.value,
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Host University Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Host University Courses</span>
                    <Button onClick={addCourse} variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Add Course
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.map((course, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-4 relative"
                    >
                      <Button
                        onClick={() => removeCourse(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Course Name</Label>
                          <Input
                            placeholder="Enter course name"
                            value={course.name}
                            onChange={(e) =>
                              updateCourse(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Course Code</Label>
                          <Input
                            placeholder="Enter course code"
                            value={course.code}
                            onChange={(e) =>
                              updateCourse(index, "code", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>ECTS</Label>
                          <Input
                            placeholder="Enter ECTS"
                            value={course.ects}
                            onChange={(e) =>
                              updateCourse(index, "ects", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Course Difficulty</Label>
                        <RadioGroup
                          value={course.difficulty}
                          onValueChange={(value) =>
                            updateCourse(index, "difficulty", value)
                          }
                          className="flex space-x-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="easy" id={`easy-${index}`} />
                            <Label htmlFor={`easy-${index}`}>Easy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="medium"
                              id={`medium-${index}`}
                            />
                            <Label htmlFor={`medium-${index}`}>Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hard" id={`hard-${index}`} />
                            <Label htmlFor={`hard-${index}`}>Hard</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  ))}

                  {courses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No courses added yet. Click "Add Course" to get started.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recommendCourses">
                      Would you recommend these courses to future students?
                    </Label>
                    <RadioGroup
                      value={formData.recommendCourses}
                      onValueChange={(value) =>
                        handleInputChange("recommendCourses", value)
                      }
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="recommend-yes" />
                        <Label htmlFor="recommend-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="recommend-no" />
                        <Label htmlFor="recommend-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="recommendationReason">
                      Please explain your recommendation
                    </Label>
                    <Textarea
                      placeholder="Explain why you would or wouldn't recommend..."
                      value={formData.recommendationReason}
                      onChange={(e) =>
                        handleInputChange(
                          "recommendationReason",
                          e.target.value,
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-between">
                <Link href="/basic-information">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                </Link>
                <Button onClick={handleSubmit}>
                  Submit Course Matching
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
