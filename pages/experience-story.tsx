import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
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
import { EnhancedInput } from "../src/components/ui/enhanced-input";
import {
  EnhancedSelect,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
  EnhancedSelectContent,
  EnhancedSelectItem,
} from "../src/components/ui/enhanced-select";
import { EnhancedTextarea } from "../src/components/ui/enhanced-textarea";
import {
  FormField,
  FormSection,
  FormGrid,
  DisabledFieldHint,
} from "../src/components/ui/form-components";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import { Slider } from "../src/components/ui/slider";
import Header from "../components/Header";
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Heart,
  MessageSquare,
  Users,
  Camera,
  BookOpen,
  Globe,
  Save,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Award,
} from "lucide-react";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
import { FormType } from "../src/types/forms";

interface RatingField {
  key: string;
  label: string;
  description: string;
  icon: any;
}

const ratingFields: RatingField[] = [
  {
    key: "academicRating",
    label: "Academic Experience",
    description: "Quality of courses, professors, and learning environment",
    icon: BookOpen,
  },
  {
    key: "socialLifeRating",
    label: "Social Life",
    description: "Making friends, social activities, and community",
    icon: Users,
  },
  {
    key: "culturalImmersionRating",
    label: "Cultural Immersion",
    description: "Language learning, cultural understanding, and integration",
    icon: Globe,
  },
  {
    key: "costOfLivingRating",
    label: "Cost of Living",
    description: "Affordability and value for money",
    icon: Target,
  },
  {
    key: "accommodationRating",
    label: "Accommodation",
    description: "Housing quality, location, and satisfaction",
    icon: Award,
  },
];

const helpTopics = [
  "Course Selection & Registration",
  "Accommodation & Housing",
  "Visa & Legal Requirements",
  "Budget & Financial Planning",
  "Transportation & Travel",
  "Language Learning",
  "Cultural Adaptation",
  "Making Friends & Social Life",
  "Academic Support",
  "Health & Medical Services",
  "Part-time Work & Internships",
  "Shopping & Daily Life",
  "Emergency Situations",
  "Return Planning",
];

const tipCategories = [
  {
    key: "socialTips",
    label: "Social & Friendship Tips",
    placeholder: "How to make friends, join activities, meet locals...",
  },
  {
    key: "culturalTips",
    label: "Cultural Adaptation Tips",
    placeholder: "Language barriers, customs, traditions to be aware of...",
  },
  {
    key: "travelTips",
    label: "Travel & Exploration Tips",
    placeholder: "Best places to visit, travel deals, weekend trips...",
  },
  {
    key: "academicTips",
    label: "Academic Success Tips & Course Matching",
    placeholder:
      "Study strategies, professor relationships, course selection advice, credit transfer tips, best courses to take, courses to avoid, academic preparation advice...",
  },
  {
    key: "practicalTips",
    label: "Practical Life Tips",
    placeholder: "Banking, shopping, public transport, administrative tasks...",
  },
];

