import { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import Head from "next/head";
import { authOptions } from "./api/auth/[...nextauth]";
import Header from "../components/Header";
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
import { Textarea } from "../src/components/ui/textarea";
import { Badge } from "../src/components/ui/badge";
import { Progress } from "../src/components/ui/progress";
import { Save, User, MapPin, GraduationCap, Calendar } from "lucide-react";

interface BasicInformationProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function BasicInformation({ user }: BasicInformationProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    homeUniversity: "",
    studyProgram: "",
    currentYear: "",
    gpa: "",
    languageSkills: {
      english: "intermediate",
      spanish: "",
      french: "",
      german: "",
      other: "",
    },
    motivation: "",
    preferredCountries: [],
    preferredSemester: "",
    duration: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const countries = [
    "Cyprus",
    "Greece",
    "Spain",
    "France",
    "Germany",
    "Italy",
    "Portugal",
    "Czech Republic",
    "Poland",
    "Netherlands",
    "Belgium",
    "Austria",
    "Sweden",
    "Norway",
    "Denmark",
  ];

  const universities = [
    "University of Cyprus (UCY)",
    "European University Cyprus (EUC)",
    "University of Nicosia (UNIC)",
    "Frederick University",
    "University of Central Lancashire Cyprus (UCLan)",
    "Open University of Cyprus (OUC)",
    "Neapolis University Pafos",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLanguageChange = (language: string, level: string) => {
    setFormData((prev) => ({
      ...prev,
      languageSkills: {
        ...prev.languageSkills,
        [language]: level,
      },
    }));
  };

  const handleCountryToggle = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCountries: prev.preferredCountries.includes(country)
        ? prev.preferredCountries.filter((c) => c !== country)
        : [...prev.preferredCountries, country],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const completionPercentage = () => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.dateOfBirth,
      formData.nationality,
      formData.homeUniversity,
      formData.studyProgram,
      formData.currentYear,
      formData.motivation,
      formData.preferredSemester,
      formData.duration,
    ];
    const completed = fields.filter(
      (field) => field && field.length > 0,
    ).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <>
      <Head>
        <title>Basic Information - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Complete your basic information for Erasmus application"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Basic Information
              </h1>
              <p className="text-gray-600">
                Complete your profile to get personalized recommendations
              </p>
            </div>

            {/* Progress */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Profile Completion
                  </span>
                  <span className="text-sm text-gray-500">
                    {completionPercentage()}%
                  </span>
                </div>
                <Progress value={completionPercentage()} className="h-2" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="your.email@university.edu"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality</Label>
                        <Select
                          value={formData.nationality}
                          onValueChange={(value) =>
                            handleInputChange("nationality", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        placeholder="+357 99 123456"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="homeUniversity">Home University</Label>
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
                          {universities.map((university) => (
                            <SelectItem key={university} value={university}>
                              {university}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="studyProgram">Study Program</Label>
                      <Input
                        id="studyProgram"
                        value={formData.studyProgram}
                        onChange={(e) =>
                          handleInputChange("studyProgram", e.target.value)
                        }
                        placeholder="e.g., Computer Science, Business Administration"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentYear">Current Year</Label>
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
                            <SelectItem value="master">Master's</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="gpa">GPA (Optional)</Label>
                        <Input
                          id="gpa"
                          value={formData.gpa}
                          onChange={(e) =>
                            handleInputChange("gpa", e.target.value)
                          }
                          placeholder="e.g., 3.5/4.0 or 8.5/10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Language Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Language Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(formData.languageSkills).map(
                      ([language, level]) => (
                        <div key={language} className="flex items-center gap-4">
                          <Label className="w-20 capitalize">{language}</Label>
                          <Select
                            value={level}
                            onValueChange={(value) =>
                              handleLanguageChange(language, value)
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="native">Native</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>

                {/* Motivation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Motivation Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="motivation">
                      Why do you want to study abroad?
                    </Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) =>
                        handleInputChange("motivation", e.target.value)
                      }
                      placeholder="Describe your motivation for participating in the Erasmus program..."
                      className="min-h-[150px] mt-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Mobility Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Mobility Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Preferred Countries</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {countries.slice(0, 8).map((country) => (
                          <Badge
                            key={country}
                            variant={
                              formData.preferredCountries.includes(country)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer justify-center p-2"
                            onClick={() => handleCountryToggle(country)}
                          >
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferredSemester">
                        Preferred Semester
                      </Label>
                      <Select
                        value={formData.preferredSemester}
                        onValueChange={(value) =>
                          handleInputChange("preferredSemester", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fall">Fall Semester</SelectItem>
                          <SelectItem value="spring">
                            Spring Semester
                          </SelectItem>
                          <SelectItem value="summer">
                            Summer Semester
                          </SelectItem>
                          <SelectItem value="full-year">
                            Full Academic Year
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) =>
                          handleInputChange("duration", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-months">3 months</SelectItem>
                          <SelectItem value="4-months">4 months</SelectItem>
                          <SelectItem value="5-months">5 months</SelectItem>
                          <SelectItem value="6-months">6 months</SelectItem>
                          <SelectItem value="10-months">
                            10 months (Full Year)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Information
                        </>
                      )}
                    </Button>

                    {saved && (
                      <p className="text-green-600 text-sm text-center mt-2">
                        Your information has been saved successfully!
                      </p>
                    )}
                  </CardContent>
                </Card>
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
    props: {
      user: {
        id: session.user.id,
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        email: session.user.email,
      },
    },
  };
};
