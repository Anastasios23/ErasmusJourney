import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllUniversities,
  getDepartmentsByUniversity,
  getUniversityById,
} from "@/data/universities";

const BasicInformation = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    semester: "",
    levelOfStudy: "",
    universityInCyprus: "",
    homeUniversity: "",
    receptionCountry: "",
    receptionCity: "",
    foreignUniversity: "",
    departmentAtHost: "",
    department: "",
  });

  const universities = getAllUniversities();
  const [selectedHomeUniversityId, setSelectedHomeUniversityId] = useState("");
  const [selectedForeignUniversityId, setSelectedForeignUniversityId] =
    useState("");

  const homeDepartments = selectedHomeUniversityId
    ? getDepartmentsByUniversity(selectedHomeUniversityId)
    : [];
  const foreignDepartments = selectedForeignUniversityId
    ? getDepartmentsByUniversity(selectedForeignUniversityId)
    : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Handle university selection for department filtering
    if (field === "homeUniversity") {
      const uni = universities.find((u) => u.name === value);
      setSelectedHomeUniversityId(uni?.id || "");
      setFormData((prev) => ({ ...prev, department: "" })); // Reset department when university changes
    }

    if (field === "foreignUniversity") {
      const uni = universities.find((u) => u.name === value);
      setSelectedForeignUniversityId(uni?.id || "");
      setFormData((prev) => ({ ...prev, departmentAtHost: "" })); // Reset department when university changes
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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
                Step 1 of 5
              </Badge>
              <h1 className="text-2xl font-bold text-gray-900">
                Basic Information
              </h1>
            </div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Semester of Mobility
                  </Label>
                  <RadioGroup
                    value={formData.semester}
                    onValueChange={(value) =>
                      handleInputChange("semester", value)
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fall" id="fall" />
                      <Label htmlFor="fall">Fall</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="spring" id="spring" />
                      <Label htmlFor="spring">Spring</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full-year" id="full-year" />
                      <Label htmlFor="full-year">Full Year</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="levelOfStudy">Level of Study</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("levelOfStudy", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level of study" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="universityInCyprus">
                      University in Cyprus
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("universityInCyprus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your university in Cyprus" />
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
                    <Label htmlFor="homeUniversity">
                      Home University in Cyprus
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("homeUniversity", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your home university" />
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="receptionCountry">Reception Country</Label>
                    <Input
                      id="receptionCountry"
                      placeholder="Enter reception country"
                      value={formData.receptionCountry}
                      onChange={(e) =>
                        handleInputChange("receptionCountry", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receptionCity">Reception City</Label>
                    <Input
                      id="receptionCity"
                      placeholder="Enter reception city"
                      value={formData.receptionCity}
                      onChange={(e) =>
                        handleInputChange("receptionCity", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foreignUniversity">
                    Foreign University (Host University)
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("foreignUniversity", value)
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
                  <Label htmlFor="departmentAtHost">
                    Department at Host University
                  </Label>
                  {selectedForeignUniversityId ? (
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("departmentAtHost", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department at host university" />
                      </SelectTrigger>
                      <SelectContent>
                        {foreignDepartments.map((dept, index) => (
                          <SelectItem key={index} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="departmentAtHost"
                      placeholder="Enter department at host university"
                      value={formData.departmentAtHost}
                      onChange={(e) =>
                        handleInputChange("departmentAtHost", e.target.value)
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Your Department</Label>
                  {selectedHomeUniversityId ? (
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
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
                      id="department"
                      placeholder="Enter your department"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
            >
              Continue to Course Matching
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicInformation;