export default function ExperienceStory() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: "anonymous", email: "anonymous@example.com" } };
  const status = "authenticated";
  const router = useRouter();
  const {
    submitForm,
    loading: isSubmitting,
    submissions,
    refreshSubmissions,
  } = useFormSubmissions();
  const [currentStep, setCurrentStep] = useState(1);
  const [existingBasicInfo, setExistingBasicInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Experience
    personalExperience: "",
    adviceForFutureStudents: "",
    favoriteMemory: "",
    biggestChallenge: "",
    unexpectedDiscovery: "",

    // Ratings (1-5 scale)
    academicRating: 0,
    socialLifeRating: 0,
    culturalImmersionRating: 0,
    costOfLivingRating: 0,
    accommodationRating: 0,
    overallRating: 0,

    // Tips by category
    socialTips: "",
    culturalTips: "",
    travelTips: "",
    academicTips: "",
    practicalTips: "",

    // Help topics
    helpTopics: [] as string[],

    // Contact preferences
    publicProfile: "no",
    wantToHelp: "no",
    contactMethod: "",
    email: "",
    instagramUsername: "",
    facebookLink: "",
    linkedinProfile: "",
    personalWebsite: "",
    phoneNumber: "",
    nickname: "",

    // Additional details
    languagesLearned: "",
    skillsDeveloped: "",
    careerImpact: "",
    personalGrowth: "",
    recommendExchange: "yes",
    recommendationReason: "",
  });

  // Load existing basic info on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const basicInfo = submissions.find((s) => s.type === "basic-info");

          if (basicInfo) {
            setExistingBasicInfo(basicInfo);
            // Pre-populate email if available
            if (basicInfo.data?.email) {
              setFormData((prev) => ({ ...prev, email: basicInfo.data.email }));
            }
          }
        } catch (error) {
          console.error("Error loading existing data:", error);
        }
      }
      setIsLoading(false);
    };

    loadExistingData();
  }, [status, session, submissions]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRatingChange = (field: string, value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value[0],
    }));
  };

  const handleHelpTopicToggle = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      helpTopics: prev.helpTopics.includes(topic)
        ? prev.helpTopics.filter((t) => t !== topic)
        : [...prev.helpTopics, topic],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.personalExperience?.trim()) {
          toast.error("Please share your personal experience");
          return false;
        }
        if (!formData.adviceForFutureStudents?.trim()) {
          toast.error("Please provide advice for future students");
          return false;
        }
        return true;
      case 2:
        if (formData.overallRating === 0) {
          toast.error("Please provide an overall rating");
          return false;
        }
        return true;
      case 3:
        // Tips are optional but at least one should be provided
        const hasTips = tipCategories.some((cat) =>
          formData[cat.key as keyof typeof formData]?.toString().trim(),
        );
        if (!hasTips) {
          toast.error("Please provide at least one tip for future students");
          return false;
        }
        return true;
      case 4:
        if (formData.wantToHelp === "yes") {
          if (!formData.nickname?.trim()) {
            toast.error("Please provide a nickname for your mentor profile");
            return false;
          }
          if (!formData.contactMethod) {
            toast.error("Please select a contact method");
            return false;
          }
          if (formData.contactMethod === "email" && !formData.email?.trim()) {
            toast.error("Please provide your email address");
            return false;
          }
          if (formData.helpTopics.length === 0) {
            toast.error("Please select at least one help topic");
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const calculateOverallRating = () => {
    const ratings = [
      formData.academicRating,
      formData.socialLifeRating,
      formData.culturalImmersionRating,
      formData.costOfLivingRating,
      formData.accommodationRating,
    ].filter((r) => r > 0);

    if (ratings.length === 0) return 0;
    return Math.round(
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
    );
  };

  useEffect(() => {
    const overall = calculateOverallRating();
    if (overall > 0 && overall !== formData.overallRating) {
      setFormData((prev) => ({ ...prev, overallRating: overall }));
    }
  }, [
    formData.academicRating,
    formData.socialLifeRating,
    formData.culturalImmersionRating,
    formData.costOfLivingRating,
    formData.accommodationRating,
  ]);

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      await submitForm(
        "experience" as FormType,
        "My Erasmus Experience & Story",
        formData,
        "submitted",
        existingBasicInfo?.id,
      );

      toast.success("Your experience story has been submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting experience story:", error);
      toast.error("Failed to submit your story. Please try again.");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // if (status === "unauthenticated") {
  //   return (
  //     <div className="min-h-screen bg-white">
  //       <Header />
  //       <div className="pt-20 flex items-center justify-center">
  //         <Card className="w-full max-w-md">
  //           <CardHeader>
  //             <CardTitle className="text-center">Sign In Required</CardTitle>
  //           </CardHeader>
  //           <CardContent className="text-center">
  //             <p className="text-gray-600 mb-4">
  //               Please sign in to share your Erasmus experience.
  //             </p>
  //             <Link href="/login">
  //               <Button>Sign In</Button>
  //             </Link>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Head>
        <title>Share Your Experience - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your complete Erasmus experience to help future students"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <MessageSquare className="h-4 w-4 mr-2" />
                Experience Story
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Share Your Erasmus Experience
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tell your complete story to inspire and guide future students.
                Your experience can make their journey smoother and more
                successful.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-500">
                  Step {currentStep} of 4
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span
                  className={
                    currentStep >= 1 ? "text-blue-600 font-medium" : ""
                  }
                >
                  Story
                </span>
                <span
                  className={
                    currentStep >= 2 ? "text-blue-600 font-medium" : ""
                  }
                >
                  Ratings
                </span>
                <span
                  className={
                    currentStep >= 3 ? "text-blue-600 font-medium" : ""
                  }
                >
                  Tips
                </span>
                <span
                  className={
                    currentStep >= 4 ? "text-blue-600 font-medium" : ""
                  }
                >
                  Contact
                </span>
              </div>
            </div>

            {/* Step 1: Personal Experience */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Your Erasmus Story
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField>
                    <Label htmlFor="personalExperience">
                      Tell us about your personal experience{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <EnhancedTextarea
                      id="personalExperience"
                      placeholder="Describe your overall Erasmus experience. What was it like? What did you enjoy most? How did it change you as a person? Be detailed and authentic..."
                      value={formData.personalExperience}
                      onChange={(e) =>
                        handleInputChange("personalExperience", e.target.value)
                      }
                      rows={6}
                      required
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor="adviceForFutureStudents">
                      Advice for future students{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <EnhancedTextarea
                      id="adviceForFutureStudents"
                      placeholder="What advice would you give to students considering a similar exchange? What do you wish you had known before going?"
                      value={formData.adviceForFutureStudents}
                      onChange={(e) =>
                        handleInputChange(
                          "adviceForFutureStudents",
                          e.target.value,
                        )
                      }
                      rows={4}
                      required
                    />
                  </FormField>

                  <FormGrid columns={2}>
                    <FormField>
                      <Label htmlFor="favoriteMemory">Favorite memory</Label>
                      <EnhancedTextarea
                        id="favoriteMemory"
                        placeholder="What's your most cherished memory from your exchange?"
                        value={formData.favoriteMemory}
                        onChange={(e) =>
                          handleInputChange("favoriteMemory", e.target.value)
                        }
                        rows={3}
                      />
                    </FormField>

                    <FormField>
                      <Label htmlFor="biggestChallenge">
                        Biggest challenge
                      </Label>
                      <EnhancedTextarea
                        id="biggestChallenge"
                        placeholder="What was the most difficult part and how did you overcome it?"
                        value={formData.biggestChallenge}
                        onChange={(e) =>
                          handleInputChange("biggestChallenge", e.target.value)
                        }
                        rows={3}
                      />
                    </FormField>
                  </FormGrid>

                  <FormField>
                    <Label htmlFor="unexpectedDiscovery">
                      Unexpected discovery
                    </Label>
                    <EnhancedTextarea
                      id="unexpectedDiscovery"
                      placeholder="What surprised you the most? What did you discover that you didn't expect?"
                      value={formData.unexpectedDiscovery}
                      onChange={(e) =>
                        handleInputChange("unexpectedDiscovery", e.target.value)
                      }
                      rows={3}
                    />
                  </FormField>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Ratings */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Rate Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {ratingFields.map((field) => {
                    const IconComponent = field.icon;
                    const value = formData[
                      field.key as keyof typeof formData
                    ] as number;

                    return (
                      <div key={field.key} className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <div>
                            <Label className="text-base font-medium">
                              {field.label}
                            </Label>
                            <p className="text-sm text-gray-600">
                              {field.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 w-8">
                            Poor
                          </span>
                          <Slider
                            value={[value]}
                            onValueChange={(v) =>
                              handleRatingChange(field.key, v)
                            }
                            max={5}
                            min={1}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500 w-12">
                            Excellent
                          </span>
                          <div className="w-16 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= value
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">
                              {value > 0 ? value : "-"}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <Label className="text-lg font-semibold">
                          Overall Rating
                        </Label>
                        <p className="text-sm text-gray-600">
                          Calculated from your ratings above
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-6 w-6 ${
                                star <= formData.overallRating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                          {formData.overallRating > 0
                            ? formData.overallRating
                            : "-"}
                          /5
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Tips & Growth */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Share Your Tips & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {tipCategories.map((category) => (
                      <FormField key={category.key}>
                        <Label htmlFor={category.key}>{category.label}</Label>
                        <EnhancedTextarea
                          id={category.key}
                          placeholder={category.placeholder}
                          value={
                            (formData[
                              category.key as keyof typeof formData
                            ] as string) || ""
                          }
                          onChange={(e) =>
                            handleInputChange(category.key, e.target.value)
                          }
                          rows={3}
                        />
                      </FormField>
                    ))}
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Personal Development
                    </h3>

                    <FormGrid columns={2}>
                      <FormField>
                        <Label htmlFor="languagesLearned">
                          Languages learned/improved
                        </Label>
                        <EnhancedInput
                          id="languagesLearned"
                          placeholder="e.g., Spanish (intermediate), French (basic)"
                          value={formData.languagesLearned}
                          onChange={(e) =>
                            handleInputChange(
                              "languagesLearned",
                              e.target.value,
                            )
                          }
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="skillsDeveloped">
                          Skills developed
                        </Label>
                        <EnhancedInput
                          id="skillsDeveloped"
                          placeholder="e.g., independence, adaptability, communication"
                          value={formData.skillsDeveloped}
                          onChange={(e) =>
                            handleInputChange("skillsDeveloped", e.target.value)
                          }
                        />
                      </FormField>
                    </FormGrid>

                    <FormField>
                      <Label htmlFor="careerImpact">
                        Impact on career/studies
                      </Label>
                      <EnhancedTextarea
                        id="careerImpact"
                        placeholder="How has this experience influenced your career goals or academic path?"
                        value={formData.careerImpact}
                        onChange={(e) =>
                          handleInputChange("careerImpact", e.target.value)
                        }
                        rows={3}
                      />
                    </FormField>

                    <FormField>
                      <Label htmlFor="personalGrowth">Personal growth</Label>
                      <EnhancedTextarea
                        id="personalGrowth"
                        placeholder="How have you grown as a person? What have you learned about yourself?"
                        value={formData.personalGrowth}
                        onChange={(e) =>
                          handleInputChange("personalGrowth", e.target.value)
                        }
                        rows={3}
                      />
                    </FormField>
                  </div>

                  <div className="border-t pt-6">
                    <FormField>
                      <Label>Would you recommend an Erasmus exchange?</Label>
                      <RadioGroup
                        value={formData.recommendExchange}
                        onValueChange={(value) =>
                          handleInputChange("recommendExchange", value)
                        }
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="rec-yes" />
                          <Label htmlFor="rec-yes">Definitely yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="maybe" id="rec-maybe" />
                          <Label htmlFor="rec-maybe">It depends</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="rec-no" />
                          <Label htmlFor="rec-no">Not really</Label>
                        </div>
                      </RadioGroup>
                    </FormField>

                    <FormField>
                      <Label htmlFor="recommendationReason">Why?</Label>
                      <EnhancedTextarea
                        id="recommendationReason"
                        placeholder="Explain your recommendation..."
                        value={formData.recommendationReason}
                        onChange={(e) =>
                          handleInputChange(
                            "recommendationReason",
                            e.target.value,
                          )
                        }
                        rows={3}
                      />
                    </FormField>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Contact & Mentorship */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Help Future Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField>
                    <Label>Would you like to help future students?</Label>
                    <RadioGroup
                      value={formData.wantToHelp}
                      onValueChange={(value) =>
                        handleInputChange("wantToHelp", value)
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="help-yes" />
                        <Label htmlFor="help-yes">
                          Yes, I'd love to mentor and answer questions
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="help-maybe" />
                        <Label htmlFor="help-maybe">
                          Maybe, contact me first
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="help-no" />
                        <Label htmlFor="help-no">
                          No, just sharing my story
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>

                  {(formData.wantToHelp === "yes" ||
                    formData.wantToHelp === "maybe") && (
                    <div className="space-y-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800">
                        Mentor Profile Setup
                      </h3>

                      <FormField>
                        <Label htmlFor="nickname">
                          Display name/nickname{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <EnhancedInput
                          id="nickname"
                          placeholder="How should students know you? (e.g., Alex_Barcelona_2023)"
                          value={formData.nickname}
                          onChange={(e) =>
                            handleInputChange("nickname", e.target.value)
                          }
                          required={formData.wantToHelp === "yes"}
                        />
                      </FormField>

                      <FormField>
                        <Label>
                          What topics can you help with?{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {helpTopics.map((topic) => (
                            <div
                              key={topic}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`topic-${topic}`}
                                checked={formData.helpTopics.includes(topic)}
                                onCheckedChange={() =>
                                  handleHelpTopicToggle(topic)
                                }
                              />
                              <Label
                                htmlFor={`topic-${topic}`}
                                className="text-sm"
                              >
                                {topic}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormField>

                      <FormField>
                        <Label>
                          Preferred contact method{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <EnhancedSelect
                          value={formData.contactMethod}
                          onValueChange={(value) =>
                            handleInputChange("contactMethod", value)
                          }
                        >
                          <EnhancedSelectTrigger>
                            <EnhancedSelectValue placeholder="Choose how students can reach you" />
                          </EnhancedSelectTrigger>
                          <EnhancedSelectContent>
                            <EnhancedSelectItem value="email">
                              Email
                            </EnhancedSelectItem>
                            <EnhancedSelectItem value="instagram">
                              Instagram
                            </EnhancedSelectItem>
                            <EnhancedSelectItem value="facebook">
                              Facebook
                            </EnhancedSelectItem>
                            <EnhancedSelectItem value="linkedin">
                              LinkedIn
                            </EnhancedSelectItem>
                            <EnhancedSelectItem value="website">
                              Personal Website
                            </EnhancedSelectItem>
                          </EnhancedSelectContent>
                        </EnhancedSelect>
                      </FormField>

                      <FormGrid columns={2}>
                        {formData.contactMethod === "email" && (
                          <FormField>
                            <Label htmlFor="email">
                              Email address{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <EnhancedInput
                              id="email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              required
                            />
                          </FormField>
                        )}

                        {formData.contactMethod === "instagram" && (
                          <FormField>
                            <Label htmlFor="instagramUsername">
                              Instagram username
                            </Label>
                            <EnhancedInput
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
                          </FormField>
                        )}

                        {formData.contactMethod === "facebook" && (
                          <FormField>
                            <Label htmlFor="facebookLink">
                              Facebook profile
                            </Label>
                            <EnhancedInput
                              id="facebookLink"
                              placeholder="https://facebook.com/yourprofile"
                              value={formData.facebookLink}
                              onChange={(e) =>
                                handleInputChange(
                                  "facebookLink",
                                  e.target.value,
                                )
                              }
                            />
                          </FormField>
                        )}

                        {formData.contactMethod === "linkedin" && (
                          <FormField>
                            <Label htmlFor="linkedinProfile">
                              LinkedIn profile
                            </Label>
                            <EnhancedInput
                              id="linkedinProfile"
                              placeholder="https://linkedin.com/in/yourprofile"
                              value={formData.linkedinProfile}
                              onChange={(e) =>
                                handleInputChange(
                                  "linkedinProfile",
                                  e.target.value,
                                )
                              }
                            />
                          </FormField>
                        )}

                        {formData.contactMethod === "website" && (
                          <FormField>
                            <Label htmlFor="personalWebsite">
                              Personal website
                            </Label>
                            <EnhancedInput
                              id="personalWebsite"
                              placeholder="https://yourwebsite.com"
                              value={formData.personalWebsite}
                              onChange={(e) =>
                                handleInputChange(
                                  "personalWebsite",
                                  e.target.value,
                                )
                              }
                            />
                          </FormField>
                        )}
                      </FormGrid>
                    </div>
                  )}

                  <FormField>
                    <Label>Make my profile public?</Label>
                    <RadioGroup
                      value={formData.publicProfile}
                      onValueChange={(value) =>
                        handleInputChange("publicProfile", value)
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="public-yes" />
                        <Label htmlFor="public-yes">
                          Yes, share my story and contact info publicly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="public-no" />
                        <Label htmlFor="public-no">
                          No, keep my story anonymous
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <div>
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <Link href="/share-story">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Options
                    </Button>
                  </Link>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {existingBasicInfo ? (
                    <>Linked to your basic information submission</>
                  ) : (
                    <>Complete basic information first for better linking</>
                  )}
                </p>
              </div>

              <div>
                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Experience Story"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
