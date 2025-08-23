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

  // safeFetch function to bypass FullStory interference using XMLHttpRequest
  const safeFetch = async (
    url: string,
    options: {
      method?: string;
      body?: string;
      headers?: Record<string, string>;
    } = {},
    retries = 3,
  ) => {
    const method = options.method || "GET";
    console.log(
      `${method} ${url} using XMLHttpRequest to bypass FullStory interference...`,
    );

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await new Promise<{
          ok: boolean;
          status: number;
          json: () => Promise<any>;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(method, url, true);

          // Set headers
          if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }

          xhr.onload = () => {
            try {
              const responseData = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : {};
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                json: async () => responseData,
              });
            } catch (parseError) {
              console.warn(
                `JSON parse error on attempt ${attempt}:`,
                parseError,
              );
              resolve({
                ok: false,
                status: xhr.status,
                json: async () => ({}),
              });
            }
          };

          xhr.onerror = () => {
            reject(
              new Error(
                `XMLHttpRequest failed: ${xhr.status} ${xhr.statusText}`,
              ),
            );
          };

          xhr.ontimeout = () => {
            reject(new Error("XMLHttpRequest timeout"));
          };

          xhr.timeout = 30000; // 30 second timeout

          if (options.body) {
            xhr.send(options.body);
          } else {
            xhr.send();
          }
        });

        console.log(`${method} ${url} completed with status:`, response.status);
        return response;
      } catch (error) {
        console.warn(
          `Attempt ${attempt}/${retries} failed for ${method} ${url}:`,
          error,
        );

        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(`All ${retries} attempts failed for ${method} ${url}`);
  };

  // Fetch pending submissions
  useEffect(() => {
    fetchPendingSubmissions();
    fetchLiveDestinations();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      console.log("Fetching pending submissions...");
      const response = await safeFetch(
        "/api/admin/form-submissions?status=SUBMITTED",
      );

      if (response.status === 403) {
        setError("Unauthorized: Admin access required");
        // AUTHENTICATION DISABLED - Comment out to re-enable
        // router.push("/login");
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

      console.log(
        "Pending submissions fetched successfully:",
        destinationSubmissions.length,
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
      console.log("Fetching live destinations...");
      const response = await safeFetch("/api/admin/destinations");

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

      console.log(
        "Live destinations fetched successfully:",
        destinations.length,
      );
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
      const submissionResponse = await safeFetch(
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
      const destinationResponse = await safeFetch("/api/admin/destinations", {
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
      console.log(
        "Rejecting submission:",
        submissionId,
        "with reason:",
        reason,
      );
      const response = await safeFetch(
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

      if (response.ok) {
        console.log("✅ Submission rejected successfully");
      } else {
        console.error("Failed to reject submission, status:", response.status);
      }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Admin Destinations
            </h1>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && (
              <div>
                <p>Pending submissions: {pendingSubmissions.length}</p>
                <p>Live destinations: {liveDestinations.length}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
