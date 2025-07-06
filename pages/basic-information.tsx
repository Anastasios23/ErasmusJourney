import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
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
import { Badge } from "../src/components/ui/badge";
import { Textarea } from "../src/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
  getAgreementsByUniversityAndLevel,
  getPartnerCountries,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";

export default function BasicInformation() {
  const { data: session } = useSession();
  const router = useRouter();
  const { submitForm, getDraftData, saveDraft } = useFormSubmissions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Academic Information
    universityInCyprus: "",
    departmentInCyprus: "",
    levelOfStudy: "",
    currentYear: "",
    gpa: "",
    studentId: "",
    academicAdvisor: "",

    // Exchange Information
    exchangePeriod: "",
    exchangeStartDate: "",
    exchangeEndDate: "",
    hostUniversity: "",
    hostCountry: "",
    hostCity: "",
    hostDepartment: "",
    hostCoordinator: "",

    // Language Requirements
    languageOfInstruction: "",
    languageProficiencyLevel: "",
    languageCertificates: "",

    // Motivation and Goals
    motivationForExchange: "",
    academicGoals: "",
    personalGoals: "",
    careerGoals: "",

    // Additional Information
    previousExchangeExperience: "",
    extracurricularActivities: "",
    specialNeeds: "",
    dietaryRestrictions: "",
    medicalConditions: "",
    additionalNotes: "",

    // Preferences
    accommodationPreference: "",
    buddyProgramInterest: "",
    orientationProgramInterest: "",
  });

  // Authentication temporarily disabled - all users can access

  // Load draft data on component mount
  useEffect(() => {
    const draftData = getDraftData("basic-info");
    if (draftData) {
      setFormData(draftData);
    }
  }, [getDraftData]);

  const cyprusUniversities = CYPRUS_UNIVERSITIES;
  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    Array<{ university: string; city: string; country: string }>
  >([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Get departments for selected Cyprus university
  const availableDepartments =
    formData.universityInCyprus === "UNIC"
      ? // For UNIC, get unique departments from actual agreement data filtered by level
        formData.levelOfStudy
        ? [
            ...new Set(
              UNIC_COMPREHENSIVE_AGREEMENTS.filter(
                (agreement) =>
                  agreement.academicLevel === formData.levelOfStudy,
              ).map((agreement) => agreement.homeDepartment.trim()),
            ),
          ]
        : []
      : formData.universityInCyprus
        ? // For other universities, use the predefined departments
          cyprusUniversities.find((u) => u.code === formData.universityInCyprus)
            ?.departments || []
        : [];

  // Update available host universities when Cyprus university, department, or level changes
  useEffect(() => {
    if (
      formData.universityInCyprus &&
      formData.departmentInCyprus &&
      formData.levelOfStudy
    ) {
      let agreements: any[] = [];

      if (formData.universityInCyprus === "UNIC" && formData.levelOfStudy) {
        // For UNIC, use level-specific agreements
        agreements = getAgreementsByDepartmentAndLevel(
          formData.universityInCyprus,
          formData.departmentInCyprus,
          formData.levelOfStudy as "bachelor" | "master" | "phd",
        );
      } else {
        // For other universities, use general department agreements
        agreements = getAgreementsByDepartment(
          formData.universityInCyprus,
          formData.departmentInCyprus,
        );
      }

      const uniqueHostUniversities = agreements.map((agreement) => ({
        university: agreement.partnerUniversity,
        city: agreement.partnerCity,
        country: agreement.partnerCountry,
      }));

      const uniqueCities = [
        ...new Set(agreements.map((agreement) => agreement.partnerCity)),
      ].sort();

      setAvailableHostUniversities(uniqueHostUniversities);
      setAvailableCities(uniqueCities);
    } else {
      setAvailableHostUniversities([]);
      setAvailableCities([]);
    }
  }, [
    formData.universityInCyprus,
    formData.departmentInCyprus,
    formData.levelOfStudy,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset dependent fields when changing university or department
      if (field === "universityInCyprus") {
        newData.departmentInCyprus = "";
        newData.hostUniversity = "";
        newData.hostCountry = "";
        newData.hostCity = "";
      }
      if (field === "departmentInCyprus" || field === "levelOfStudy") {
        newData.hostUniversity = "";
        newData.hostCountry = "";
        newData.hostCity = "";
      }

      // Auto-fill city when country is selected
      if (field === "hostCountry") {
        const citiesInCountry = availableHostUniversities
          .filter((uni) => uni.country === value)
          .map((uni) => uni.city);
        if (citiesInCountry.length === 1) {
          newData.hostCity = citiesInCountry[0];
        } else {
          newData.hostCity = "";
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitForm(
        "basic-info",
        "Basic Information Form",
        formData,
        "submitted",
      );
      router.push("/course-matching");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft("basic-info", "Basic Information Draft", formData);
    } catch (error) {
      console.error("Draft save error:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Basic Information - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Complete your personal and academic information for your Erasmus application"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Basic Information
              </h1>
              <p className="text-gray-600">
                Complete your personal and academic information for your Erasmus
                application. All fields marked with * are required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) =>
                          handleInputChange("nationality", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Home Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">
                        Emergency Contact Name *
                      </Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          handleInputChange(
                            "emergencyContactName",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        Emergency Contact Phone *
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) =>
                          handleInputChange(
                            "emergencyContactPhone",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">
                        Relationship *
                      </Label>
                      <Input
                        id="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={(e) =>
                          handleInputChange(
                            "emergencyContactRelation",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="universityInCyprus">
                        Cyprus University *
                      </Label>
                      <Select
                        value={formData.universityInCyprus}
                        onValueChange={(value) =>
                          handleInputChange("universityInCyprus", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent>
                          {cyprusUniversities.map((uni) => (
                            <SelectItem key={uni.code} value={uni.code}>
                              {uni.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="levelOfStudy">Level of Study *</Label>
                      <Select
                        value={formData.levelOfStudy}
                        onValueChange={(value) =>
                          handleInputChange("levelOfStudy", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor</SelectItem>
                          <SelectItem value="master">Master</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departmentInCyprus">Department *</Label>
                    <Select
                      value={formData.departmentInCyprus}
                      onValueChange={(value) =>
                        handleInputChange("departmentInCyprus", value)
                      }
                      disabled={!formData.universityInCyprus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.departmentInCyprus &&
                    availableHostUniversities.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                        <p className="text-green-800 text-sm">
                          <span className="font-semibold">
                            {availableHostUniversities.length} partner
                            universities
                          </span>{" "}
                          available for {formData.departmentInCyprus} at{" "}
                          {
                            cyprusUniversities.find(
                              (u) => u.code === formData.universityInCyprus,
                            )?.name
                          }
                          {formData.levelOfStudy &&
                            ` (${formData.levelOfStudy} level)`}
                        </p>
                      </div>
                    )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentYear">
                        Current Year of Study *
                      </Label>
                      <Select
                        value={formData.currentYear}
                        onValueChange={(value) =>
                          handleInputChange("currentYear", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="5">5th Year</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA</Label>
                      <Input
                        id="gpa"
                        value={formData.gpa}
                        onChange={(e) =>
                          handleInputChange("gpa", e.target.value)
                        }
                        placeholder="e.g., 3.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) =>
                          handleInputChange("studentId", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Exchange Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exchangePeriod">Exchange Period *</Label>
                      <Select
                        value={formData.exchangePeriod}
                        onValueChange={(value) =>
                          handleInputChange("exchangePeriod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semester1">
                            Fall Semester
                          </SelectItem>
                          <SelectItem value="semester2">
                            Spring Semester
                          </SelectItem>
                          <SelectItem value="full_year">
                            Full Academic Year
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostCountry">
                        Preferred Host Country *
                      </Label>
                      <Select
                        value={formData.hostCountry}
                        onValueChange={(value) =>
                          handleInputChange("hostCountry", value)
                        }
                        disabled={availableHostUniversities.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            ...new Set(
                              availableHostUniversities.map((u) => u.country),
                            ),
                          ]
                            .sort()
                            .map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostCity">Preferred Host City</Label>
                      <Select
                        value={formData.hostCity}
                        onValueChange={(value) =>
                          handleInputChange("hostCity", value)
                        }
                        disabled={!formData.hostCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHostUniversities
                            .filter(
                              (uni) => uni.country === formData.hostCountry,
                            )
                            .map((uni) => uni.city)
                            .filter(
                              (city, index, arr) => arr.indexOf(city) === index,
                            )
                            .sort()
                            .map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostUniversity">
                        Preferred Host University
                      </Label>
                      <Select
                        value={formData.hostUniversity}
                        onValueChange={(value) =>
                          handleInputChange("hostUniversity", value)
                        }
                        disabled={!formData.hostCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHostUniversities
                            .filter(
                              (uni) =>
                                uni.country === formData.hostCountry &&
                                (!formData.hostCity ||
                                  uni.city === formData.hostCity),
                            )
                            .map((uni, index) => (
                              <SelectItem key={index} value={uni.university}>
                                {uni.university} - {uni.city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exchangeStartDate">
                        Preferred Start Date
                      </Label>
                      <Input
                        id="exchangeStartDate"
                        type="date"
                        value={formData.exchangeStartDate}
                        onChange={(e) =>
                          handleInputChange("exchangeStartDate", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exchangeEndDate">
                        Preferred End Date
                      </Label>
                      <Input
                        id="exchangeEndDate"
                        type="date"
                        value={formData.exchangeEndDate}
                        onChange={(e) =>
                          handleInputChange("exchangeEndDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Language Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="languageOfInstruction">
                        Language of Instruction *
                      </Label>
                      <Select
                        value={formData.languageOfInstruction}
                        onValueChange={(value) =>
                          handleInputChange("languageOfInstruction", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="languageProficiencyLevel">
                        Proficiency Level *
                      </Label>
                      <Select
                        value={formData.languageProficiencyLevel}
                        onValueChange={(value) =>
                          handleInputChange("languageProficiencyLevel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a1">A1 - Beginner</SelectItem>
                          <SelectItem value="a2">A2 - Elementary</SelectItem>
                          <SelectItem value="b1">B1 - Intermediate</SelectItem>
                          <SelectItem value="b2">
                            B2 - Upper Intermediate
                          </SelectItem>
                          <SelectItem value="c1">C1 - Advanced</SelectItem>
                          <SelectItem value="c2">C2 - Proficient</SelectItem>
                          <SelectItem value="native">Native Speaker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languageCertificates">
                      Language Certificates
                    </Label>
                    <Textarea
                      id="languageCertificates"
                      value={formData.languageCertificates}
                      onChange={(e) =>
                        handleInputChange(
                          "languageCertificates",
                          e.target.value,
                        )
                      }
                      placeholder="List any language certificates you have (TOEFL, IELTS, DELE, etc.)"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Motivation and Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Motivation and Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="motivationForExchange">
                      Motivation for Exchange *
                    </Label>
                    <Textarea
                      id="motivationForExchange"
                      value={formData.motivationForExchange}
                      onChange={(e) =>
                        handleInputChange(
                          "motivationForExchange",
                          e.target.value,
                        )
                      }
                      placeholder="Explain why you want to participate in an exchange program..."
                      required
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academicGoals">Academic Goals</Label>
                      <Textarea
                        id="academicGoals"
                        value={formData.academicGoals}
                        onChange={(e) =>
                          handleInputChange("academicGoals", e.target.value)
                        }
                        placeholder="What do you hope to achieve academically?"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personalGoals">Personal Goals</Label>
                      <Textarea
                        id="personalGoals"
                        value={formData.personalGoals}
                        onChange={(e) =>
                          handleInputChange("personalGoals", e.target.value)
                        }
                        placeholder="What personal growth do you expect?"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="previousExchangeExperience">
                      Previous Exchange Experience
                    </Label>
                    <Textarea
                      id="previousExchangeExperience"
                      value={formData.previousExchangeExperience}
                      onChange={(e) =>
                        handleInputChange(
                          "previousExchangeExperience",
                          e.target.value,
                        )
                      }
                      placeholder="Describe any previous international study or work experience..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extracurricularActivities">
                      Extracurricular Activities
                    </Label>
                    <Textarea
                      id="extracurricularActivities"
                      value={formData.extracurricularActivities}
                      onChange={(e) =>
                        handleInputChange(
                          "extracurricularActivities",
                          e.target.value,
                        )
                      }
                      placeholder="List your involvement in clubs, sports, volunteering, etc..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accommodationPreference">
                        Accommodation Preference
                      </Label>
                      <Select
                        value={formData.accommodationPreference}
                        onValueChange={(value) =>
                          handleInputChange("accommodationPreference", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dormitory">
                            University Dormitory
                          </SelectItem>
                          <SelectItem value="shared_apartment">
                            Shared Apartment
                          </SelectItem>
                          <SelectItem value="private_apartment">
                            Private Apartment
                          </SelectItem>
                          <SelectItem value="homestay">Homestay</SelectItem>
                          <SelectItem value="no_preference">
                            No Preference
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Program Interests</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="buddyProgram"
                            checked={formData.buddyProgramInterest === "yes"}
                            onChange={(e) =>
                              handleInputChange(
                                "buddyProgramInterest",
                                e.target.checked ? "yes" : "no",
                              )
                            }
                          />
                          <Label htmlFor="buddyProgram">Buddy Program</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="orientationProgram"
                            checked={
                              formData.orientationProgramInterest === "yes"
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "orientationProgramInterest",
                                e.target.checked ? "yes" : "no",
                              )
                            }
                          />
                          <Label htmlFor="orientationProgram">
                            Orientation Program
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialNeeds">
                      Special Needs / Accessibility
                    </Label>
                    <Textarea
                      id="specialNeeds"
                      value={formData.specialNeeds}
                      onChange={(e) =>
                        handleInputChange("specialNeeds", e.target.value)
                      }
                      placeholder="Any special accommodations or accessibility needs..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        handleInputChange("additionalNotes", e.target.value)
                      }
                      placeholder="Any other information you'd like to share..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Submitting..."
                      : "Continue to Course Matching"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
