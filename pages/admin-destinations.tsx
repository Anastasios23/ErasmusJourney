import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Textarea } from "../src/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/components/ui/dialog";
import { Badge } from "../src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  Edit,
  Plus,
  Trash2,
  Save,
  MapPin,
  Users,
  Euro,
  Star,
  Info,
  Image as ImageIcon,
  Globe,
  Clock,
  Thermometer,
  Eye,
  Check,
  X,
} from "lucide-react";
import { toast } from "../src/components/ui/use-toast";

interface FormSubmissionData {
  // Location/Destination Information
  hostCity?: string;
  city?: string;
  hostCountry?: string;
  country?: string;
  hostUniversity?: string;
  university?: string;
  institutionName?: string;

  // Student Information
  studentName?: string;
  name?: string;
  fullName?: string;
  studentId?: string;
  email?: string;
  studentEmail?: string;
  homeUniversity?: string;
  originUniversity?: string;
  studyField?: string;
  major?: string;
  field?: string;

  // Experience Details
  experienceDescription?: string;
  description?: string;
  experience?: string;
  summary?: string;
  highlights?: string[];

  // Financial Information
  monthlyRent?: number;
  rent?: number;
  foodExpenses?: number;
  food?: number;
  transportExpenses?: number;
  transport?: number;
  transportation?: number;
  entertainmentExpenses?: number;
  entertainment?: number;
  leisure?: number;
  totalMonthlyBudget?: number;
  totalBudget?: number;
  budget?: number;

  // Ratings
  overallRating?: number;
  rating?: number;
  satisfaction?: number;
  accommodationRating?: number;
  academicRating?: number;
  universityRating?: number;
  socialLifeRating?: number;
  socialRating?: number;

  // Media and Resources
  image?: string;
  imageUrl?: string;
  photo?: string;
  gallery?: string[];

  // Metadata
  submissionType?: string;
  formType?: string;
  processedAt?: string;

  // Catch-all for any additional fields
  [key: string]: any;
}

interface FormSubmission {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  data: FormSubmissionData;
}

interface Destination {
  id: string;
  city: string;
  country: string;
  description?: string;
  image?: string;
  costLevel?: string;
  rating?: number;
  studentCount: number;
  avgCostPerMonth?: number;
  avgRent: number;
  avgLivingExpenses: number;
  avgAccommodationRating: number;
  universities: string[];
  popularUniversities?: string[];
  highlights?: string[];
  experiences: Array<{
    studentName: string;
    university: string;
    submissionId: string;
  }>;
  accommodationCount: number;
  expenseSubmissionCount: number;
  courseSubmissionCount: number;
  cityInfo?: {
    population: string;
    language: string;
    currency: string;
    climate: string;
    timezone: string;
    averageTemp: {
      summer: string;
      winter: string;
    };
    topAttractions: string[];
    transportation: {
      publicTransport: string;
      studentDiscount: string;
      averageTransportCost: string;
    };
    studentLife: {
      nightlife: string;
      culturalScene: string;
      foodScene: string;
      studentAreas: string[];
    };
    practicalInfo: {
      internetSpeed: string;
      englishFriendly: string;
      safetyRating: string;
      healthcareQuality: string;
    };
    funFacts: string[];
  };
}

// Helper function to determine cost level from available data
const getCostLevel = (destination: Destination): string => {
  const totalCost =
    (destination.avgRent || 0) + (destination.avgLivingExpenses || 0);
  if (totalCost < 800) return "low";
  if (totalCost < 1200) return "medium";
  return "high";
};

// Helper functions for data extraction and normalization
const extractField = (
  data: any,
  fields: string[],
  defaultValue: any = null,
): any => {
  if (!data) return defaultValue;

  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      return data[field];
    }
  }

  return defaultValue;
};

