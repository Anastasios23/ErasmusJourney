import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Force dynamic rendering for this page since it requires session
export const dynamic = "force-dynamic";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const { submitForm, getDraftData, saveDraft } = useFormSubmissions();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/login?callbackUrl=/basic-information");
    }
  }, [session, status, router]);

  // Load draft data on component mount
  useEffect(() => {
    const draftData = getDraftData("basic-info");
    if (draftData) {
      setFormData(draftData);
    }
  }, []);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update available partner universities when department changes
    if (field === "department") {
      if (formData.universityInCyprus) {
        let partnershipAgreements;

        if (formData.universityInCyprus === "UNIC") {
          // Use level-aware filtering for UNIC
          partnershipAgreements = getAgreementsByDepartmentAndLevel(
            formData.universityInCyprus,
            value,
            formData.levelOfStudy as "bachelor" | "master" | "phd",
          );
        } else {
          // Use generic filtering for other universities
          partnershipAgreements = getAgreementsByDepartment(
            formData.universityInCyprus,
            value,
          );
        }

        const hostUniversities = partnershipAgreements.map((agreement) => ({
          university: agreement.partnerUniversity,
          city: agreement.partnerCity,
          country: agreement.partnerCountry,
        }));

        // Remove duplicates and update state
        const uniqueHostUniversities = hostUniversities.filter(
          (uni, index, self) =>
            index === self.findIndex((u) => u.university === uni.university),
        );

        const uniqueCities = Array.from(
          new Set(hostUniversities.map((u) => u.city)),
        ).sort() as string[];

        setAvailableHostUniversities(uniqueHostUniversities);
        setAvailableCities(uniqueCities);
      }

      setFormData((prev) => ({
        ...prev,
        receptionCountry: "",
        receptionCity: "",
        foreignUniversity: "",
        departmentAtHost: "",
      }));
    }

    // Clear dependent fields when level changes for UNIC
    if (field === "levelOfStudy") {
      if (formData.universityInCyprus === "UNIC") {
        setFormData((prev) => ({
          ...prev,
          department: "",
          receptionCountry: "",
          receptionCity: "",
          foreignUniversity: "",
          departmentAtHost: "",
        }));
        setAvailableHostUniversities([]);
        setAvailableCities([]);
      }
    }

    // Clear dependent fields when university changes
    if (field === "universityInCyprus") {
      // Reset level for non-UNIC universities since they don't need it
      if (value !== "UNIC") {
        setFormData((prev) => ({
          ...prev,
          levelOfStudy: "",
          department: "",
          receptionCountry: "",
          receptionCity: "",
          foreignUniversity: "",
          departmentAtHost: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          department: "",
          receptionCountry: "",
          receptionCity: "",
          foreignUniversity: "",
          departmentAtHost: "",
        }));
      }
      setAvailableHostUniversities([]);
      setAvailableCities([]);
    }

    // Filter cities by country when country changes
    if (field === "receptionCountry") {
      const citiesInCountry = availableHostUniversities
        .filter((uni) => uni.country === value)
        .map((uni) => uni.city);
      const uniqueCitiesInCountry = Array.from(new Set(citiesInCountry)).sort();

      setAvailableCities(uniqueCitiesInCountry);
      setFormData((prev) => ({
        ...prev,
        receptionCity: "",
        foreignUniversity: "",
        departmentAtHost: "",
      }));
    }

    // Filter universities by city when city changes
    if (field === "receptionCity") {
      setFormData((prev) => ({
        ...prev,
        foreignUniversity: "",
        departmentAtHost: "",
      }));
    }
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

      // Show success message and redirect
      alert("Basic information submitted successfully!");
      router.push("/course-matching");
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft("basic-info", "Basic Information Form", formData);
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Basic Information - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your personal and academic information for your Erasmus journey"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Progress Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb />
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
                      value={formData.levelOfStudy}
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
                    {!formData.levelOfStudy && (
                      <p className="text-xs text-blue-600">
                        Required for UNIC - affects available partnerships
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="universityInCyprus">
                        University in Cyprus
                      </Label>
                      <Select
                        value={formData.universityInCyprus}
                        onValueChange={(value) =>
                          handleInputChange("universityInCyprus", value)
                        }
                        disabled={!formData.levelOfStudy}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formData.levelOfStudy
                                ? "Select level of study first"
                                : "Select your university in Cyprus"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cyprusUniversities.map((uni) => (
                            <SelectItem key={uni.code} value={uni.code}>
                              {uni.name} ({uni.shortName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">
                        Your Department/Program
                      </Label>
                      {formData.universityInCyprus ? (
                        <Select
                          value={formData.department}
                          onValueChange={(value) =>
                            handleInputChange("department", value)
                          }
                          disabled={
                            formData.universityInCyprus === "UNIC" &&
                            !formData.levelOfStudy
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                formData.universityInCyprus === "UNIC" &&
                                !formData.levelOfStudy
                                  ? "Select level of study first"
                                  : "Select your department"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDepartments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-600">
                            {!formData.levelOfStudy
                              ? "Please select your level of study first"
                              : "Please select your university in Cyprus first"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.department &&
                    (availableHostUniversities.length > 0 ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>Partnerships Available:</strong> Found{" "}
                          <span className="font-semibold">
                            {availableHostUniversities.length} partner
                            universities
                          </span>{" "}
                          for {formData.department} department
                          {formData.universityInCyprus === "UNIC" &&
                            formData.levelOfStudy &&
                            ` at ${formData.levelOfStudy} level`}{" "}
                          from{" "}
                          {
                            cyprusUniversities.find(
                              (u) => u.code === formData.universityInCyprus,
                            )?.shortName
                          }
                          .
                        </p>
                      </div>
                    ) : formData.universityInCyprus === "UNIC" &&
                      !formData.levelOfStudy ? (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                        <p className="text-sm text-amber-800">
                          <strong>Level Required:</strong> Please select your
                          level of study to see available partnerships for UNIC.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                        <p className="text-sm text-red-800">
                          <strong>No Partnerships Found:</strong> No partner
                          universities found for {formData.department}{" "}
                          department
                          {formData.universityInCyprus === "UNIC" &&
                            formData.levelOfStudy &&
                            ` at ${formData.levelOfStudy} level`}
                          . Please contact your university.
                        </p>
                      </div>
                    ))}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="receptionCountry">
                        Reception Country
                      </Label>
                      {formData.department ? (
                        <Select
                          value={formData.receptionCountry}
                          onValueChange={(value) =>
                            handleInputChange("receptionCountry", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              new Set(
                                availableHostUniversities.map((u) => u.country),
                              ),
                            )
                              .sort()
                              .map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-600">
                            Please select your department first
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receptionCity">Reception City</Label>
                      {formData.receptionCountry ? (
                        <Select
                          value={formData.receptionCity}
                          onValueChange={(value) =>
                            handleInputChange("receptionCity", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-600">
                            Please select a country first
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foreignUniversity">
                      Foreign University (Host University)
                    </Label>
                    {formData.receptionCity ? (
                      <Select
                        value={formData.foreignUniversity}
                        onValueChange={(value) =>
                          handleInputChange("foreignUniversity", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner university" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHostUniversities
                            .filter(
                              (uni) =>
                                uni.city === formData.receptionCity &&
                                uni.country === formData.receptionCountry,
                            )
                            .map((university, index) => (
                              <SelectItem
                                key={`${university.university}-${index}`}
                                value={university.university}
                              >
                                {university.university}
                              </SelectItem>
                            ))}
                          <SelectItem value="other">
                            Other (European University)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {!formData.universityInCyprus
                            ? "Please select your university in Cyprus first"
                            : !formData.department
                              ? "Please select your department first"
                              : !formData.receptionCountry
                                ? "Please select a country first"
                                : "Please select a city first"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departmentAtHost">
                      Department at Host University
                    </Label>
                    <Input
                      id="departmentAtHost"
                      placeholder="Enter department at host university"
                      value={formData.departmentAtHost}
                      onChange={(e) =>
                        handleInputChange("departmentAtHost", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2"
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Continue to Course Matching"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
