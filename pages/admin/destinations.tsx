import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { Badge } from "../../src/components/ui/badge";
import { Label } from "../../src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../src/components/ui/alert-dialog";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
  Euro,
  Calendar,
  Upload,
  Edit3,
  Trash2,
  Star,
  AlertTriangle,
  Image as ImageIcon,
  Save,
  RefreshCw,
} from "lucide-react";

interface FormSubmissionData {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: {
    // Basic Information
    studentName?: string;
    email?: string;
    universityInCyprus?: string;
    hostCountry?: string;
    hostCity?: string;
    hostUniversity?: string;
    studyLevel?: string;
    studyPeriod?: string;

    // Living Expenses
    monthlyRent?: number;
    foodExpenses?: number;
    transportExpenses?: number;
    entertainmentExpenses?: number;
    totalMonthlyBudget?: number;

    // Student Story
    overallRating?: number;
    experienceDescription?: string;
    recommendations?: string;
    highlights?: string[];
    wouldRecommend?: boolean;
  };

  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

interface DestinationData {
  id: string;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  climate?: string;
  costOfLiving?: {
    averageRent: number;
    averageFood: number;
    averageTransport: number;
    averageTotal: number;
  };
  highlights?: string;
  studentCount: number;
  averageRating: number;
  status: "DRAFT" | "PUBLISHED";
}

export default function AdminDestinations() {
  const router = useRouter();
  const [pendingSubmissions, setPendingSubmissions] = useState<
    FormSubmissionData[]
  >([]);
  const [liveDestinations, setLiveDestinations] = useState<DestinationData[]>(
    [],
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Add state for editing live destinations
  const [editingDestination, setEditingDestination] =
    useState<DestinationData | null>(null);

  // Function to handle editing a live destination
  const handleEditDestination = (destination: DestinationData) => {
    setEditingDestination(destination);
  };

  // Function to handle viewing a destination on the public page
  const handleViewDestination = (destination: DestinationData) => {
    const destinationSlug = destination.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    window.open(`/destinations/${destinationSlug}`, "_blank");
  };

  // Fetch pending submissions
  useEffect(() => {
    fetchPendingSubmissions();
    fetchLiveDestinations();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch(
        "/api/admin/form-submissions?status=SUBMITTED",
      );

      if (response.status === 403) {
        setError("Unauthorized: Admin access required");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const submissions = await response.json();

      // Ensure submissions is an array before filtering
      if (!Array.isArray(submissions)) {
        console.error(
          "Expected array but got:",
          typeof submissions,
          submissions,
        );
        setPendingSubmissions([]);
        return;
      }

      // Filter for submissions that contain destination data
      const destinationSubmissions = submissions.filter(
        (sub: FormSubmissionData) => sub.data.hostCity && sub.data.hostCountry,
      );

      setPendingSubmissions(destinationSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("Failed to fetch submissions");
      setPendingSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveDestinations = async () => {
    try {
      const response = await fetch("/api/admin/destinations");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const destinations = await response.json();

      // Ensure destinations is an array before setting
      if (!Array.isArray(destinations)) {
        console.error(
          "Expected array but got:",
          typeof destinations,
          destinations,
        );
        setLiveDestinations([]);
        return;
      }

      setLiveDestinations(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setLiveDestinations([]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageUpload(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const approveSubmission = async (
    submissionId: string,
    destinationData: Partial<DestinationData>,
  ) => {
    try {
      console.log("Approving submission:", submissionId);
      console.log("Destination data:", destinationData);
      console.log("Image URL:", imagePreview);

      // First approve the submission
      const submissionResponse = await fetch(
        `/api/admin/form-submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        },
      );

      if (!submissionResponse.ok) {
        const errorData = await submissionResponse.json();
        throw new Error(`Failed to approve submission: ${errorData.error}`);
      }

      console.log("✅ Submission approved successfully");

      // Then create/update destination
      const destinationResponse = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationData,
          imageUrl: imagePreview || null,
        }),
      });

      if (!destinationResponse.ok) {
        const errorData = await destinationResponse.json();
        throw new Error(`Failed to create destination: ${errorData.error}`);
      }

      const createdDestination = await destinationResponse.json();
      console.log("✅ Destination created successfully:", createdDestination);

      // Show success message
      alert(`✅ Successfully approved and published: ${destinationData.name}`);

      // Refresh data
      fetchPendingSubmissions();
      fetchLiveDestinations();
      setSelectedSubmission(null);
      setImageUpload(null);
      setImagePreview("");
    } catch (error) {
      console.error("❌ Error approving submission:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  interface RejectSubmissionParams {
    submissionId: string;
    reason: string;
  }

  interface RejectSubmissionResponse {
    success: boolean;
    error?: string;
  }

  const rejectSubmission = async (
    submissionId: string,
    reason: string,
  ): Promise<void> => {
    try {
      const response: Response = await fetch(
        `/api/admin/form-submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: reason,
          }),
        },
      );

      fetchPendingSubmissions();
      setSelectedSubmission(null);
    } catch (error: unknown) {
      console.error("Error rejecting submission:", error);
    }
  };

  // Detailed submission review dialog component
  const SubmissionReviewDialog = ({
    submission,
  }: {
    submission: FormSubmissionData;
  }) => {
    // Pre-populate with user data and make everything editable
    const [description, setDescription] = useState(
      submission.data.experienceDescription || "",
    );
    const [highlights, setHighlights] = useState<string[]>(
      submission.data.highlights || [],
    );
    const [newHighlight, setNewHighlight] = useState("");

    // Editable fields from user submission
    const [editedData, setEditedData] = useState({
      hostCity: submission.data.hostCity || "",
      hostCountry: submission.data.hostCountry || "",
      hostUniversity: submission.data.hostUniversity || "",
      monthlyRent: submission.data.monthlyRent || 0,
      foodExpenses: submission.data.foodExpenses || 0,
      transportExpenses: submission.data.transportExpenses || 0,
      totalMonthlyBudget: submission.data.totalMonthlyBudget || 0,
      overallRating: submission.data.overallRating || 0,
      recommendations: submission.data.recommendations || "",
      // Student information fields
      studentName: submission.data.studentName || "",
      email: submission.data.email || "",
      universityInCyprus: submission.data.universityInCyprus || "",
      studyLevel: submission.data.studyLevel || "",
      studyPeriod: submission.data.studyPeriod || "",
    });

    // Admin general information for the city
    const [generalInfo, setGeneralInfo] = useState({
      cityOverview: "",
      culturalNotes: "",
      practicalTips: "",
      languageInfo: "",
      safetyInfo: "",
      weatherInfo: "",
    });

    // Auto-calculate total budget when individual expenses change
    useEffect(() => {
      const calculatedTotal =
        editedData.monthlyRent +
        editedData.foodExpenses +
        editedData.transportExpenses;
      if (calculatedTotal !== editedData.totalMonthlyBudget) {
        setEditedData((prev) => ({
          ...prev,
          totalMonthlyBudget: calculatedTotal,
        }));
      }
    }, [
      editedData.monthlyRent,
      editedData.foodExpenses,
      editedData.transportExpenses,
    ]);

    const addHighlight = () => {
      if (newHighlight.trim()) {
        setHighlights([...highlights, newHighlight.trim()]);
        setNewHighlight("");
      }
    };

    const removeHighlight = (index: number) => {
      setHighlights(highlights.filter((_, i) => i !== index));
    };

    const handleApprove = () => {
      const destinationData = {
        name: `${editedData.hostCity}, ${editedData.hostCountry}`,
        country: editedData.hostCountry,
        description,
        highlights: highlights.join(", "),
        featured: true,
        costOfLiving: {
          averageRent: editedData.monthlyRent,
          averageFood: editedData.foodExpenses,
          averageTransport: editedData.transportExpenses,
          averageTotal: editedData.totalMonthlyBudget,
        },
        averageRating: editedData.overallRating,
        studentCount: 1,
        generalInfo: generalInfo,
      };

      approveSubmission(submission.id, destinationData);
    };

    return (
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Review and approve this destination submission from{" "}
              {submission.data.studentName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Information (Editable)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={editedData.studentName}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        studentName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="universityInCyprus">Home University</Label>
                  <Input
                    id="universityInCyprus"
                    value={editedData.universityInCyprus}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        universityInCyprus: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="studyLevel">Study Level</Label>
                  <Input
                    id="studyLevel"
                    value={editedData.studyLevel}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        studyLevel: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="studyPeriod">Study Period</Label>
                  <Input
                    id="studyPeriod"
                    value={editedData.studyPeriod}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        studyPeriod: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Destination Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Destination Details (Editable)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hostCity">Host City</Label>
                  <Input
                    id="hostCity"
                    value={editedData.hostCity}
                    onChange={(e) =>
                      setEditedData({ ...editedData, hostCity: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hostCountry">Host Country</Label>
                  <Input
                    id="hostCountry"
                    value={editedData.hostCountry}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        hostCountry: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="hostUniversity">Host University</Label>
                  <Input
                    id="hostUniversity"
                    value={editedData.hostUniversity}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        hostUniversity: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Cost Information (Editable)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent (€)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={editedData.monthlyRent}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        monthlyRent: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="foodExpenses">Food Expenses (€)</Label>
                  <Input
                    id="foodExpenses"
                    type="number"
                    value={editedData.foodExpenses}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        foodExpenses: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="transportExpenses">Transport (€)</Label>
                  <Input
                    id="transportExpenses"
                    type="number"
                    value={editedData.transportExpenses}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        transportExpenses: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="totalMonthlyBudget">
                    Total Monthly Budget (€)
                  </Label>
                  <Input
                    id="totalMonthlyBudget"
                    type="number"
                    value={editedData.totalMonthlyBudget}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        totalMonthlyBudget: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated: €
                    {editedData.monthlyRent +
                      editedData.foodExpenses +
                      editedData.transportExpenses}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Student Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Student Experience (Editable)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="overallRating">Overall Rating</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      id="overallRating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={editedData.overallRating}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          overallRating: Number(e.target.value),
                        })
                      }
                      className="w-20"
                    />
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 cursor-pointer ${
                            star <= editedData.overallRating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          onClick={() =>
                            setEditedData({
                              ...editedData,
                              overallRating: star,
                            })
                          }
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {editedData.overallRating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="experienceDescription">
                    Experience Description
                  </Label>
                  <Textarea
                    id="experienceDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={editedData.recommendations}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        recommendations: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* General City Information */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  General City Information (Admin Only)
                </CardTitle>
                <p className="text-sm text-blue-700 mt-2">
                  Add general information about the city to help future students
                  make informed decisions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cityOverview">City Overview</Label>
                    <Textarea
                      id="cityOverview"
                      placeholder="Brief overview of the city, its character, and what makes it special..."
                      value={generalInfo.cityOverview}
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          cityOverview: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="culturalNotes">Cultural Notes</Label>
                    <Textarea
                      id="culturalNotes"
                      placeholder="Cultural aspects, traditions, local customs students should know..."
                      value={generalInfo.culturalNotes}
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          culturalNotes: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="practicalTips">Practical Tips</Label>
                    <Textarea
                      id="practicalTips"
                      placeholder="Practical advice for living in the city (transport, shopping, etc.)..."
                      value={generalInfo.practicalTips}
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          practicalTips: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="languageInfo">Language Information</Label>
                    <Textarea
                      id="languageInfo"
                      placeholder="Local language(s), English proficiency, helpful phrases..."
                      value={generalInfo.languageInfo}
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          languageInfo: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="safetyInfo">Safety Information</Label>
                    <Textarea
                      id="safetyInfo"
                      placeholder="Safety tips, areas to avoid, emergency information..."
                      value={generalInfo.safetyInfo}
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          safetyInfo: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weatherInfo">Weather & Climate</Label>
                    <Textarea
                      id="weatherInfo"
                      placeholder="Climate information, seasonal variations, what to pack..."
                      value={generalInfo.weatherInfo}
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          weatherInfo: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image URL */}
            <Card>
              <CardHeader>
                <CardTitle>Destination Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  value={imagePreview}
                  onChange={(e) => setImagePreview(e.target.value)}
                />

                {/* Suggested image sources */}
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    💡 <strong>Suggested image sources:</strong>
                  </p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>
                      •{" "}
                      <a
                        href="https://unsplash.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Unsplash.com
                      </a>{" "}
                      - Free high-quality photos
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="https://pixabay.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Pixabay.com
                      </a>{" "}
                      - Free images and photos
                    </li>
                    <li>
                      • Search: "{submission.data.hostCity}{" "}
                      {submission.data.hostCountry} city view"
                    </li>
                  </ul>

                  {/* Quick suggestion buttons */}
                  <div className="mt-3">
                    <p className="text-xs mb-2">
                      <strong>
                        Quick suggestions for {editedData.hostCity}:
                      </strong>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={() => {
                          const city = editedData.hostCity?.toLowerCase() || "";
                          const country =
                            editedData.hostCountry?.toLowerCase() || "";
                          setImagePreview(
                            `https://source.unsplash.com/800x600/?${city}+${country}+city+skyline`,
                          );
                        }}
                      >
                        City View
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={() => {
                          const city = editedData.hostCity?.toLowerCase() || "";
                          const country =
                            editedData.hostCountry?.toLowerCase() || "";
                          setImagePreview(
                            `https://source.unsplash.com/800x600/?${city}+${country}+architecture+buildings`,
                          );
                        }}
                      >
                        Architecture
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={() => {
                          const city = editedData.hostCity?.toLowerCase() || "";
                          const country =
                            editedData.hostCountry?.toLowerCase() || "";
                          setImagePreview(
                            `https://source.unsplash.com/800x600/?${city}+${country}+landmark+monument`,
                          );
                        }}
                      >
                        Landmarks
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-32 object-cover rounded-lg border"
                      onError={() => {
                        setImagePreview("");
                        alert(
                          "Invalid image URL. Please check the URL and try again.",
                        );
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image preview (will appear as 400x250px on the site)
                    </p>
                  </div>
                )}

                {!imagePreview && (
                  <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No image selected</p>
                    <p className="text-xs">
                      Add an image URL above to see preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Destination Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a highlight (e.g., 'Great nightlife', 'Affordable housing')"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addHighlight()}
                  />
                  <Button onClick={addHighlight} type="button">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeHighlight(index)}
                    >
                      {highlight} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedSubmission(null)}
            >
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Submission</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject this submission? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      rejectSubmission(submission.id, "Rejected by admin")
                    }
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={handleApprove}
              disabled={
                !description.trim() ||
                !editedData.hostCity.trim() ||
                !editedData.hostCountry.trim()
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Dialog for editing live destinations
  const DestinationEditDialog = ({
    destination,
  }: {
    destination: DestinationData;
  }) => {
    const [editData, setEditData] = useState({
      name: destination.name || "",
      country: destination.country || "",
      description: destination.description || "",
      imageUrl: destination.imageUrl || "",
      featured: destination.featured || false,
      climate: destination.climate || "",
    });

    // Convert highlights string to array for editing
    const [editHighlights, setEditHighlights] = useState<string[]>(
      destination.highlights
        ? destination.highlights.split(", ").filter((h) => h.trim())
        : [],
    );
    const [newHighlight, setNewHighlight] = useState("");

    const addHighlight = () => {
      if (newHighlight.trim()) {
        setEditHighlights([...editHighlights, newHighlight.trim()]);
        setNewHighlight("");
      }
    };

    const removeHighlight = (index: number) => {
      setEditHighlights(editHighlights.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
      try {
        const response = await fetch(
          `/api/admin/destinations/${destination.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...editData,
              highlights: editHighlights,
              costOfLiving: destination.costOfLiving, // Preserve cost data
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update destination");
        }

        alert("✅ Destination updated successfully!");
        setEditingDestination(null);
        fetchLiveDestinations();
      } catch (error) {
        console.error("Error updating destination:", error);
        alert("❌ Error updating destination");
      }
    };

    return (
      <Dialog
        open={!!editingDestination}
        onOpenChange={() => setEditingDestination(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
            <DialogDescription>
              Edit the destination information for {destination.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Destination Name</Label>
                  <Input
                    id="editName"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editCountry">Country</Label>
                  <Input
                    id="editCountry"
                    value={editData.country}
                    onChange={(e) =>
                      setEditData({ ...editData, country: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editImageUrl">Image URL</Label>
                  <Input
                    id="editImageUrl"
                    value={editData.imageUrl}
                    onChange={(e) =>
                      setEditData({ ...editData, imageUrl: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editClimate">Climate Information</Label>
                  <Input
                    id="editClimate"
                    value={editData.climate}
                    onChange={(e) =>
                      setEditData({ ...editData, climate: e.target.value })
                    }
                    placeholder="e.g., Mediterranean, Tropical, Continental"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editFeatured"
                      checked={editData.featured}
                      onChange={(e) =>
                        setEditData({ ...editData, featured: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="editFeatured">Featured Destination</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a highlight"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addHighlight()}
                  />
                  <Button onClick={addHighlight} type="button">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editHighlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeHighlight(index)}
                    >
                      {highlight} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>
                  Average Rent: €
                  {destination.costOfLiving?.averageRent || "N/A"}/month
                </p>
                <p>
                  Average Food: €
                  {destination.costOfLiving?.averageFood || "N/A"}/month
                </p>
                <p>
                  Average Transport: €
                  {destination.costOfLiving?.averageTransport || "N/A"}/month
                </p>
                <p className="font-semibold">
                  Total: €{destination.costOfLiving?.averageTotal || "N/A"}
                  /month
                </p>
                <p className="text-xs mt-2">
                  Cost information is calculated from student submissions
                </p>
              </CardContent>
            </Card>

            {editData.imageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Image Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={editData.imageUrl}
                    alt="Preview"
                    className="w-48 h-32 object-cover rounded-lg border"
                    onError={() => {
                      setEditData({ ...editData, imageUrl: "" });
                      alert("Invalid image URL");
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingDestination(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin - Manage Destinations</title>
      </Head>
      <Header />

      {loading && (
        <div className="pt-20 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admin data...</span>
        </div>
      )}

      {error && (
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Destinations Management
              </h1>
              <p className="text-gray-600 mt-2">
                Review and approve student submissions to create destination
                pages
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/destinations">
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
              <Link href="/test-admin">
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Create Test Data
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Review ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Live Destinations ({liveDestinations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Submissions</CardTitle>
                  <p className="text-sm text-gray-600">
                    Student form submissions waiting for your review
                  </p>
                </CardHeader>
                <CardContent>
                  {pendingSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No pending submissions to review
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingSubmissions.map((submission) => (
                        <Card
                          key={submission.id}
                          className="border-l-4 border-l-orange-400"
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {submission.data.hostCity},{" "}
                                  {submission.data.hostCountry}
                                </h3>
                                <Badge variant="outline" className="mt-1">
                                  {submission.data.studyLevel}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Student:
                                  </span>
                                  <p className="font-medium">
                                    {submission.data.studentName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    University:
                                  </span>
                                  <p className="font-medium">
                                    {submission.data.hostUniversity}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Period:</span>
                                  <p className="font-medium">
                                    {submission.data.studyPeriod}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Budget:</span>
                                  <p className="font-medium">
                                    €{submission.data.totalMonthlyBudget}/month
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Submitted:{" "}
                                {new Date(
                                  submission.createdAt,
                                ).toLocaleDateString()}
                              </div>
                              <Button
                                onClick={() =>
                                  setSelectedSubmission(submission)
                                }
                                className="w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review & Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="live" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Published Destinations</CardTitle>
                  <p className="text-sm text-gray-600">
                    Currently live destinations on the public website
                  </p>
                </CardHeader>
                <CardContent>
                  {liveDestinations.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No destinations published yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {liveDestinations.map((destination) => (
                        <Card
                          key={destination.id}
                          className="border-l-4 border-l-green-400"
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              {destination.imageUrl && (
                                <img
                                  src={destination.imageUrl}
                                  alt={destination.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {destination.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {destination.description?.substring(0, 100)}
                                  ...
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {destination.studentCount} students
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  {destination.averageRating}/5
                                </span>
                              </div>
                              {destination.highlights && (
                                <div className="text-xs text-gray-500 mt-2">
                                  <strong>Highlights:</strong>{" "}
                                  {destination.highlights}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleEditDestination(destination)
                                  }
                                >
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleViewDestination(destination)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Review Dialog */}
          {selectedSubmission && (
            <SubmissionReviewDialog submission={selectedSubmission} />
          )}

          {/* Edit Destination Dialog */}
          {editingDestination && (
            <DestinationEditDialog destination={editingDestination} />
          )}
        </div>
      )}
    </div>
  );
}
