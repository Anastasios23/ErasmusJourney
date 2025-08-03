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

      if (response.status === 403) {
        setError("Unauthorized: Admin access required");
        router.push("/login");
        return;
      }

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

  const rejectSubmission = async (submissionId: string, reason: string) => {
    try {
      await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: reason,
        }),
      });

      fetchPendingSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Admin - Destinations Management</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Destinations Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Review and manage destination submissions and published
                  destinations
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading destinations...</p>
              </div>
            ) : (
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="pending"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Pending Review ({pendingSubmissions.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="published"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Published ({liveDestinations.length})
                  </TabsTrigger>
                </TabsList>

                {/* Pending Submissions Tab */}
                <TabsContent value="pending" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pending Destination Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingSubmissions.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No pending submissions
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {pendingSubmissions.map((submission) => (
                            <Card
                              key={submission.id}
                              className="border-l-4 border-l-yellow-400"
                            >
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">
                                      {submission.data.hostCity},{" "}
                                      {submission.data.hostCountry}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          <MapPin className="h-4 w-4 inline mr-1" />
                                          University:{" "}
                                          {submission.data.hostUniversity}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          <Users className="h-4 w-4 inline mr-1" />
                                          Student:{" "}
                                          {submission.data.studentName ||
                                            "Unknown"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          <Calendar className="h-4 w-4 inline mr-1" />
                                          Submitted:{" "}
                                          {new Date(
                                            submission.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          <Euro className="h-4 w-4 inline mr-1" />
                                          Budget: €
                                          {submission.data.totalMonthlyBudget ||
                                            "Not specified"}
                                        </p>
                                      </div>
                                    </div>

                                    {submission.data.experienceDescription && (
                                      <div className="mb-4">
                                        <h4 className="font-medium mb-2">
                                          Experience Description:
                                        </h4>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                          {
                                            submission.data
                                              .experienceDescription
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {submission.data.highlights &&
                                      submission.data.highlights.length > 0 && (
                                        <div className="mb-4">
                                          <h4 className="font-medium mb-2">
                                            Highlights:
                                          </h4>
                                          <div className="flex flex-wrap gap-1">
                                            {submission.data.highlights.map(
                                              (highlight, index) => (
                                                <Badge
                                                  key={index}
                                                  variant="secondary"
                                                >
                                                  {highlight}
                                                </Badge>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    <div className="flex items-center gap-2 mb-4">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="text-sm">
                                        Rating:{" "}
                                        {submission.data.overallRating ||
                                          "Not rated"}
                                        /5
                                      </span>
                                      {submission.data.wouldRecommend && (
                                        <Badge
                                          variant="outline"
                                          className="text-green-600"
                                        >
                                          Recommended
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2 ml-4">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <Eye className="h-4 w-4 mr-1" />
                                          Review
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Review Destination:{" "}
                                            {submission.data.hostCity},{" "}
                                            {submission.data.hostCountry}
                                          </DialogTitle>
                                          <DialogDescription>
                                            Review this submission and decide
                                            whether to approve as a new
                                            destination.
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="city">City</Label>
                                              <Input
                                                id="city"
                                                value={submission.data.hostCity}
                                                readOnly
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="country">
                                                Country
                                              </Label>
                                              <Input
                                                id="country"
                                                value={
                                                  submission.data.hostCountry
                                                }
                                                readOnly
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <Label htmlFor="university">
                                              University
                                            </Label>
                                            <Input
                                              id="university"
                                              value={
                                                submission.data.hostUniversity
                                              }
                                              readOnly
                                            />
                                          </div>

                                          <div>
                                            <Label htmlFor="description">
                                              Description
                                            </Label>
                                            <Textarea
                                              id="description"
                                              value={
                                                submission.data
                                                  .experienceDescription || ""
                                              }
                                              readOnly
                                              rows={4}
                                            />
                                          </div>

                                          <div>
                                            <Label htmlFor="image-upload">
                                              Destination Image
                                            </Label>
                                            <Input
                                              id="image-upload"
                                              type="file"
                                              accept="image/*"
                                              onChange={handleImageUpload}
                                            />
                                            {imagePreview && (
                                              <div className="mt-2">
                                                <img
                                                  src={imagePreview}
                                                  alt="Preview"
                                                  className="w-full h-48 object-cover rounded"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <DialogFooter className="gap-2">
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button variant="destructive">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  Reject Submission
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Are you sure you want to
                                                  reject this destination
                                                  submission? This action cannot
                                                  be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() =>
                                                    rejectSubmission(
                                                      submission.id,
                                                      "Quality standards not met",
                                                    )
                                                  }
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  Reject
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>

                                          <Button
                                            onClick={() => {
                                              const destinationData = {
                                                name: `${submission.data.hostCity}, ${submission.data.hostCountry}`,
                                                city: submission.data.hostCity,
                                                country:
                                                  submission.data.hostCountry,
                                                description:
                                                  submission.data
                                                    .experienceDescription,
                                                featured: true,
                                                status: "PUBLISHED" as const,
                                                studentCount: 1,
                                                averageRating:
                                                  submission.data
                                                    .overallRating || 4.0,
                                              };
                                              approveSubmission(
                                                submission.id,
                                                destinationData,
                                              );
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve & Publish
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
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

                {/* Published Destinations Tab */}
                <TabsContent value="published" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Published Destinations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {liveDestinations.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No published destinations yet
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {liveDestinations.map((destination) => (
                            <Card
                              key={destination.id}
                              className="border-l-4 border-l-green-400"
                            >
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">
                                      {destination.name}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          <MapPin className="h-4 w-4 inline mr-1" />
                                          Country: {destination.country}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          <Users className="h-4 w-4 inline mr-1" />
                                          Students: {destination.studentCount}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          <Star className="h-4 w-4 inline mr-1" />
                                          Rating: {destination.averageRating}/5
                                        </p>
                                        <Badge
                                          variant={
                                            destination.featured
                                              ? "default"
                                              : "secondary"
                                          }
                                        >
                                          {destination.featured
                                            ? "Featured"
                                            : "Standard"}
                                        </Badge>
                                      </div>
                                    </div>

                                    {destination.description && (
                                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-4">
                                        {destination.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDestination(destination)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleEditDestination(destination)
                                      }
                                    >
                                      <Edit3 className="h-4 w-4 mr-1" />
                                      Edit
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
            )}
          </div>
        </main>
      </div>
    </>
  );
}
