import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
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
import { Separator } from "../src/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
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
  MapPin,
  Calendar,
  Trophy,
} from "lucide-react";

export default function HelpFutureStudents() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Help Future Students Form submitted:", formData);
    // Handle form submission
  };

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Polish",
    "Czech",
    "Greek",
    "Other",
  ];

  const helpTopics = [
    "University Application Process",
    "Course Selection & Matching",
    "Accommodation Hunting",
    "Visa & Documentation",
    "Budget Planning",
    "City Orientation",
    "Social Life & Making Friends",
    "Academic System",
    "Part-time Jobs",
    "Travel Tips",
    "Language Learning",
    "Cultural Adaptation",
    "Emergency Situations",
    "Local Customs",
    "Transportation",
  ];

  const specializations = [
    "Business/Economics",
    "Engineering",
    "Medicine/Health Sciences",
    "Computer Science/IT",
    "Arts & Humanities",
    "Social Sciences",
    "Natural Sciences",
    "Law",
    "Education",
    "Architecture",
    "Languages",
  ];

  const mentorStats = [
    { icon: Users, value: "245", label: "Active Mentors" },
    { icon: MessageSquare, value: "1,203", label: "Students Helped" },
    { icon: Star, value: "4.9", label: "Average Rating" },
    { icon: Heart, value: "96%", label: "Satisfaction Rate" },
  ];

  return (
    <>
      <Head>
        <title>Help Future Students - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Become a mentor and help future Erasmus students with their journey"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <Badge
                variant="secondary"
                className="mb-4 bg-purple-100 text-purple-700"
              >
                Mentorship Program
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Help Future Students
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Share your Erasmus experience and become a mentor to help future
                students navigate their journey abroad. Your insights can make a
                real difference.
              </p>
            </div>

            {/* Impact Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {mentorStats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Willingness to Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Mentorship Interest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="wantToHelp">
                      Would you like to help future Erasmus students?
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
                          Yes, I'd love to be a mentor
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="help-maybe" />
                        <Label htmlFor="help-maybe">
                          Maybe, depending on time availability
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="help-no" />
                        <Label htmlFor="help-no">
                          Not at this time, but maybe in the future
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.wantToHelp === "yes" ||
                  formData.wantToHelp === "maybe" ? (
                    <>
                      <div>
                        <Label htmlFor="availabilityLevel">
                          How much time can you dedicate to mentoring?
                        </Label>
                        <Select
                          value={formData.availabilityLevel}
                          onValueChange={(value) =>
                            handleInputChange("availabilityLevel", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="occasional">
                              Occasional (1-2 hours/month)
                            </SelectItem>
                            <SelectItem value="regular">
                              Regular (3-5 hours/month)
                            </SelectItem>
                            <SelectItem value="active">
                              Active (6-10 hours/month)
                            </SelectItem>
                            <SelectItem value="dedicated">
                              Dedicated (10+ hours/month)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="responseTime">
                          Expected response time to messages
                        </Label>
                        <Select
                          value={formData.responseTime}
                          onValueChange={(value) =>
                            handleInputChange("responseTime", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select response time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="within-24h">
                              Within 24 hours
                            </SelectItem>
                            <SelectItem value="within-48h">
                              Within 48 hours
                            </SelectItem>
                            <SelectItem value="within-week">
                              Within a week
                            </SelectItem>
                            <SelectItem value="when-possible">
                              When possible
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              {/* Contact Information */}
              {(formData.wantToHelp === "yes" ||
                formData.wantToHelp === "maybe") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="contactMethod">
                        Preferred contact method
                      </Label>
                      <Select
                        value={formData.contactMethod}
                        onValueChange={(value) =>
                          handleInputChange("contactMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How would you like to be contacted?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="website">
                            Personal Website
                          </SelectItem>
                          <SelectItem value="phone">Phone/WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="instagramUsername">
                          Instagram Username (optional)
                        </Label>
                        <Input
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="linkedinProfile">
                          LinkedIn Profile (optional)
                        </Label>
                        <Input
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedinProfile}
                          onChange={(e) =>
                            handleInputChange("linkedinProfile", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="personalWebsite">
                          Personal Website (optional)
                        </Label>
                        <Input
                          placeholder="https://yourwebsite.com"
                          value={formData.personalWebsite}
                          onChange={(e) =>
                            handleInputChange("personalWebsite", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferredContactTime">
                        Best time to contact you
                      </Label>
                      <Input
                        placeholder="e.g., Weekday evenings, Weekend mornings, etc."
                        value={formData.preferredContactTime}
                        onChange={(e) =>
                          handleInputChange(
                            "preferredContactTime",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Areas of Help */}
              {(formData.wantToHelp === "yes" ||
                formData.wantToHelp === "maybe") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Areas Where You Can Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Languages you can communicate in</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
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

                    <div>
                      <Label>Topics you can help with</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
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

                    <div>
                      <Label>Academic specializations</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
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
                    </div>

                    <div>
                      <Label htmlFor="otherSpecialization">
                        Other specialization (if not listed above)
                      </Label>
                      <Input
                        placeholder="Enter your field of study"
                        value={formData.otherSpecialization}
                        onChange={(e) =>
                          handleInputChange(
                            "otherSpecialization",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Personal Touch */}
              {(formData.wantToHelp === "yes" ||
                formData.wantToHelp === "maybe") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Touch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="nickname">
                        Preferred name/nickname for students to use
                      </Label>
                      <Input
                        placeholder="How would you like students to address you?"
                        value={formData.nickname}
                        onChange={(e) =>
                          handleInputChange("nickname", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="mentorshipExperience">
                        Previous mentoring or helping experience (optional)
                      </Label>
                      <Textarea
                        placeholder="Have you mentored students before? Any relevant experience..."
                        value={formData.mentorshipExperience}
                        onChange={(e) =>
                          handleInputChange(
                            "mentorshipExperience",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="funFact">
                        Fun fact about yourself or your Erasmus experience
                      </Label>
                      <Textarea
                        placeholder="Share something interesting that might help students connect with you..."
                        value={formData.funFact}
                        onChange={(e) =>
                          handleInputChange("funFact", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalAdvice">
                        Any additional advice for future Erasmus students?
                      </Label>
                      <Textarea
                        placeholder="Share your wisdom and key insights..."
                        value={formData.additionalAdvice}
                        onChange={(e) =>
                          handleInputChange("additionalAdvice", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Settings */}
              {(formData.wantToHelp === "yes" ||
                formData.wantToHelp === "maybe") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="publicProfile">
                        Allow your mentor profile to be publicly visible?
                      </Label>
                      <RadioGroup
                        value={formData.publicProfile}
                        onValueChange={(value) =>
                          handleInputChange("publicProfile", value)
                        }
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="public-yes" />
                          <Label htmlFor="public-yes">
                            Yes, students can find and contact me
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="public-no" />
                          <Label htmlFor="public-no">
                            No, only match me with students privately
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="allowPublicContact">
                        Allow students to contact you directly through the
                        platform?
                      </Label>
                      <RadioGroup
                        value={formData.allowPublicContact}
                        onValueChange={(value) =>
                          handleInputChange("allowPublicContact", value)
                        }
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="contact-yes" />
                          <Label htmlFor="contact-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="contact-no" />
                          <Label htmlFor="contact-no">
                            No, only through moderated connections
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-between">
                <Link href="/living-expenses">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                </Link>
                <Button type="submit">
                  {formData.wantToHelp === "yes" ||
                  formData.wantToHelp === "maybe"
                    ? "Join as Mentor"
                    : "Complete Form"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
