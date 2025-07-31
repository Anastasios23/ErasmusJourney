import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
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
  costOfLiving?: {
    averageRent: number;
    averageFood: number;
    averageTransport: number;
    averageTotal: number;
  };
  highlights?: string[];
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
      // First approve the submission
      await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      // Then create/update destination
      await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationData,
          imageUrl: imagePreview || null,
        }),
      });

      // Refresh data
      fetchPendingSubmissions();
      fetchLiveDestinations();
      setSelectedSubmission(null);
      setImageUpload(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error approving submission:", error);
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

  const SubmissionReviewDialog = ({
    submission,
  }: {
    submission: FormSubmissionData;
  }) => {
    const [description, setDescription] = useState("");
    const [highlights, setHighlights] = useState<string[]>([]);
    const [newHighlight, setNewHighlight] = useState("");

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
        name: `${submission.data.hostCity}, ${submission.data.hostCountry}`,
        country: submission.data.hostCountry!,
        description,
        highlights,
        featured: false,
        costOfLiving: {
          averageRent: submission.data.monthlyRent || 0,
          averageFood: submission.data.foodExpenses || 0,
          averageTransport: submission.data.transportExpenses || 0,
          averageTotal: submission.data.totalMonthlyBudget || 0,
        },
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
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student Name</Label>
                  <p className="font-medium">{submission.data.studentName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">
                    {submission.data.email}
                  </p>
                </div>
                <div>
                  <Label>Home University</Label>
                  <p className="font-medium">
                    {submission.data.universityInCyprus}
                  </p>
                </div>
                <div>
                  <Label>Study Period</Label>
                  <p className="font-medium">{submission.data.studyPeriod}</p>
                </div>
              </CardContent>
            </Card>

            {/* Destination Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Destination Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Host City</Label>
                  <p className="font-medium text-lg">
                    {submission.data.hostCity}
                  </p>
                </div>
                <div>
                  <Label>Host Country</Label>
                  <p className="font-medium text-lg">
                    {submission.data.hostCountry}
                  </p>
                </div>
                <div>
                  <Label>Host University</Label>
                  <p className="font-medium">
                    {submission.data.hostUniversity}
                  </p>
                </div>
                <div>
                  <Label>Study Level</Label>
                  <p className="font-medium">{submission.data.studyLevel}</p>
                </div>
              </CardContent>
            </Card>

            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Cost Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Rent</Label>
                  <p className="font-medium">€{submission.data.monthlyRent}</p>
                </div>
                <div>
                  <Label>Food Expenses</Label>
                  <p className="font-medium">€{submission.data.foodExpenses}</p>
                </div>
                <div>
                  <Label>Transport</Label>
                  <p className="font-medium">
                    €{submission.data.transportExpenses}
                  </p>
                </div>
                <div>
                  <Label>Total Monthly Budget</Label>
                  <p className="font-medium text-lg">
                    €{submission.data.totalMonthlyBudget}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Student Experience */}
            {submission.data.experienceDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Student Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Overall Rating</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (submission.data.overallRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">
                        {submission.data.overallRating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Experience Description</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                      {submission.data.experienceDescription}
                    </p>
                  </div>
                  {submission.data.recommendations && (
                    <div>
                      <Label>Recommendations</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                        {submission.data.recommendations}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Admin Review Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Admin Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Destination Description */}
                <div>
                  <Label htmlFor="description">Destination Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Write a description for this destination that will appear on the public page..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="imageUrl">Destination Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={imagePreview}
                    onChange={(e) => setImagePreview(e.target.value)}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={() => setImagePreview("")}
                      />
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div>
                  <Label>Destination Highlights</Label>
                  <div className="space-y-2">
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
                  </div>
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
            <Button onClick={handleApprove} disabled={!description.trim()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Destinations Management</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Destinations Management
              </h1>
              <p className="text-gray-600 mt-2">
                Review and approve student submissions to create destination
                pages
              </p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Pending Review ({pendingSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Live Destinations ({liveDestinations.length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Submissions */}
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
                      <div className="space-y-4">
                        {pendingSubmissions.map((submission) => (
                          <Card
                            key={submission.id}
                            className="border-l-4 border-l-orange-400"
                          >
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <h3 className="font-semibold text-lg">
                                      {submission.data.hostCity},{" "}
                                      {submission.data.hostCountry}
                                    </h3>
                                    <Badge variant="outline">
                                      {submission.data.studyLevel}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                      <span className="text-gray-500">
                                        Period:
                                      </span>
                                      <p className="font-medium">
                                        {submission.data.studyPeriod}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Budget:
                                      </span>
                                      <p className="font-medium">
                                        €{submission.data.totalMonthlyBudget}
                                        /month
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Submitted:{" "}
                                    {new Date(
                                      submission.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <Button
                                  onClick={() =>
                                    setSelectedSubmission(submission)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
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

              {/* Live Destinations */}
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
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="outline">
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
          </div>
        </main>

        {/* Review Dialog */}
        {selectedSubmission && (
          <SubmissionReviewDialog submission={selectedSubmission} />
        )}
      </div>
    </>
  );
}
