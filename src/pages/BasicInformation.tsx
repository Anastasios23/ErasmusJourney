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
import { Link, useNavigate } from "react-router-dom";
import {
  getAllUniversities,
  getDepartmentsByUniversity,
  getUniversityById,
} from "@/data/universities";
import {
  getPartnerUniversitiesForDepartment,
  getDepartmentsWithAgreements,
  formatUniversityDisplay,
} from "@/data/partnerUniversities";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, sessionManager } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const BasicInformation = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    semester: "",
    levelOfStudy: "",
    universityInCyprus: "",
    department: "",
    receptionCountry: "",
    receptionCity: "",
    foreignUniversity: "",
    departmentAtHost: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const universities = getAllUniversities();
  const [selectedForeignUniversityId, setSelectedForeignUniversityId] =
    useState("");

  const foreignDepartments = selectedForeignUniversityId
    ? getDepartmentsByUniversity(selectedForeignUniversityId)
    : [];

  // Get departments with agreements based on selected home university
  const departmentsWithAgreements = formData.universityInCyprus
    ? getDepartmentsWithAgreements(formData.universityInCyprus)
    : [];

  // Get partner universities based on selected home university and department
  const partnerUniversities =
    formData.universityInCyprus && formData.department
      ? getPartnerUniversitiesForDepartment(
          formData.universityInCyprus,
          formData.department,
        )
      : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset dependent fields when home university changes
    if (field === "universityInCyprus") {
      setFormData((prev) => ({
        ...prev,
        department: "",
        foreignUniversity: "",
        departmentAtHost: "",
      }));
      setSelectedForeignUniversityId("");
    }

    // Reset foreign university when department changes
    if (field === "department") {
      setFormData((prev) => ({
        ...prev,
        foreignUniversity: "",
        departmentAtHost: "",
      }));
      setSelectedForeignUniversityId("");
    }

    if (field === "foreignUniversity") {
      const uni = universities.find((u) => u.name === value);
      setSelectedForeignUniversityId(uni?.id || "");
      setFormData((prev) => ({ ...prev, departmentAtHost: "" })); // Reset department when university changes
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for mandatory fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "semester",
      "levelOfStudy",
      "universityInCyprus",
      "department",
      "receptionCountry",
      "receptionCity",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.saveBasicInformation({
        ...formData,
        userId: parseInt(user.id),
      });

      // Store the basic info ID in session for next steps
      sessionManager.setBasicInfoId(response.id);

      toast({
        title: "Information Saved!",
        description: "Your basic information has been saved successfully.",
      });

      // Navigate to course matching
      navigate("/course-matching");
    } catch (error) {
      console.error("Error saving basic information:", error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                  required
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
                          <SelectItem key={`uni-${uni.id}`} value={uni.name}>
                            {uni.name} ({uni.shortName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Your Department/Program</Label>
                    {formData.universityInCyprus ? (
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("department", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentsWithAgreements.map((dept, index) => (
                            <SelectItem
                              key={`dept-${dept}-${index}`}
                              value={dept}
                            >
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                        <p className="text-sm text-gray-600">
                          Please select your university in Cyprus first
                        </p>
                      </div>
                    )}
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
                  {formData.universityInCyprus && formData.department ? (
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("foreignUniversity", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner university" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerUniversities.length > 0 ? (
                          <>
                            {partnerUniversities.map((partner, index) => (
                              <SelectItem
                                key={`${partner.name}-${partner.city}-${partner.country}-${index}`}
                                value={partner.name}
                              >
                                {formatUniversityDisplay(partner)}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">
                              Other (European University)
                            </SelectItem>
                          </>
                        ) : (
                          <SelectItem value="no-agreements" disabled>
                            No specific agreements found for this department
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-600">
                        {!formData.universityInCyprus
                          ? "Please select your university in Cyprus first"
                          : "Please select your department to see available partner universities with specific agreements"}
                      </p>
                    </div>
                  )}
                  {formData.universityInCyprus &&
                    formData.department &&
                    partnerUniversities.length > 0 && (
                      <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                        <p className="text-sm text-blue-800">
                          <strong>{partnerUniversities.length}</strong> partner
                          universities found with agreements for{" "}
                          {formData.department} at {formData.universityInCyprus}
                        </p>
                      </div>
                    )}
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
                          <SelectItem
                            key={`foreign-dept-${dept.name}-${index}`}
                            value={dept.name}
                          >
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Continue to Course Matching"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicInformation;
