import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
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
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
} from "../src/data/universityAgreements";

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
  const [formData, setFormData] = useState({
    hostUniversity: "",
    hostDepartment: "",
    homeUniversity: "",
    homeDepartment: "",
    levelOfStudy: "",
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

  const [selectedHomeUniversityId, setSelectedHomeUniversityId] = useState("");
  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    Array<{ university: string; city: string; country: string }>
  >([]);

  const cyprusUniversities = CYPRUS_UNIVERSITIES;

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

    // Update partnerships when university, department, or level changes
    if (
      field === "homeUniversity" ||
      field === "homeDepartment" ||
      field === "levelOfStudy"
    ) {
      // Get the current values, using the new value for the field being changed
      const university =
        field === "homeUniversity" ? value : formData.homeUniversity;
      const department =
        field === "homeDepartment" ? value : formData.homeDepartment;
      const level = field === "levelOfStudy" ? value : formData.levelOfStudy;

      // Only filter partnerships if all three fields are selected
      if (university && department && level) {
        const partnershipAgreements = getAgreementsByDepartmentAndLevel(
          university,
          department,
          level as "bachelor" | "master" | "phd",
        );
        const hostUniversities = partnershipAgreements.map((agreement) => ({
          university: agreement.partnerUniversity,
          city: agreement.partnerCity,
          country: agreement.partnerCountry,
        }));

        // Remove duplicates
        const uniqueHostUniversities = hostUniversities.filter(
          (uni, index, self) =>
            index === self.findIndex((u) => u.university === uni.university),
        );

        setAvailableHostUniversities(uniqueHostUniversities);

        // Reset host university selection when partnerships change
        if (field !== "homeUniversity") {
          setFormData((prev) => ({
            ...prev,
            hostUniversity: "",
            hostDepartment: "",
          }));
        }
      } else {
        // Clear partnerships if not all fields are selected
        setAvailableHostUniversities([]);
      }
    }

    if (field === "hostCourseCount") {
      const count = parseInt(value) || 0;
      if (count > 0) {
        initializeCourses(count);
      }
    }

    if (field === "homeCourseCount") {
      const count = parseInt(value) || 0;
      if (count > 0) {
        initializeEquivalentCourses(count);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  // Initialize courses based on count
  const initializeCourses = (count: number) => {
    const newCourses = Array.from({ length: count }, () => ({
      name: "",
      code: "",
      ects: "",
      difficulty: "",
      examTypes: [],
    }));
    setCourses(newCourses);
  };

  // Initialize equivalent courses based on count
  const initializeEquivalentCourses = (count: number) => {
    const newCourses = Array.from({ length: count }, () => ({
      name: "",
      code: "",
      ects: "",
    }));
    setEquivalentCourses(newCourses);
  };

  const updateCourse = (index: number, field: string, value: string) => {
    const updatedCourses = courses.map((course, i) =>
      i === index ? { ...course, [field]: value } : course,
    );
    setCourses(updatedCourses);
  };

  const updateCourseExamTypes = (
    courseIndex: number,
    examType: string,
    checked: boolean,
  ) => {
    const updatedCourses = courses.map((course, i) => {
      if (i === courseIndex) {
        const examTypes = checked
          ? [...course.examTypes, examType]
          : course.examTypes.filter((type) => type !== examType);
        return { ...course, examTypes };
      }
      return course;
    });
    setCourses(updatedCourses);
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

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Course Matching Form submitted:", {
      formData,
      courses,
      equivalentCourses,
    });
    router.push("/accommodation");
  };

  return (
    <>
      <Head>
        <title>Course Matching - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share details about your course matching and academic experience"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Progress Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Step 2 of 5
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">
                  Course Matching Information
                </h1>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* University Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  University Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="homeUniversity">
                      Your Home University (Cyprus)
                    </Label>
                    <Select
                      value={formData.homeUniversity}
                      onValueChange={(value) =>
                        handleInputChange("homeUniversity", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your Cyprus university" />
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

                  <div className="space-y-2">
                    <Label htmlFor="levelOfStudy">Level of Study</Label>
                    <Select
                      value={formData.levelOfStudy}
                      onValueChange={(value) =>
                        handleInputChange("levelOfStudy", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeDepartment">
                      Your Department/Field of Study
                    </Label>
                    <Select
                      value={formData.homeDepartment}
                      onValueChange={(value) =>
                        handleInputChange("homeDepartment", value)
                      }
                      disabled={!formData.homeUniversity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
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

                {formData.homeUniversity && formData.homeDepartment && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostUniversity">
                        Host University (where you studied abroad)
                      </Label>
                      <Select
                        value={formData.hostUniversity}
                        onValueChange={(value) =>
                          handleInputChange("hostUniversity", value)
                        }
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
                      {availableHostUniversities.length === 0 &&
                        formData.homeDepartment &&
                        formData.levelOfStudy && (
                          <p className="text-sm text-gray-500">
                            No partner universities found for{" "}
                            {formData.homeDepartment} department at{" "}
                            {formData.levelOfStudy} level. Please check your
                            selections or contact your university.
                          </p>
                        )}
                    </div>

                    {availableHostUniversities.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Partnership Available:</strong> Found{" "}
                          <span className="font-semibold">
                            {availableHostUniversities.length} partner
                            universities
                          </span>{" "}
                          for {formData.homeDepartment} department at{" "}
                          {formData.levelOfStudy} level from{" "}
                          {
                            cyprusUniversities.find(
                              (u) => u.code === formData.homeUniversity,
                            )?.shortName
                          }
                          .
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Count Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Course Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hostCourseCount">
                      How many courses did you take at the host university?
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("hostCourseCount", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "course" : "courses"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeCourseCount">
                      How many equivalent courses do you have at your home
                      university?
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("homeCourseCount", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "course" : "courses"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.hostCourseCount && formData.homeCourseCount && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Course Setup:</strong> You'll provide details for{" "}
                      <span className="font-semibold">
                        {formData.hostCourseCount} host university courses
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold">
                        {formData.homeCourseCount} equivalent home courses
                      </span>
                      .
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Courses at Host University */}
            {formData.hostCourseCount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Courses at Host University ({courses.length} of{" "}
                    {formData.hostCourseCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Program Image Upload */}
                  <div className="space-y-2">
                    <Label>Course Program Image (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {uploadedFile.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeUploadedFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            File uploaded successfully. You can still fill the
                            manual entry below.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload a photo of your course program
                          </p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="course-program-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("course-program-upload")
                                ?.click()
                            }
                          >
                            Choose File
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            If the photo program is not accurate, we'll use the
                            manual entry below
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {courses.map((course, index) => (
                    <Card
                      key={index}
                      className="p-4 border-l-4 border-l-blue-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Course {index + 1}
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Course Name</Label>
                          <Input
                            placeholder="Enter course name"
                            value={course.name}
                            onChange={(e) =>
                              updateCourse(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Course Code</Label>
                          <Input
                            placeholder="Enter course code"
                            value={course.code}
                            onChange={(e) =>
                              updateCourse(index, "code", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ECTS Credits</Label>
                          <Input
                            type="number"
                            placeholder="Enter ECTS credits"
                            value={course.ects}
                            onChange={(e) =>
                              updateCourse(index, "ects", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Level of Difficulty (1-5)</Label>
                          <Select
                            onValueChange={(value) =>
                              updateCourse(index, "difficulty", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Very Easy</SelectItem>
                              <SelectItem value="2">2 - Easy</SelectItem>
                              <SelectItem value="3">3 - Moderate</SelectItem>
                              <SelectItem value="4">4 - Difficult</SelectItem>
                              <SelectItem value="5">
                                5 - Very Difficult
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Exam Types (Select all that apply)</Label>
                          <div className="flex flex-wrap gap-6">
                            {["oral", "written", "presentation", "project"].map(
                              (examType) => (
                                <div
                                  key={examType}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`${examType}-${index}`}
                                    checked={course.examTypes.includes(
                                      examType,
                                    )}
                                    onCheckedChange={(checked) =>
                                      updateCourseExamTypes(
                                        index,
                                        examType,
                                        checked as boolean,
                                      )
                                    }
                                  />
                                  <Label htmlFor={`${examType}-${index}`}>
                                    {examType === "project"
                                      ? "Project-Based"
                                      : examType.charAt(0).toUpperCase() +
                                        examType.slice(1)}
                                  </Label>
                                </div>
                              ),
                            )}
                          </div>
                          {course.examTypes.length > 0 && (
                            <p className="text-xs text-gray-600">
                              Selected: {course.examTypes.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Home University Equivalent Courses */}
            {formData.homeCourseCount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Home University Equivalent Courses (
                    {equivalentCourses.length} of {formData.homeCourseCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {equivalentCourses.map((course, index) => (
                    <Card
                      key={index}
                      className="p-4 border-l-4 border-l-green-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Equivalent Course {index + 1}
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Course Name</Label>
                          <Input
                            placeholder="Enter equivalent course name"
                            value={course.name}
                            onChange={(e) =>
                              updateEquivalentCourse(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Course Code</Label>
                          <Input
                            placeholder="Enter course code"
                            value={course.code}
                            onChange={(e) =>
                              updateEquivalentCourse(
                                index,
                                "code",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ECTS Credits</Label>
                          <Input
                            type="number"
                            placeholder="Enter ECTS credits"
                            value={course.ects}
                            onChange={(e) =>
                              updateEquivalentCourse(
                                index,
                                "ects",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Course Matching Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Course Matching Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Was the course-matching process difficult?
                    </Label>
                    <RadioGroup
                      value={formData.courseMatchingDifficult}
                      onValueChange={(value) =>
                        handleInputChange("courseMatchingDifficult", value)
                      }
                      className="mt-2"
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

                  {formData.courseMatchingDifficult === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="challenges">
                        What were the challenges?
                      </Label>
                      <Textarea
                        id="challenges"
                        placeholder="Describe the challenges you faced during the course-matching process..."
                        value={formData.courseMatchingChallenges}
                        onChange={(e) =>
                          handleInputChange(
                            "courseMatchingChallenges",
                            e.target.value,
                          )
                        }
                        rows={4}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-base font-medium">
                      Would you recommend these courses for future students?
                    </Label>
                    <RadioGroup
                      value={formData.recommendCourses}
                      onValueChange={(value) =>
                        handleInputChange("recommendCourses", value)
                      }
                      className="mt-2"
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

                  {formData.recommendCourses === "no" && (
                    <div className="space-y-2">
                      <Label htmlFor="recommendationReason">Why not?</Label>
                      <Textarea
                        id="recommendationReason"
                        placeholder="Explain why you wouldn't recommend these courses..."
                        value={formData.recommendationReason}
                        onChange={(e) =>
                          handleInputChange(
                            "recommendationReason",
                            e.target.value,
                          )
                        }
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8">
              <Link href="/basic-information">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Basic Information
                </Button>
              </Link>

              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
              >
                Continue to Accommodation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
