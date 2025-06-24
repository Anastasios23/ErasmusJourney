import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import { ArrowRight, ArrowLeft, Upload, BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllUniversities,
  getDepartmentsByUniversity,
  getUniversityById,
} from "@/data/universities";

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

const CourseMatching = () => {
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

  const universities = getAllUniversities();
  const hostDepartments = selectedHostUniversityId
    ? getDepartmentsByUniversity(selectedHostUniversityId)
    : [];
  const homeDepartments = selectedHomeUniversityId
    ? getDepartmentsByUniversity(selectedHomeUniversityId)
    : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "hostUniversity") {
      const uni = universities.find((u) => u.name === value);
      setSelectedHostUniversityId(uni?.id || "");
      setFormData((prev) => ({ ...prev, hostDepartment: "" }));
    }

    if (field === "homeUniversity") {
      const uni = universities.find((u) => u.name === value);
      setSelectedHomeUniversityId(uni?.id || "");
      setFormData((prev) => ({ ...prev, homeDepartment: "" }));
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

  const addEquivalentCourse = () => {
    setEquivalentCourses([
      ...equivalentCourses,
      { name: "", code: "", ects: "" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Course Matching Form submitted:", {
      formData,
      courses,
      equivalentCourses,
    });
    // Navigate to next page
  };

  return (
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
          {/* University Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                University Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hostUniversity">Host University</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("hostUniversity", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select host university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.name}>
                          {uni.name} ({uni.shortName})
                        </SelectItem>
                      ))}
                      <SelectItem value="other">
                        Other (European University)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostDepartment">
                    Department at Host University
                  </Label>
                  {selectedHostUniversityId ? (
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("hostDepartment", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostDepartments.map((dept, index) => (
                          <SelectItem key={index} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter department at host university"
                      value={formData.hostDepartment}
                      onChange={(e) =>
                        handleInputChange("hostDepartment", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homeUniversity">Home University</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("homeUniversity", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.name}>
                          {uni.name} ({uni.shortName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeDepartment">
                    Department at Home University
                  </Label>
                  {selectedHomeUniversityId ? (
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("homeDepartment", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {homeDepartments.map((dept, index) => (
                          <SelectItem key={index} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter department at home university"
                      value={formData.homeDepartment}
                      onChange={(e) =>
                        handleInputChange("homeDepartment", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses at Host University */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Courses at Host University
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCourse}
                >
                  Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Program Image Upload */}
              <div className="space-y-2">
                <Label>Course Program Image (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a photo of your course program
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    If the photo program is not accurate, we'll use the manual
                    entry below
                  </p>
                </div>
              </div>

              {courses.map((course, index) => (
                <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Course {index + 1}
                    </h4>
                    {courses.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCourse(index)}
                      >
                        Remove
                      </Button>
                    )}
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
                          <SelectItem value="5">5 - Very Difficult</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Exam Type</Label>
                      <RadioGroup
                        value={course.examType}
                        onValueChange={(value) =>
                          updateCourse(index, "examType", value)
                        }
                      >
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="oral" id={`oral-${index}`} />
                            <Label htmlFor={`oral-${index}`}>Oral</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="written"
                              id={`written-${index}`}
                            />
                            <Label htmlFor={`written-${index}`}>Written</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="presentation"
                              id={`presentation-${index}`}
                            />
                            <Label htmlFor={`presentation-${index}`}>
                              Presentation
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="project"
                              id={`project-${index}`}
                            />
                            <Label htmlFor={`project-${index}`}>
                              Project-Based
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Home University Equivalent Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Home University Equivalent Courses
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEquivalentCourse}
                >
                  Add Equivalent Course
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {equivalentCourses.map((course, index) => (
                <Card key={index} className="p-4 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Equivalent Course {index + 1}
                    </h4>
                    {equivalentCourses.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEquivalentCourse(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Course Name</Label>
                      <Input
                        placeholder="Enter equivalent course name"
                        value={course.name}
                        onChange={(e) =>
                          updateEquivalentCourse(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Course Code</Label>
                      <Input
                        placeholder="Enter course code"
                        value={course.code}
                        onChange={(e) =>
                          updateEquivalentCourse(index, "code", e.target.value)
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
                          updateEquivalentCourse(index, "ects", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

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
            <Link to="/basic-information">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Basic Information
              </Button>
            </Link>

            <Link to="/accommodation">
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
              >
                Continue to Accommodation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseMatching;
