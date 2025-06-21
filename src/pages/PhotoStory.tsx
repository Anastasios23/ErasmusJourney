import { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
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
import { Link } from "react-router-dom";
import { getAllDestinations } from "@/data/destinations";

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

const PhotoStory = () => {
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

  const destinations = getAllDestinations();

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

  const handlePhotoChange = (
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
      setPhotos(photos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Photo Story submitted:", { formData, photos });
    alert("Photo story submitted successfully! 📸");
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Upload Photos";
      case 3:
        return "Story Details";
      case 4:
        return "Review & Submit";
      default:
        return "";
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.studentName &&
          formData.email &&
          formData.city &&
          formData.country
        );
      case 2:
        return photos.some((photo) => photo.image);
      case 3:
        return formData.storyTitle && formData.overallDescription;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white border-white/30"
            >
              Photo Story
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Share Your Visual Journey
            </h1>
            <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
              Pictures tell stories that words cannot capture. Share your
              Erasmus journey through photos and help future students visualize
              their own adventure.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-pink-200 mb-1">📸</div>
                <div className="text-pink-100 text-sm">Visual Stories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-200 mb-1">
                  ⚡
                </div>
                <div className="text-pink-100 text-sm">Quick & Easy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  💫
                </div>
                <div className="text-pink-100 text-sm">Inspire Others</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {getStepTitle(currentStep)}
            </h2>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <Progress value={currentStep * 25} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Basic Info</span>
            <span>Photos</span>
            <span>Story</span>
            <span>Review</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Tell Us About Yourself
                </CardTitle>
                <p className="text-gray-600">
                  Basic information about your Erasmus experience
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Your Name</Label>
                    <Input
                      id="studentName"
                      placeholder="Enter your full name"
                      value={formData.studentName}
                      onChange={(e) =>
                        handleInputChange("studentName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="homeUniversity">Home University</Label>
                    <Input
                      id="homeUniversity"
                      placeholder="University of Cyprus"
                      value={formData.homeUniversity}
                      onChange={(e) =>
                        handleInputChange("homeUniversity", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hostUniversity">Host University</Label>
                    <Input
                      id="hostUniversity"
                      placeholder="Technical University of Berlin"
                      value={formData.hostUniversity}
                      onChange={(e) =>
                        handleInputChange("hostUniversity", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("city", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your Erasmus city" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((dest) => (
                          <SelectItem key={dest.id} value={dest.city}>
                            {dest.city}, {dest.country}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other City</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Germany"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
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
                        <SelectItem value="full-year">Full Year</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("year", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Photo Upload */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Upload Your Photos
                </CardTitle>
                <p className="text-gray-600">
                  Add photos that tell your Erasmus story (up to 10 photos)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {photos.map((photo, index) => (
                  <Card
                    key={photo.id}
                    className={`p-4 border-l-4 ${
                      photo.image ? "border-l-green-500" : "border-l-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Photo {index + 1}
                      </h4>
                      {photos.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Photo Upload */}
                        <div className="space-y-2">
                          <Label>Upload Photo</Label>
                          {photo.imagePreview ? (
                            <div className="relative">
                              <img
                                src={photo.imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="outline"
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
                            <div
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement)
                                    .files?.[0];
                                  if (file) handlePhotoUpload(index, file);
                                };
                                input.click();
                              }}
                            >
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Click to upload photo
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG up to 10MB
                              </p>
                            </div>
                          )}
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <Progress value={uploadProgress} className="h-2" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Photo Title</Label>
                          <Input
                            placeholder="Give your photo a title..."
                            value={photo.title}
                            onChange={(e) =>
                              handlePhotoChange(index, "title", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Caption / Story</Label>
                          <Textarea
                            placeholder="Tell the story behind this photo..."
                            value={photo.caption}
                            onChange={(e) =>
                              handlePhotoChange(
                                index,
                                "caption",
                                e.target.value,
                              )
                            }
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                              placeholder="Berlin, Germany"
                              value={photo.location}
                              onChange={(e) =>
                                handlePhotoChange(
                                  index,
                                  "location",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={photo.date}
                              onChange={(e) =>
                                handlePhotoChange(index, "date", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              onValueChange={(value) =>
                                handlePhotoChange(index, "category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Mood</Label>
                            <Select
                              onValueChange={(value) =>
                                handlePhotoChange(index, "mood", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Mood" />
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
                  </Card>
                ))}

                {photos.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPhoto}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add Another Photo
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Story Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Your Story
                </CardTitle>
                <p className="text-gray-600">
                  Add context and personal touches to your photo story
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="storyTitle">Story Title</Label>
                  <Input
                    id="storyTitle"
                    placeholder="My Amazing Semester in Berlin"
                    value={formData.storyTitle}
                    onChange={(e) =>
                      handleInputChange("storyTitle", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overallDescription">
                    Overall Experience Description
                  </Label>
                  <Textarea
                    id="overallDescription"
                    placeholder="Describe your overall Erasmus experience... What made it special? What would you want other students to know?"
                    value={formData.overallDescription}
                    onChange={(e) =>
                      handleInputChange("overallDescription", e.target.value)
                    }
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favoriteMemory">
                    Favorite Memory (Optional)
                  </Label>
                  <Textarea
                    id="favoriteMemory"
                    placeholder="Share your most memorable moment from your Erasmus experience..."
                    value={formData.favoriteMemory}
                    onChange={(e) =>
                      handleInputChange("favoriteMemory", e.target.value)
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advice">Advice for Future Students</Label>
                  <Textarea
                    id="advice"
                    placeholder="What advice would you give to students considering this destination?"
                    value={formData.advice}
                    onChange={(e) =>
                      handleInputChange("advice", e.target.value)
                    }
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Privacy & Sharing Settings
                  </h4>
                  <div className="space-y-3">
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
                      <Label htmlFor="allowPublicUse" className="text-sm">
                        Allow public use of my photos in platform materials
                        (with credit)
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
                      <Label htmlFor="allowContact" className="text-sm">
                        Allow future students to contact me about my experience
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Review Your Story
                </CardTitle>
                <p className="text-gray-600">
                  Take a final look at your photo story before submitting
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {formData.storyTitle}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    By {formData.studentName} • {formData.city},{" "}
                    {formData.country} • {formData.semester} {formData.year}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {formData.overallDescription}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Photos ({photos.filter((p) => p.image).length})
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {photos
                      .filter((photo) => photo.image)
                      .map((photo, index) => (
                        <div key={photo.id} className="space-y-2">
                          <img
                            src={photo.imagePreview}
                            alt={photo.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <p className="text-sm font-medium">{photo.title}</p>
                          <p className="text-xs text-gray-600">
                            {photo.location} • {photo.category}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Ready to Inspire Others!
                      </h4>
                      <p className="text-blue-800 text-sm">
                        Your photo story will help future students visualize
                        their potential Erasmus experience and make informed
                        decisions about their journey.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8">
            <div>
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <Link to="/share-story">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Options
                  </Button>
                </Link>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Submit Photo Story
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Feature Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Share Your Photo Story?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Visual Inspiration
              </h3>
              <p className="text-gray-600 text-sm">
                Photos provide visual context that helps students imagine
                themselves in your shoes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Tell Your Story
              </h3>
              <p className="text-gray-600 text-sm">
                Combine images with captions to create a compelling narrative of
                your journey
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Help Others</h3>
              <p className="text-gray-600 text-sm">
                Your authentic visuals help future students make better-informed
                decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Camera className="h-12 w-12 text-pink-200 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Every Picture Tells a Story
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Your photos capture moments that words cannot describe. Share them
            to inspire and guide the next generation of Erasmus students.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PhotoStory;
