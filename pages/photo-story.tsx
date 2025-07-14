import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
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
import { Progress } from "../src/components/ui/progress";
import { Separator } from "../src/components/ui/separator";
import Header from "../components/Header";
import {
  Camera,
  Upload,
  X,
  MapPin,
  Calendar,
  Star,
  Users,
  Heart,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  MessageSquare,
  Share2,
  Download,
  Globe,
  Clock,
  Zap,
} from "lucide-react";

interface PhotoStoryEntry {
  id: string;
  image: File | null;
  imagePreview: string;
  title: string;
  caption: string;
  location: string;
  date: string;
  category: string;
  mood: string;
}

export default function PhotoStory() {
  const router = useRouter();
  const { submitForm } = useFormSubmissions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    homeUniversity: "",
    hostUniversity: "",
    city: "",
    country: "",
    semester: "",
    year: "",
    storyTitle: "",
    overallDescription: "",
    favoriteMemory: "",
    advice: "",
    allowPublicUse: false,
    allowContact: false,
  });

  const [photos, setPhotos] = useState<PhotoStoryEntry[]>([
    {
      id: "1",
      image: null,
      imagePreview: "",
      title: "",
      caption: "",
      location: "",
      date: "",
      category: "",
      mood: "",
    },
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Accommodation",
    "University Life",
    "City Exploration",
    "Food & Dining",
    "Travel & Weekend Trips",
    "Friends & Social Life",
    "Cultural Experiences",
    "Nightlife",
    "Nature & Outdoors",
    "Local Events",
    "Transportation",
    "Shopping",
  ];

  const moods = [
    "😊 Happy",
    "🤩 Excited",
    "😍 In Love",
    "🤗 Grateful",
    "😄 Fun",
    "🧐 Curious",
    "😌 Peaceful",
    "💪 Accomplished",
    "🥰 Nostalgic",
    "😎 Cool",
    "🤔 Thoughtful",
    "🎉 Celebratory",
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhotos = [...photos];
      newPhotos[index] = {
        ...newPhotos[index],
        image: file,
        imagePreview: e.target?.result as string,
      };
      setPhotos(newPhotos);

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    };
    reader.readAsDataURL(file);
  };

  const updatePhotoData = (
    index: number,
    field: keyof PhotoStoryEntry,
    value: string,
  ) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], [field]: value };
    setPhotos(newPhotos);
  };

  const addPhoto = () => {
    const newPhoto: PhotoStoryEntry = {
      id: Date.now().toString(),
      image: null,
      imagePreview: "",
      title: "",
      caption: "",
      location: "",
      date: "",
      category: "",
      mood: "",
    };
    setPhotos([...photos, newPhoto]);
  };

  const removePhoto = (index: number) => {
    if (photos.length > 1) {
      const newPhotos = photos.filter((_, i) => i !== index);
      setPhotos(newPhotos);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.storyTitle || !formData.overallDescription) {
        toast.error("Please fill in the story title and description");
        return;
      }

      if (photos.filter((photo) => photo.image).length === 0) {
        toast.error("Please add at least one photo to your story");
        return;
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        photos: photos.filter((photo) => photo.image), // Only include photos with images
        submissionType: "photo-story",
        allowPublicUse: formData.allowPublicUse || false,
      };

      await submitForm(
        "story", // This will be converted to "STORY" enum by the API
        formData.storyTitle,
        submissionData,
        "published", // Make stories public by default
      );

      toast.success("Your photo story has been submitted successfully!");

      // Redirect to stories page after a short delay
      setTimeout(() => {
        router.push("/student-stories");
      }, 2000);
    } catch (error) {
      console.error("Error submitting photo story:", error);
      toast.error("Failed to submit your story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    const filledFields = Object.values(formData).filter((value) =>
      typeof value === "string" ? value.trim() !== "" : value,
    ).length;
    const photosWithImages = photos.filter((photo) => photo.image).length;
    const totalFields = Object.keys(formData).length + photos.length;
    return Math.round(((filledFields + photosWithImages) / totalFields) * 100);
  };

  return (
    <>
      <Head>
        <title>Photo Story - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your Erasmus experience through photos and stories"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge
                variant="secondary"
                className="mb-4 bg-green-100 text-green-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Photo Story
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Share Your Visual Journey
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Create a photo story of your Erasmus experience to inspire and
                help future students. Pictures tell a thousand words!
              </p>
            </div>

            {/* Progress Bar */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Story Completion</span>
                  <span className="text-sm text-gray-500">
                    {getCompletionPercentage()}%
                  </span>
                </div>
                <Progress value={getCompletionPercentage()} className="h-2" />
              </CardContent>
            </Card>

            {/* Step Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                <Button
                  variant={currentStep === 1 ? "default" : "outline"}
                  onClick={() => setCurrentStep(1)}
                  size="sm"
                >
                  1. Basic Info
                </Button>
                <Button
                  variant={currentStep === 2 ? "default" : "outline"}
                  onClick={() => setCurrentStep(2)}
                  size="sm"
                >
                  2. Photos
                </Button>
                <Button
                  variant={currentStep === 3 ? "default" : "outline"}
                  onClick={() => setCurrentStep(3)}
                  size="sm"
                >
                  3. Story
                </Button>
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="studentName">Your Name</Label>
                      <Input
                        id="studentName"
                        placeholder="Enter your name"
                        value={formData.studentName}
                        onChange={(e) =>
                          handleInputChange("studentName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@university.edu"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="homeUniversity">Home University</Label>
                      <Input
                        id="homeUniversity"
                        placeholder="Your home university"
                        value={formData.homeUniversity}
                        onChange={(e) =>
                          handleInputChange("homeUniversity", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="hostUniversity">Host University</Label>
                      <Input
                        id="hostUniversity"
                        placeholder="University you visited"
                        value={formData.hostUniversity}
                        onChange={(e) =>
                          handleInputChange("hostUniversity", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City you studied in"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="Country you studied in"
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={formData.semester}
                        onValueChange={(value) =>
                          handleInputChange("semester", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fall">Fall</SelectItem>
                          <SelectItem value="spring">Spring</SelectItem>
                          <SelectItem value="summer">Summer</SelectItem>
                          <SelectItem value="full-year">Full Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Academic Year</Label>
                      <Input
                        id="year"
                        placeholder="e.g., 2023/2024"
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Photo Upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Upload Your Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">
                      Upload photos from your Erasmus experience. Add captions
                      and details to each photo to tell your story.
                    </p>

                    <div className="space-y-6">
                      {photos.map((photo, index) => (
                        <Card key={photo.id} className="border-2 border-dashed">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">
                                Photo {index + 1}
                              </h3>
                              {photos.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removePhoto(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Image Upload */}
                              <div>
                                <Label>Photo</Label>
                                <div className="mt-2">
                                  {photo.imagePreview ? (
                                    <div className="relative w-full h-48">
                                      <Image
                                        src={photo.imagePreview}
                                        alt={`Photo ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                      />
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                          const newPhotos = [...photos];
                                          newPhotos[index] = {
                                            ...newPhotos[index],
                                            image: null,
                                            imagePreview: "",
                                          };
                                          setPhotos(newPhotos);
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                      <div className="mt-4">
                                        <input
                                          ref={fileInputRef}
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handlePhotoUpload(index, file);
                                            }
                                          }}
                                          className="hidden"
                                        />
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            fileInputRef.current?.click()
                                          }
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload Photo
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                  <Progress
                                    value={uploadProgress}
                                    className="mt-2"
                                  />
                                )}
                              </div>

                              {/* Photo Details */}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`title-${index}`}>
                                    Photo Title
                                  </Label>
                                  <Input
                                    id={`title-${index}`}
                                    placeholder="Give your photo a title"
                                    value={photo.title}
                                    onChange={(e) =>
                                      updatePhotoData(
                                        index,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div>
                                  <Label htmlFor={`caption-${index}`}>
                                    Caption
                                  </Label>
                                  <Textarea
                                    id={`caption-${index}`}
                                    placeholder="Describe what's happening in this photo..."
                                    value={photo.caption}
                                    onChange={(e) =>
                                      updatePhotoData(
                                        index,
                                        "caption",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`location-${index}`}>
                                      Location
                                    </Label>
                                    <Input
                                      id={`location-${index}`}
                                      placeholder="Where was this taken?"
                                      value={photo.location}
                                      onChange={(e) =>
                                        updatePhotoData(
                                          index,
                                          "location",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`date-${index}`}>
                                      Date
                                    </Label>
                                    <Input
                                      id={`date-${index}`}
                                      type="date"
                                      value={photo.date}
                                      onChange={(e) =>
                                        updatePhotoData(
                                          index,
                                          "date",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`category-${index}`}>
                                      Category
                                    </Label>
                                    <Select
                                      value={photo.category}
                                      onValueChange={(value) =>
                                        updatePhotoData(
                                          index,
                                          "category",
                                          value,
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem
                                            key={category}
                                            value={category}
                                          >
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor={`mood-${index}`}>
                                      Mood
                                    </Label>
                                    <Select
                                      value={photo.mood}
                                      onValueChange={(value) =>
                                        updatePhotoData(index, "mood", value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="How did you feel?" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {moods.map((mood) => (
                                          <SelectItem key={mood} value={mood}>
                                            {mood}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div className="text-center">
                        <Button onClick={addPhoto} variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Add Another Photo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Story Details */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Tell Your Story
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="storyTitle">Story Title</Label>
                    <Input
                      id="storyTitle"
                      placeholder="Give your photo story a title"
                      value={formData.storyTitle}
                      onChange={(e) =>
                        handleInputChange("storyTitle", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="overallDescription">
                      Overall Description
                    </Label>
                    <Textarea
                      id="overallDescription"
                      placeholder="Describe your overall Erasmus experience..."
                      value={formData.overallDescription}
                      onChange={(e) =>
                        handleInputChange("overallDescription", e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="favoriteMemory">Favorite Memory</Label>
                    <Textarea
                      id="favoriteMemory"
                      placeholder="What was your most memorable moment?"
                      value={formData.favoriteMemory}
                      onChange={(e) =>
                        handleInputChange("favoriteMemory", e.target.value)
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="advice">Advice for Future Students</Label>
                    <Textarea
                      id="advice"
                      placeholder="What advice would you give to future Erasmus students?"
                      value={formData.advice}
                      onChange={(e) =>
                        handleInputChange("advice", e.target.value)
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Privacy Settings</h3>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allowPublicUse"
                        checked={formData.allowPublicUse}
                        onChange={(e) =>
                          handleInputChange("allowPublicUse", e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label htmlFor="allowPublicUse">
                        Allow public use of my photo story for promotional
                        purposes
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allowContact"
                        checked={formData.allowContact}
                        onChange={(e) =>
                          handleInputChange("allowContact", e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label htmlFor="allowContact">
                        Allow future students to contact me for advice
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <Link href="/share-story">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Share Story
                    </Button>
                  </Link>
                )}
              </div>

              <div>
                {currentStep < 3 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Photo Story
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
