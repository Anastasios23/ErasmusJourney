import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
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
import { Avatar, AvatarFallback } from "../src/components/ui/avatar";
import Header from "../components/Header";
import {
  ArrowLeft,
  Heart,
  CheckCircle,
  Users,
  MessageSquare,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Star,
  Trophy,
} from "lucide-react";
import { useCommunityStats } from "../src/hooks/useCommunityStats";
import { Skeleton } from "../src/components/ui/skeleton";

export default function HelpFutureStudents() {
  const router = useRouter();
  const { submitForm, isSubmitting } = useFormSubmissions();
<<<<<<< HEAD
=======
  const { stats, loading } = useCommunityStats();
>>>>>>> origin/main

  const [formData, setFormData] = useState({
    wantToHelp: "",
    contactMethod: "",
    email: "",
    instagramUsername: "",
    facebookLink: "",
    linkedinProfile: "",
    personalWebsite: "",
    phoneNumber: "",
    preferredContactTime: "",
    languagesSpoken: [],
    helpTopics: [],
    availabilityLevel: "",
    mentorshipExperience: "",
    additionalAdvice: "",
    publicProfile: "",
    allowPublicContact: "",
    responseTime: "",
    specializations: [],
    otherSpecialization: "",
    funFact: "",
    nickname: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, item: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), item]
        : (prev[field as keyof typeof prev] as string[]).filter(
            (i) => i !== item,
          ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.wantToHelp) {
      toast.error("Please indicate if you want to help future students");
      return;
    }

    if (formData.wantToHelp === "yes") {
      if (!formData.contactMethod) {
        toast.error("Please select a preferred contact method");
        return;
      }

      if (formData.contactMethod === "email" && !formData.email) {
        toast.error("Please provide your email address");
        return;
      }

      if (formData.helpTopics.length === 0) {
        toast.error("Please select at least one topic you can help with");
        return;
      }

      if (!formData.availabilityLevel) {
        toast.error("Please select your availability level");
        return;
      }
    }

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        submissionType: "mentorship",
        wantToHelp: formData.wantToHelp === "yes",
      };

      await submitForm(
        "experience", // This will be converted to "EXPERIENCE" enum by the API
        `Mentorship Application - ${formData.nickname || "Anonymous"}`,
        submissionData,
        formData.publicProfile === "yes" ? "published" : "submitted", // Public mentors get published status
      );

      toast.success("Thank you for joining our mentor community! 🎉");

      // Redirect to community page after a short delay
      setTimeout(() => {
        router.push("/community");
      }, 2000);
    } catch (error) {
      console.error("Error submitting mentorship form:", error);
      toast.error("Failed to submit your application. Please try again.");
    }
  };

  const languages = [
    "English",
    "Greek",
    "German",
    "Spanish",
    "French",
    "Italian",
    "Portuguese",
    "Dutch",
    "Swedish",
    "Czech",
    "Polish",
    "Other",
  ];

  const helpTopics = [
    "Accommodation Search",
    "University Application",
    "Visa Requirements",
    "Course Selection",
    "Budget Planning",
    "Cultural Adaptation",
    "Language Learning",
    "Social Activities",
    "Travel Tips",
    "Academic Support",
    "Career Guidance",
    "Emergency Situations",
  ];

  const specializations = [
    "Engineering",
    "Business",
    "Medicine",
    "Computer Science",
    "Arts & Design",
    "Law",
    "Psychology",
    "Languages",
    "Sciences",
    "Architecture",
    "Education",
    "Social Work",
    "Other",
  ];

  // Mock testimonials
  const testimonials = [
    {
      id: "1",
      studentName: "Maria K.",
      city: "Barcelona",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: "2",
      studentName: "Alex M.",
      city: "Vienna",
      rating: 4,
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: "3",
      studentName: "Lisa T.",
      city: "Prague",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <>
      <Head>
        <title>Help Future Students - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Join our mentor community and help future Erasmus students"
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
                  Step 5 of 5
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">
                  Helping Future Erasmus Students
                </h1>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Heart className="h-12 w-12 text-green-200 mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Become a Mentor
            </h2>
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              Your experience could be exactly what someone needs to succeed.
              Join our community of student mentors and make a real difference.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {loading ? (
                <>
                  <div>
                    <Skeleton className="h-8 w-24 mx-auto bg-green-400/30" />
                    <Skeleton className="h-4 w-32 mx-auto mt-2 bg-green-400/20" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-24 mx-auto bg-blue-400/30" />
                    <Skeleton className="h-4 w-32 mx-auto mt-2 bg-blue-400/20" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-24 mx-auto bg-yellow-400/30" />
                    <Skeleton className="h-4 w-32 mx-auto mt-2 bg-yellow-400/20" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-2xl font-bold text-green-200 mb-1">
                      {stats.countriesFeatured}+
                    </div>
                    <div className="text-sm">Countries Featured</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-200 mb-1">
                      {stats.studentsHelped.toLocaleString()}
                    </div>
                    <div className="text-sm">Students Helped</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-200 mb-1">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm">Average Rating</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Decision */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Join Our Mentor Community
                </CardTitle>
                <p className="text-gray-600">
                  Help future Erasmus students by sharing your experience and
                  providing guidance
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Do you want to be a point of contact and help other future
                      Erasmus Students?
                    </Label>
                    <RadioGroup
                      value={formData.wantToHelp}
                      onValueChange={(value) =>
                        handleInputChange("wantToHelp", value)
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="help-yes" />
                        <Label htmlFor="help-yes">
                          Yes, I want to help future students! 🌟
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="help-no" />
                        <Label htmlFor="help-no">No, not at this time</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.wantToHelp === "no" && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        No problem! You can always change your mind later. Your
                        experience story will still help future students even
                        without direct mentoring.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {formData.wantToHelp === "yes" && (
              <>
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contact Information
                    </CardTitle>
                    <p className="text-gray-600">
                      How would you like future students to contact you?
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactMethod">
                        Preferred Contact Method
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("contactMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="multiple">
                            Multiple Methods
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="instagramUsername"
                          className="flex items-center"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram Username
                        </Label>
                        <Input
                          id="instagramUsername"
                          placeholder="@yourusername"
                          value={formData.instagramUsername}
                          onChange={(e) =>
                            handleInputChange(
                              "instagramUsername",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="facebookLink"
                          className="flex items-center"
                        >
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook Profile Link
                        </Label>
                        <Input
                          id="facebookLink"
                          placeholder="https://facebook.com/yourprofile"
                          value={formData.facebookLink}
                          onChange={(e) =>
                            handleInputChange("facebookLink", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="linkedinProfile"
                          className="flex items-center"
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn Profile
                        </Label>
                        <Input
                          id="linkedinProfile"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedinProfile}
                          onChange={(e) =>
                            handleInputChange("linkedinProfile", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="personalWebsite"
                        className="flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Personal Website (Optional)
                      </Label>
                      <Input
                        id="personalWebsite"
                        placeholder="https://yourwebsite.com"
                        value={formData.personalWebsite}
                        onChange={(e) =>
                          handleInputChange("personalWebsite", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Mentor Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Mentor Profile
                    </CardTitle>
                    <p className="text-gray-600">
                      Help students understand how you can help them
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">
                          Preferred Name/Nickname
                        </Label>
                        <Input
                          id="nickname"
                          placeholder="What should students call you?"
                          value={formData.nickname}
                          onChange={(e) =>
                            handleInputChange("nickname", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responseTime">
                          Expected Response Time
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            handleInputChange("responseTime", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="How quickly do you respond?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="same-day">Same Day</SelectItem>
                            <SelectItem value="1-2-days">1-2 Days</SelectItem>
                            <SelectItem value="3-5-days">3-5 Days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Languages You Speak</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {languages.map((language) => (
                          <div
                            key={language}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={language}
                              checked={formData.languagesSpoken.includes(
                                language,
                              )}
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  "languagesSpoken",
                                  language,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={language} className="text-sm">
                              {language}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Areas You Can Help With</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {helpTopics.map((topic) => (
                          <div
                            key={topic}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={topic}
                              checked={formData.helpTopics.includes(topic)}
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  "helpTopics",
                                  topic,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={topic} className="text-sm">
                              {topic}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Academic Specializations</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {specializations.map((spec) => (
                          <div
                            key={spec}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={spec}
                              checked={formData.specializations.includes(spec)}
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  "specializations",
                                  spec,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={spec} className="text-sm">
                              {spec}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.specializations.includes("Other") && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="otherSpecialization">
                            Please specify your specialization
                          </Label>
                          <Input
                            id="otherSpecialization"
                            placeholder="Enter your academic specialization..."
                            value={formData.otherSpecialization}
                            onChange={(e) =>
                              handleInputChange(
                                "otherSpecialization",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availabilityLevel">
                        Availability Level
                      </Label>
                      <RadioGroup
                        value={formData.availabilityLevel}
                        onValueChange={(value) =>
                          handleInputChange("availabilityLevel", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="availability-high" />
                          <Label htmlFor="availability-high">
                            High - I love helping and have lots of time
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="medium"
                            id="availability-medium"
                          />
                          <Label htmlFor="availability-medium">
                            Medium - I can help occasionally
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="availability-low" />
                          <Label htmlFor="availability-low">
                            Low - Only for important questions
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Privacy & Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">
                          Create a public mentor profile?
                        </Label>
                        <p className="text-sm text-gray-600 mb-2">
                          This will allow students to find you in our mentor
                          directory
                        </p>
                        <RadioGroup
                          value={formData.publicProfile}
                          onValueChange={(value) =>
                            handleInputChange("publicProfile", value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="public-yes" />
                            <Label htmlFor="public-yes">
                              Yes, make my profile public
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="public-no" />
                            <Label htmlFor="public-no">
                              No, only contact through forms
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Allow students to contact you directly?
                        </Label>
                        <p className="text-sm text-gray-600 mb-2">
                          Students can reach out to you without going through
                          our platform
                        </p>
                        <RadioGroup
                          value={formData.allowPublicContact}
                          onValueChange={(value) =>
                            handleInputChange("allowPublicContact", value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="contact-yes" />
                            <Label htmlFor="contact-yes">
                              Yes, I'm open to direct contact
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="contact-no" />
                            <Label htmlFor="contact-no">
                              No, prefer platform messaging only
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Current Mentors Preview */}
            {formData.wantToHelp === "yes" && (
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Join These Amazing Mentors
                  </CardTitle>
                  <p className="text-gray-600">
                    You'll be joining a community of experienced students who
                    are making a difference
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {testimonial.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {testimonial.studentName}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {testimonial.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < testimonial.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-3">
                          "Ready to help future students with accommodation and
                          city life in {testimonial.city}!"
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Call to Action */}
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-200 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  {formData.wantToHelp === "yes"
                    ? "You're Almost Ready to Start Helping!"
                    : "Complete Your Erasmus Journey"}
                </h3>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                  {formData.wantToHelp === "yes"
                    ? "Thank you for choosing to help future students! Your experience and guidance will be invaluable to students planning their Erasmus journey."
                    : "Thank you for sharing your complete Erasmus experience! Your story will help countless future students make informed decisions."}
                </p>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8">
              <Link href="/living-expenses">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Living Expenses
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-8"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Complete Application"}
              </Button>
            </div>
          </form>
        </div>

        {/* Thank You Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Thank You for Your Journey
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Whether you choose to mentor or not, sharing your experience helps
              build a stronger Erasmus community for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Explore Community
                </Button>
              </Link>
              <Link href="/experiences">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Read Other Stories
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