const normalizeNumericValue = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[€$,]/g, "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const extractArrayField = (data: any, field: string): string[] => {
  if (!data) return [];

  if (Array.isArray(data[field])) {
    return data[field];
  } else if (typeof data[field] === "string") {
    // Handle comma-separated string
    return data[field]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export default function AdminDestinations() {
  const router = useRouter();
  const [pendingSubmissions, setPendingSubmissions] = useState<
    FormSubmission[]
  >([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [dataFetched, setDataFetched] = useState(false);

  // Load destinations and pending submissions
  useEffect(() => {
    // Use a flag to prevent multiple fetches on mount
    const controller = new AbortController();

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([loadDestinations(), fetchSubmittedExperiences()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Cleanup function to handle component unmount
    return () => {
      controller.abort();
    };
  }, []);

  // Helper function to fetch all relevant submission types
  const fetchAllSubmissionData = async () => {
    try {
      console.log("Fetching comprehensive submission data...");

      // Get all submissions regardless of type and aggregate them
      await fetchSubmittedExperiences();

      return true;
    } catch (error) {
      console.error("Error fetching comprehensive submission data:", error);
      return false;
    }
  };

  // Helper function to process consolidated submissions from the new system
  const processConsolidatedSubmissions = (experiences: any[]) => {
    return experiences.map((experience) => ({
      id: experience.id,
      type: "experience" as const,
      status: experience.status,
      createdAt: experience.createdAt,
      updatedAt: experience.updatedAt,
      email: experience.email,
      submittedAt: experience.submittedAt || experience.createdAt,
      data: {
        ...experience,
        // Transform data for compatibility with existing admin interface
        basicInformation: {
          firstName: experience.firstName,
          lastName: experience.lastName,
          studentId: experience.studentId,
          email: experience.email,
          phone: experience.phone,
          dateOfBirth: experience.dateOfBirth,
          nationality: experience.nationality,
          homeUniversity: experience.homeUniversity,
          studyProgram: experience.studyProgram,
          yearOfStudy: experience.yearOfStudy,
          academicYear: experience.academicYear,
        },
        exchangeDetails: {
          hostUniversity: experience.hostUniversity,
          hostCity: experience.hostCity,
          hostCountry: experience.hostCountry,
          exchangePeriod: experience.exchangePeriod,
          facultyDepartment: experience.facultyDepartment,
        },
        courses: experience.courses || [],
        accommodation: experience.accommodation || {},
        livingExpenses: experience.livingExpenses || {},
        overallReflection: experience.overallReflection || {},
        // Add fields that the admin interface expects
        hostCity: experience.hostCity,
        hostCountry: experience.hostCountry,
        hostUniversity: experience.hostUniversity,
        studentName:
          `${experience.firstName || ""} ${experience.lastName || ""}`.trim(),
        studentEmail: experience.email,
        experienceDescription:
          experience.overallReflection?.wouldRecommend ||
          experience.overallReflection?.additionalComments ||
          "",
        completedSteps: 4, // Unified experiences are always complete
        totalSteps: 4,
      },
    }));
  };

  // Function to fetch submitted experiences using the new unified system
  const fetchSubmittedExperiences = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching submitted experiences...");

      const response = await fetch("/api/admin/erasmus-experiences");

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error("Failed to fetch experiences");
      }

      const experiences = await response.json();
      console.log("Experiences API response:", experiences);

      if (!Array.isArray(experiences)) {
        console.error("API returned non-array response:", experiences);
        throw new Error("Invalid API response format");
      }

      // Process these experiences (similar format to before)
      const processedSubmissions = processConsolidatedSubmissions(experiences);

      // Update state with the processed submissions
      setPendingSubmissions(processedSubmissions);
      setDataFetched(true);

      return processedSubmissions;
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast({
        title: "Error",
        description: `Failed to fetch experiences: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      setPendingSubmissions([]);
      setDataFetched(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all submission types and aggregate them by user
  const fetchAndAggregateSubmissions = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching and aggregating all submission types...");

      // Fetch all form submissions regardless of type
      const response = await fetch(
        "/api/admin/form-submissions?status=SUBMITTED&limit=200",
      );

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error("Failed to fetch submissions");
      }

      const submissions = await response.json();
      console.log("Raw API response:", submissions);

      if (!Array.isArray(submissions)) {
        console.error("API returned non-array response:", submissions);
        throw new Error("Invalid API response format");
      }

      // Group submissions by userId
      const submissionsByUser = {};

      // First, process all submissions with valid data
      submissions.forEach((submission) => {
        try {
          // Parse data if needed
          const data =
            typeof submission.data === "string"
              ? JSON.parse(submission.data)
              : submission.data;

          const userId = submission.userId || data.userId || "unknown-user";
          const type = submission.type || "unknown";

          // Initialize user entry if it doesn't exist
          if (!submissionsByUser[userId]) {
            submissionsByUser[userId] = {
              userId: userId,
              submissionParts: {},
              createdAt: submission.createdAt,
              updatedAt: submission.updatedAt,
              combinedData: {},
            };
          }

          // Add this submission part
          submissionsByUser[userId].submissionParts[type] = {
            id: submission.id,
            data: data,
            type: type,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
          };

          // Update timestamps if this submission is newer
          if (
            new Date(submission.updatedAt) >
            new Date(submissionsByUser[userId].updatedAt)
          ) {
            submissionsByUser[userId].updatedAt = submission.updatedAt;
          }
        } catch (error) {
          console.error("Error processing submission:", error, submission);
        }
      });

      console.log("Grouped submissions by user:", submissionsByUser);

      // Now create consolidated submissions from the grouped data
      const consolidatedSubmissions = Object.values(submissionsByUser).map(
        (userSubmissions: {
          userId: string;
          submissionParts: Record<string, any>;
          createdAt: string;
          updatedAt: string;
          combinedData: Record<string, any>;
        }) => {
          // Create a consolidated submission with combined data from all parts
          const combinedData = {};
          const submissionIds = [];
          const submissionTypes = [];
          let mostRecentId = null;
          let mostRecentDate = new Date(0);

          // Merge data from all submission parts
          Object.entries(userSubmissions.submissionParts).forEach(
            ([type, submission]) => {
              const submissionData = submission.data;
              const id = submission.id;

              // Track this submission part
              submissionIds.push(id);
              submissionTypes.push(type);

              // Check if this is the most recent submission
              const submissionDate = new Date(submission.updatedAt);
              if (submissionDate > mostRecentDate) {
                mostRecentDate = submissionDate;
                mostRecentId = id;
              }

              // Merge this part's data into the combined data
              Object.assign(combinedData, submissionData);

              // Explicitly track which type this field came from
              combinedData[`${type}Data`] = submissionData;
            },
          );

          // Create the consolidated submission
          return {
            id:
              mostRecentId ||
              submissionIds[0] ||
              `consolidated-${Math.random().toString(36).substring(2, 11)}`,
            type: "consolidated",
            status: "SUBMITTED",
            createdAt: userSubmissions.createdAt,
            updatedAt: userSubmissions.updatedAt,
            userId: userSubmissions.userId,
            data: {
              ...combinedData,
              // Metadata about this consolidated submission
              submissionMeta: {
                parts: submissionTypes,
                ids: submissionIds,
                primaryId: mostRecentId,
                completedSteps: submissionTypes.length,
                isComplete: [
                  "basic-info",
                  "course-matching",
                  "accommodation",
                  "living-expenses",
                ].every((step) => submissionTypes.includes(step)),
              },
            },
          };
        },
      );

      console.log(
        `Consolidated ${submissions.length} individual submissions into ${consolidatedSubmissions.length} user submissions`,
      );

      // Process these consolidated submissions
      const processedSubmissions = processConsolidatedSubmissions(
        consolidatedSubmissions,
      );

      // Update state with the processed submissions
      setPendingSubmissions(processedSubmissions);
      setDataFetched(true);

      return processedSubmissions;
    } catch (error) {
      console.error("Error aggregating submissions:", error);
      toast({
        title: "Error",
        description: `Failed to process submissions: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      setPendingSubmissions([]);
      setDataFetched(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching destinations...");

      const response = await fetch("/api/destinations");

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error("Failed to fetch destinations");
      }

      const data = await response.json();
      console.log("Destinations API response:", data);

      // Ensure we have an array of destinations
      const destinationsArray = data.destinations || [];
      if (!Array.isArray(destinationsArray)) {
        console.error("API returned invalid destinations format:", data);
        throw new Error("Invalid destinations data format");
      }

      setDestinations(destinationsArray);
    } catch (error) {
      console.error("Error loading destinations:", error);
      toast({
        title: "Error",
        description: `Failed to load destinations: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy function maintained for backward compatibility
  const fetchPendingSubmissions = async () => {
    // Now just calls the more comprehensive aggregation function
    return fetchSubmittedExperiences();
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination({ ...destination });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingDestination) return;

    try {
      const response = await fetch(
        `/api/admin/destinations/${editingDestination.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingDestination),
        },
      );

      if (!response.ok) throw new Error("Failed to save destination");

      await loadDestinations();
      setIsDialogOpen(false);
      setEditingDestination(null);

      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
    } catch (error) {
      console.error("Error saving destination:", error);
      toast({
        title: "Error",
        description: "Failed to save destination",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (destinationId: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;

    try {
      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete destination");

      await loadDestinations();

      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting destination:", error);
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      });
    }
  };

  const handleApproveSubmission = async (
    submissionId: string,
    destinationData: FormSubmissionData,
  ) => {
    if (!submissionId) {
      console.error("Cannot approve submission with missing ID");
      toast({
        title: "Error",
        description: "Invalid submission data (missing ID)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Approving experience ${submissionId}`, destinationData);

      // Approve the unified experience submission using the new API
      const approveResponse = await fetch("/api/admin/erasmus-experiences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionId,
          action: "approve",
        }),
      });

      if (!approveResponse.ok) {
        throw new Error(
          `Failed to approve experience: ${approveResponse.status} ${approveResponse.statusText}`,
        );
      }

      // Format destination data for API with comprehensive data integration
      const formattedData = {
        name:
          destinationData.name ??
          `${destinationData.hostCity ?? "Unknown"}, ${destinationData.hostCountry ?? "Unknown"}`,
        city:
          destinationData.city ?? destinationData.hostCity ?? "Unknown City",
        country:
          destinationData.country ??
          destinationData.hostCountry ??
          "Unknown Country",
        description:
          destinationData.description ??
          destinationData.experienceDescription ??
          "Student experience destination",
        imageUrl: destinationData.image ?? destinationData.imageUrl ?? "",
        featured: true,
        highlights: Array.isArray(destinationData.highlights)
          ? destinationData.highlights
          : [],
        officialUniversities: [
          destinationData.hostUniversity ||
            destinationData.university ||
            "Unknown University",
        ],
        generalInfo: {
          costOfLiving: {
            averageRent: Number(destinationData.monthlyRent) || 0,
            averageFood: Number(destinationData.foodExpenses) || 0,
            averageTransport: Number(destinationData.transportExpenses) || 0,
            averageEntertainment:
              Number(destinationData.entertainmentExpenses) || 0,
            averageTotal:
              Number(destinationData.totalMonthlyBudget) ||
              (Number(destinationData.monthlyRent) || 0) +
                (Number(destinationData.foodExpenses) || 0) +
                (Number(destinationData.transportExpenses) || 0) +
                (Number(destinationData.entertainmentExpenses) || 0),
          },
          studentCount: 1,
          averageRating: Number(destinationData.overallRating) || 4,
          // Additional enriched data from our enhanced submission format
          submissionSource: submissionId,
          submissionType: destinationData.submissionType || "consolidated",
          submissionDate: new Date().toISOString(),
          studentProfile: {
            name: destinationData.studentName || "Anonymous",
            email: destinationData.studentEmail || "",
            homeUniversity: destinationData.homeUniversity || "",
            studyField: destinationData.studyField || "",
          },
          ratings: {
            overall: Number(destinationData.overallRating) || 0,
            accommodation: Number(destinationData.accommodationRating) || 0,
            academic: Number(destinationData.academicRating) || 0,
            socialLife: Number(destinationData.socialLifeRating) || 0,
          },
          // Include any available media resources
          media: {
            mainImage: destinationData.image || destinationData.imageUrl || "",
            gallery: Array.isArray(destinationData.gallery)
              ? destinationData.gallery
              : [],
          },
        },
      };

      console.log("Sending destination data to API:", formattedData);

      // Create or update destination
      const destinationResponse = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!destinationResponse.ok) {
        const errorText = await destinationResponse.text();
        console.error("Destination API error response:", errorText);
        throw new Error(
          `Failed to create destination: ${destinationResponse.status} ${destinationResponse.statusText}. Response: ${errorText}`,
        );
      }

      const responseData = await destinationResponse.json();
      console.log("Destination API response:", responseData);

      // Refresh data
      toast({
        title: "Success",
        description: `${formattedData.city}, ${formattedData.country} has been approved and published.`,
      });

      // Reload data to show the changes
      // Refresh the submissions list
      await fetchSubmittedExperiences();
      await loadDestinations();
    } catch (error) {
      console.error("Error approving submission:", error);

      // More specific error handling
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for specific error types
        if (error.message.includes("Failed to create destination")) {
          errorMessage =
            "Failed to create destination. Please check the submission data and try again.";
        } else if (error.message.includes("Failed to approve submission")) {
          errorMessage =
            "Failed to approve submission. The submission may have already been processed.";
        } else if (error.message.includes("Authentication required")) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.message.includes("Admin access required")) {
          errorMessage =
            "Admin access required. Please contact an administrator.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    if (!submissionId) {
      console.error("Cannot reject submission with missing ID");
      toast({
        title: "Error",
        description: "Invalid submission data (missing ID)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Rejecting experience ${submissionId}`);

      // Reject the unified experience submission using the new API
      const rejectResponse = await fetch("/api/admin/erasmus-experiences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionId,
          action: "reject",
        }),
      });

      if (!rejectResponse.ok) {
        throw new Error(
          `Failed to reject experience: ${rejectResponse.status} ${rejectResponse.statusText}`,
        );
      }

      toast({
        title: "Success",
        description: "Experience rejected successfully",
      });

      await fetchSubmittedExperiences();
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: `Failed to reject submission: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEditingField = (field: string, value: any) => {
    if (!editingDestination) return;

    const fieldParts = field.split(".");
    if (fieldParts.length === 1) {
      setEditingDestination({ ...editingDestination, [field]: value });
    } else {
      // Handle nested objects
      const newDestination = { ...editingDestination };
      let current = newDestination as any;

      for (let i = 0; i < fieldParts.length - 1; i++) {
        if (!current[fieldParts[i]]) current[fieldParts[i]] = {};
        current = current[fieldParts[i]];
      }

      current[fieldParts[fieldParts.length - 1]] = value;
      setEditingDestination(newDestination);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">Loading destinations...</div>
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

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Destinations Management
              </h1>
              <p className="text-gray-600">
                Manage destination information and general city data
              </p>
            </div>

            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4">
                <Button onClick={() => router.push("/admin")}>
                  Back to Admin Panel
                </Button>
                <Button onClick={loadDestinations} variant="outline">
                  Refresh Data
                </Button>
              </div>
              <Badge variant="secondary">
                {destinations.length} Destinations
              </Badge>
            </div>

            {/* Tabs for Pending Submissions and Published Destinations */}
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
                <TabsTrigger value="published">
                  Published Destinations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {/* Pending Submissions Tab */}
                {!dataFetched ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading submissions...</p>
                  </div>
                ) : pendingSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pending submissions</p>
                  </div>
                ) : (
                  pendingSubmissions.map((submission) => {
                    // Calculate border color based on completion status
                    const completionLevel =
                      submission.data?.completedSteps || 0;
                    const totalSteps = submission.data?.totalSteps || 4;
                    const isComplete = completionLevel === totalSteps;

                    // Set border color based on completion status
                    const borderColorClass = isComplete
                      ? "border-l-green-500"
                      : completionLevel >= 2
                        ? "border-l-blue-400"
                        : "border-l-yellow-400";

                    return (
                      <Card
                        key={submission.id}
                        className={`mb-4 border-l-4 ${borderColorClass}`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">
                                  {submission.data?.hostCity ?? "Unknown"},{" "}
                                  {submission.data?.hostCountry ?? "Unknown"}
                                </h3>
                                <div className="flex">
                                  {isComplete ? (
                                    <Badge className="bg-green-100 text-green-800 ml-2">
                                      Complete Submission
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                                      Partial ({completionLevel}/{totalSteps})
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-blue-600 mb-2">
                                <span className="inline-flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(
                                    submission.createdAt,
                                  ).toLocaleDateString()}{" "}
                                  • Consolidated Form
                                </span>
                              </div>

                              {/* Form steps progress indicators */}
                              <div className="flex gap-1 mb-3">
                                {[
                                  "basic-info",
                                  "course-matching",
                                  "accommodation",
                                  "living-expenses",
                                ].map((stepType) => {
                                  const hasStep =
                                    submission.data?.submissionMeta?.parts?.includes(
                                      stepType,
                                    );
                                  return (
                                    <Badge
                                      key={stepType}
                                      className={`text-xs ${
                                        hasStep
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                    >
                                      {hasStep ? "✓" : "○"}{" "}
                                      {stepType.replace("-", " ")}
                                    </Badge>
                                  );
                                })}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    University:{" "}
                                    {submission.data?.hostUniversity ??
                                      "Not specified"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <Users className="h-4 w-4 inline mr-1" />
                                    Student:{" "}
                                    {submission.data?.studentName ??
                                      "Anonymous"}
                                    {submission.data?.studyField
                                      ? ` (${submission.data.studyField})`
                                      : ""}
                                  </p>
                                  {submission.data?.homeUniversity && (
                                    <p className="text-xs text-gray-500">
                                      From: {submission.data.homeUniversity}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    <Euro className="h-4 w-4 inline mr-1" />
                                    Budget: €
                                    {submission.data?.totalMonthlyBudget
                                      ? submission.data.totalMonthlyBudget.toFixed(
                                          0,
                                        )
                                      : "Not specified"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <Star className="h-4 w-4 inline mr-1" />
                                    Rating:{" "}
                                    {submission.data?.overallRating
                                      ? `${submission.data.overallRating}/5`
                                      : "Not rated"}
                                  </p>
                                  {submission.data?.image && (
                                    <p className="text-xs text-blue-600">
                                      <ImageIcon className="h-3 w-3 inline mr-1" />
                                      Image available
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsSubmissionDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleApproveSubmission(submission.id, {
                                    name: `${submission.data?.hostCity ?? "Unknown"}, ${submission.data?.hostCountry ?? "Unknown"}`,
                                    city:
                                      submission.data?.hostCity ?? "Unknown",
                                    country:
                                      submission.data?.hostCountry ?? "Unknown",
                                    description:
                                      submission.data?.experienceDescription ??
                                      "",
                                    ...submission.data,
                                  })
                                }
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleRejectSubmission(submission.id)
                                }
                              >
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="published">
                {/* Published Destinations Tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((destination) => (
                    <Card
                      key={destination.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {destination.city}
                            </CardTitle>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {destination.country}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(destination)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(destination.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              {destination.studentCount} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Euro className="h-4 w-4 text-green-500" />€
                              {destination.avgCostPerMonth ||
                                Math.round(
                                  destination.avgRent +
                                    destination.avgLivingExpenses,
                                )}
                              /mo
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {destination.rating ||
                                destination.avgAccommodationRating ||
                                "N/A"}
                            </span>
                            <Badge
                              className={
                                (destination.costLevel ||
                                  getCostLevel(destination)) === "low"
                                  ? "bg-green-500"
                                  : (destination.costLevel ||
                                        getCostLevel(destination)) === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }
                            >
                              {destination.costLevel ||
                                getCostLevel(destination)}{" "}
                              cost
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-600">
                            <p className="line-clamp-2">
                              {destination.description ||
                                `${destination.city}, ${destination.country} - Based on ${destination.studentCount} student submission${destination.studentCount !== 1 ? "s" : ""}`}
                            </p>
                          </div>

                          {destination.cityInfo && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Info className="h-3 w-3" />
                              General city data available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Edit Destination: {editingDestination?.city}
                  </DialogTitle>
                </DialogHeader>

                {editingDestination && (
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="costs">Costs & Stats</TabsTrigger>
                      <TabsTrigger value="city">City Info</TabsTrigger>
                      <TabsTrigger value="practical">Practical</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">City</label>
                          <Input
                            value={editingDestination.city}
                            onChange={(e) =>
                              updateEditingField("city", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Country</label>
                          <Input
                            value={editingDestination.country}
                            onChange={(e) =>
                              updateEditingField("country", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          value={editingDestination.description}
                          onChange={(e) =>
                            updateEditingField("description", e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Image URL</label>
                        <Input
                          value={editingDestination.image}
                          onChange={(e) =>
                            updateEditingField("image", e.target.value)
                          }
                          placeholder="/images/destinations/city-name.svg"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Highlights (comma-separated)
                        </label>
                        <Input
                          value={
                            editingDestination.highlights?.join(", ") || ""
                          }
                          onChange={(e) =>
                            updateEditingField(
                              "highlights",
                              e.target.value
                                .split(", ")
                                .filter((h) => h.trim()),
                            )
                          }
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="costs" className="space-y-4 mt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Rating</label>
                          <Input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={
                              editingDestination.rating ||
                              editingDestination.avgAccommodationRating ||
                              0
                            }
                            onChange={(e) =>
                              updateEditingField(
                                "rating",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Student Count
                          </label>
                          <Input
                            type="number"
                            value={editingDestination.studentCount}
                            onChange={(e) =>
                              updateEditingField(
                                "studentCount",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Avg Cost/Month (€)
                          </label>
                          <Input
                            type="number"
                            value={
                              editingDestination.avgCostPerMonth ||
                              Math.round(
                                (editingDestination.avgRent || 0) +
                                  (editingDestination.avgLivingExpenses || 0),
                              )
                            }
                            onChange={(e) =>
                              updateEditingField(
                                "avgCostPerMonth",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Cost Level
                        </label>
                        <Select
                          value={
                            editingDestination.costLevel ||
                            getCostLevel(editingDestination)
                          }
                          onValueChange={(value) =>
                            updateEditingField("costLevel", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Popular Universities (comma-separated)
                        </label>
                        <Textarea
                          value={
                            (
                              editingDestination.popularUniversities ||
                              editingDestination.universities
                            )?.join(", ") || ""
                          }
                          onChange={(e) =>
                            updateEditingField(
                              "popularUniversities",
                              e.target.value
                                .split(", ")
                                .filter((u) => u.trim()),
                            )
                          }
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="city" className="space-y-4 mt-4">
                      {editingDestination.cityInfo && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                Population
                              </label>
                              <Input
                                value={
                                  editingDestination.cityInfo.population || ""
                                }
                                onChange={(e) =>
                                  updateEditingField(
                                    "cityInfo.population",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Language
                              </label>
                              <Input
                                value={
                                  editingDestination.cityInfo.language || ""
                                }
                                onChange={(e) =>
                                  updateEditingField(
                                    "cityInfo.language",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                Currency
                              </label>
                              <Input
                                value={
                                  editingDestination.cityInfo.currency || ""
                                }
                                onChange={(e) =>
                                  updateEditingField(
                                    "cityInfo.currency",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Climate
                              </label>
                              <Input
                                value={
                                  editingDestination.cityInfo.climate || ""
                                }
                                onChange={(e) =>
                                  updateEditingField(
                                    "cityInfo.climate",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Top Attractions (comma-separated)
                            </label>
                            <Textarea
                              value={
                                editingDestination.cityInfo.topAttractions?.join(
                                  ", ",
                                ) || ""
                              }
                              onChange={(e) =>
                                updateEditingField(
                                  "cityInfo.topAttractions",
                                  e.target.value
                                    .split(", ")
                                    .filter((a) => a.trim()),
                                )
                              }
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Fun Facts (comma-separated)
                            </label>
                            <Textarea
                              value={
                                editingDestination.cityInfo.funFacts?.join(
                                  ", ",
                                ) || ""
                              }
                              onChange={(e) =>
                                updateEditingField(
                                  "cityInfo.funFacts",
                                  e.target.value
                                    .split(", ")
                                    .filter((f) => f.trim()),
                                )
                              }
                              rows={3}
                            />
                          </div>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="practical" className="space-y-4 mt-4">
                      {editingDestination.cityInfo?.practicalInfo && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                English Friendly
                              </label>
                              <Select
                                value={
                                  editingDestination.cityInfo.practicalInfo
                                    .englishFriendly
                                }
                                onValueChange={(value) =>
                                  updateEditingField(
                                    "cityInfo.practicalInfo.englishFriendly",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Excellent">
                                    Excellent
                                  </SelectItem>
                                  <SelectItem value="Very good">
                                    Very Good
                                  </SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Moderate">
                                    Moderate
                                  </SelectItem>
                                  <SelectItem value="Limited">
                                    Limited
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Safety Rating
                              </label>
                              <Select
                                value={
                                  editingDestination.cityInfo.practicalInfo
                                    .safetyRating
                                }
                                onValueChange={(value) =>
                                  updateEditingField(
                                    "cityInfo.practicalInfo.safetyRating",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Very high">
                                    Very High
                                  </SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Moderate">
                                    Moderate
                                  </SelectItem>
                                  <SelectItem value="Fair">Fair</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                Internet Speed
                              </label>
                              <Select
                                value={
                                  editingDestination.cityInfo.practicalInfo
                                    .internetSpeed
                                }
                                onValueChange={(value) =>
                                  updateEditingField(
                                    "cityInfo.practicalInfo.internetSpeed",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Very high">
                                    Very High
                                  </SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Moderate">
                                    Moderate
                                  </SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Healthcare Quality
                              </label>
                              <Select
                                value={
                                  editingDestination.cityInfo.practicalInfo
                                    .healthcareQuality
                                }
                                onValueChange={(value) =>
                                  updateEditingField(
                                    "cityInfo.practicalInfo.healthcareQuality",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Excellent">
                                    Excellent
                                  </SelectItem>
                                  <SelectItem value="Very good">
                                    Very Good
                                  </SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Moderate">
                                    Moderate
                                  </SelectItem>
                                  <SelectItem value="Fair">Fair</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Submission Preview Dialog */}
            <Dialog
              open={isSubmissionDialogOpen}
              onOpenChange={setIsSubmissionDialogOpen}
            >
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-2xl font-bold">
                      {selectedSubmission &&
                        `${selectedSubmission.data.hostCity}, ${selectedSubmission.data.hostCountry}`}
                    </DialogTitle>
                    <Badge className="ml-auto">PREVIEW</Badge>
                  </div>
                </DialogHeader>

                {selectedSubmission && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:gap-6">
                      {/* Hero section with image */}
                      <div className="w-full md:w-1/2 bg-gray-200 rounded-lg relative h-64">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Destination preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                No destination image yet
                              </p>
                              <Input
                                type="file"
                                accept="image/*"
                                className="mt-4"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setImagePreview(
                                        e.target?.result as string,
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side content - overview */}
                      <div className="w-full md:w-1/2 mt-4 md:mt-0">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-blue-500" />
                          <h3 className="text-lg font-semibold">
                            <Input
                              value={selectedSubmission.data.hostCity || ""}
                              onChange={(e) => {
                                setSelectedSubmission({
                                  ...selectedSubmission,
                                  data: {
                                    ...selectedSubmission.data,
                                    hostCity: e.target.value,
                                  },
                                });
                              }}
                              className="border-0 p-0 h-7 font-semibold text-lg focus-visible:ring-0"
                            />
                            ,{" "}
                            <Input
                              value={selectedSubmission.data.hostCountry || ""}
                              onChange={(e) => {
                                setSelectedSubmission({
                                  ...selectedSubmission,
                                  data: {
                                    ...selectedSubmission.data,
                                    hostCountry: e.target.value,
                                  },
                                });
                              }}
                              className="border-0 p-0 h-7 font-semibold text-lg focus-visible:ring-0"
                            />
                          </h3>
                        </div>

                        {/* University */}
                        <div className="mb-4">
                          <Label className="text-sm font-medium mb-1 block">
                            Host University
                          </Label>
                          <Input
                            value={selectedSubmission.data.hostUniversity || ""}
                            onChange={(e) => {
                              setSelectedSubmission({
                                ...selectedSubmission,
                                data: {
                                  ...selectedSubmission.data,
                                  hostUniversity: e.target.value,
                                },
                              });
                            }}
                          />
                        </div>

                        {/* Rating and badges */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-yellow-500 mr-1" />
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              step="0.5"
                              value={selectedSubmission.data.overallRating || 4}
                              onChange={(e) => {
                                setSelectedSubmission({
                                  ...selectedSubmission,
                                  data: {
                                    ...selectedSubmission.data,
                                    overallRating: parseFloat(e.target.value),
                                  },
                                });
                              }}
                              className="w-16 h-8 p-0 px-2 inline-block"
                            />
                            <span className="text-gray-500">/5</span>
                          </div>

                          <Badge className="bg-green-500">
                            {selectedSubmission.data.monthlyRent &&
                            selectedSubmission.data.foodExpenses
                              ? selectedSubmission.data.monthlyRent +
                                  selectedSubmission.data.foodExpenses <
                                800
                                ? "Low Cost"
                                : selectedSubmission.data.monthlyRent +
                                      selectedSubmission.data.foodExpenses <
                                    1200
                                  ? "Medium Cost"
                                  : "High Cost"
                              : "Cost Unknown"}
                          </Badge>
                        </div>

                        {/* Cost breakdown */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium mb-3">
                            Monthly Cost Breakdown
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500">
                                Rent (€)
                              </Label>
                              <Input
                                type="number"
                                value={selectedSubmission.data.monthlyRent || 0}
                                onChange={(e) => {
                                  setSelectedSubmission({
                                    ...selectedSubmission,
                                    data: {
                                      ...selectedSubmission.data,
                                      monthlyRent: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Food (€)
                              </Label>
                              <Input
                                type="number"
                                value={
                                  selectedSubmission.data.foodExpenses || 0
                                }
                                onChange={(e) => {
                                  setSelectedSubmission({
                                    ...selectedSubmission,
                                    data: {
                                      ...selectedSubmission.data,
                                      foodExpenses: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Transport (€)
                              </Label>
                              <Input
                                type="number"
                                value={
                                  selectedSubmission.data.transportExpenses || 0
                                }
                                onChange={(e) => {
                                  setSelectedSubmission({
                                    ...selectedSubmission,
                                    data: {
                                      ...selectedSubmission.data,
                                      transportExpenses: parseFloat(
                                        e.target.value,
                                      ),
                                    },
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Entertainment (€)
                              </Label>
                              <Input
                                type="number"
                                value={
                                  selectedSubmission.data
                                    .entertainmentExpenses || 0
                                }
                                onChange={(e) => {
                                  setSelectedSubmission({
                                    ...selectedSubmission,
                                    data: {
                                      ...selectedSubmission.data,
                                      entertainmentExpenses: parseFloat(
                                        e.target.value,
                                      ),
                                    },
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Monthly</span>
                              <span className="font-bold">
                                €
                                {(
                                  (selectedSubmission.data.monthlyRent || 0) +
                                  (selectedSubmission.data.foodExpenses || 0) +
                                  (selectedSubmission.data.transportExpenses ||
                                    0) +
                                  (selectedSubmission.data
                                    .entertainmentExpenses || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Experience Description */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-lg mb-2">
                        Student Experience
                      </h3>
                      <Textarea
                        value={
                          selectedSubmission.data.experienceDescription || ""
                        }
                        rows={4}
                        placeholder="Student's experience description goes here..."
                        onChange={(e) => {
                          setSelectedSubmission({
                            ...selectedSubmission,
                            data: {
                              ...selectedSubmission.data,
                              experienceDescription: e.target.value,
                            },
                          });
                        }}
                        className="mb-4"
                      />

                      {/* Recommendations */}
                      <h4 className="font-medium mb-2">
                        Student Recommendations
                      </h4>
                      <Textarea
                        value={selectedSubmission.data.recommendations || ""}
                        rows={3}
                        placeholder="Student's recommendations for future students..."
                        onChange={(e) => {
                          setSelectedSubmission({
                            ...selectedSubmission,
                            data: {
                              ...selectedSubmission.data,
                              recommendations: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>

                    {/* Highlights */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-lg mb-2">Highlights</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedSubmission.data.highlights &&
                        Array.isArray(selectedSubmission.data.highlights) ? (
                          selectedSubmission.data.highlights.map(
                            (highlight, index) => (
                              <Badge
                                key={index}
                                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                {highlight}
                              </Badge>
                            ),
                          )
                        ) : (
                          <p className="text-gray-500 italic text-sm">
                            No highlights provided
                          </p>
                        )}
                      </div>
                      <Input
                        placeholder="Add highlights as comma-separated values (e.g. Nice City, Good Food, Affordable)"
                        value={selectedSubmission.data.highlightsInput || ""}
                        onChange={(e) => {
                          setSelectedSubmission({
                            ...selectedSubmission,
                            data: {
                              ...selectedSubmission.data,
                              highlightsInput: e.target.value,
                              highlights: e.target.value
                                .split(",")
                                .map((h) => h.trim())
                                .filter((h) => h),
                            },
                          });
                        }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsSubmissionDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleApproveSubmission(selectedSubmission.id, {
                            name: `${selectedSubmission.data.hostCity}, ${selectedSubmission.data.hostCountry}`,
                            city: selectedSubmission.data.hostCity,
                            country: selectedSubmission.data.hostCountry,
                            description:
                              selectedSubmission.data.experienceDescription,
                            highlights: selectedSubmission.data.highlights,
                            ...selectedSubmission.data,
                            image: imagePreview || null,
                          });
                          setIsSubmissionDialogOpen(false);
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve & Publish
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleRejectSubmission(selectedSubmission.id);
                          setIsSubmissionDialogOpen(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}
