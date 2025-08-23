import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
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
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { Label } from "../../src/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  MapPin,
  Plus,
  Eye,
  Edit,
  Check,
  X,
  Save,
  Users,
  Euro,
  Star,
  Home,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

interface FormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  data: any;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  status: string;
  description?: string;
  imageUrl?: string;
  submissionCount: number;
  averageRating?: number;
  averageCost?: number;
}

export default function DestinationsAdmin() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: 'anonymous', role: 'ADMIN', email: 'admin@example.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submissions");
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: "",
    city: "",
    country: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    // AUTHENTICATION DISABLED - Comment out to re-enable
    // if (status === "loading") return;

    // if (!session || session.user?.role !== "ADMIN") {
    //   router.push("/login");
    //   return;
    // }

    console.log('Initializing destinations admin dashboard...');
    setLoading(false);
    fetchData();
  }, []); // Removed dependencies since auth is disabled

  // Safe fetch to bypass FullStory interference
  const safeJsonParse = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const safeFetch = async (url: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}, retries = 3) => {
    const method = options.method || 'GET';
    console.log(`${method} ${url} using XMLHttpRequest to bypass FullStory interference...`);

    for (let i = 0; i < retries; i++) {
      try {
        // Use XMLHttpRequest as fallback to bypass FullStory fetch interception
        const xhr = new XMLHttpRequest();
        const result = await new Promise((resolve, reject) => {
          xhr.open(method, url, true);

          // Set default headers
          xhr.setRequestHeader('Content-Type', 'application/json');

          // Set custom headers if provided
          if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                const data = xhr.responseText ? safeJsonParse(xhr.responseText) : { ok: true };
                resolve(data);
              } else {
                reject(new Error(`HTTP ${xhr.status}`));
              }
            }
          };
          xhr.onerror = () => reject(new Error('Network error'));

          // Send body if provided
          xhr.send(options.body || null);
        });
        return result;
      } catch (error) {
        console.warn(`${method} attempt ${i + 1}/${retries} failed for ${url}:`, error);
        if (i === retries - 1) throw error;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  };

  const fetchData = async () => {
    try {
      // Fetch destination-related submissions using safeFetch
      const submissionsData = await safeFetch("/api/admin/form-submissions?status=SUBMITTED");
      if (submissionsData) {
        setSubmissions(
          submissionsData.submissions?.filter((s: FormSubmission) =>
            [
              "basic-info",
              "accommodation",
              "living-expenses",
              "help-future-students",
            ].includes(s.type),
          ) || submissionsData.filter?.((s: FormSubmission) =>
            [
              "basic-info",
              "accommodation",
              "living-expenses",
              "help-future-students",
            ].includes(s.type),
          ) || [],
        );
      }

      // Fetch existing destinations using safeFetch
      const destinationsData = await safeFetch("/api/destinations");
      if (destinationsData) {
        setDestinations(destinationsData.destinations || destinationsData || []);
      }

      console.log('Destinations data loaded successfully:', {
        submissions: submissionsData?.submissions?.length || submissionsData?.length || 0,
        destinations: destinationsData?.destinations?.length || destinationsData?.length || 0
      });
    } catch (error) {
      console.error("Error fetching destinations data:", error);
      // Set fallback empty arrays to prevent UI crashes
      setSubmissions([]);
      setDestinations([]);
    }
  };

  const createDestinationFromSubmission = async (
    submission: FormSubmission,
  ) => {
    try {
      const basicInfoData = submission.data;
      const destinationData = {
        name: `${basicInfoData.hostCity}, ${basicInfoData.hostCountry}`,
        city: basicInfoData.hostCity,
        country: basicInfoData.hostCountry,
        description: `Study destination in ${basicInfoData.hostCity}, ${basicInfoData.hostCountry}`,
        source: "user_generated",
        submissionId: submission.id,
      };

      const response = await safeFetch("/api/admin/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(destinationData),
      });

      if (response) {
        // Mark submission as processed
        await safeFetch(`/api/admin/form-submissions/${submission.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "PUBLISHED" }),
        });

        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error creating destination:", error);
    }
  };

  const handleSubmissionApproval = async (
    submissionId: string,
    action: "approve" | "reject",
  ) => {
    try {
      const newStatus = action === "approve" ? "PUBLISHED" : "ARCHIVED";

      const response = await safeFetch(
        `/api/admin/form-submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response) {
        await fetchData(); // Refresh data
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error updating submission:", error);
    }
  };

  const createNewDestination = async () => {
    try {
      const response = await safeFetch("/api/admin/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newDestination,
          source: "admin_created",
        }),
      });

      if (response) {
        setNewDestination({
          name: "",
          city: "",
          country: "",
          description: "",
          imageUrl: "",
        });
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error creating destination:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      "basic-info": Users,
      accommodation: Home,
      "living-expenses": Euro,
      "help-future-students": Star,
    };

    const IconComponent = iconMap[type as keyof typeof iconMap] || MapPin;
    return <IconComponent className="h-4 w-4" />;
  };

  const getLocationFromSubmission = (submission: FormSubmission) => {
    const data = submission.data;
    if (submission.type === "basic-info") {
      return `${data.hostCity || "Unknown"}, ${data.hostCountry || "Unknown"}`;
    }
    return "Location not specified";
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATION DISABLED - Comment out to re-enable
  // if (!session || session.user?.role !== "ADMIN") {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Destinations Management - Admin</title>
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Destinations Management
            </h1>
            <p className="text-gray-600">
              Review submissions and manage destination content
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">
              Pending Submissions (
              {submissions.filter((s) => s.status === "SUBMITTED").length})
            </TabsTrigger>
            <TabsTrigger value="destinations">
              Published Destinations
            </TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Submissions for Review</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.filter((s) => s.status === "SUBMITTED").length ===
                0 ? (
                  <div className="text-center py-8">
                    <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600">
                      No destination submissions waiting for review.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions
                        .filter((s) => s.status === "SUBMITTED")
                        .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(submission.type)}
                                <span className="capitalize">
                                  {submission.type.replace("-", " ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getLocationFromSubmission(submission)}
                            </TableCell>
                            <TableCell>
                              {submission.user
                                ? `${submission.user.firstName || ""} ${submission.user.lastName || ""}`.trim() ||
                                  submission.user.email
                                : "Unknown User"}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                submission.createdAt,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedSubmission(submission)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Review: {submission.title}
                                      </DialogTitle>
                                    </DialogHeader>
                                    {selectedSubmission && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <strong>Type:</strong>{" "}
                                            {selectedSubmission.type.replace(
                                              "-",
                                              " ",
                                            )}
                                          </div>
                                          <div>
                                            <strong>Location:</strong>{" "}
                                            {getLocationFromSubmission(
                                              selectedSubmission,
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <strong>Submission Data:</strong>
                                          <div className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                                            {Object.entries(
                                              selectedSubmission.data,
                                            ).map(([key, value]) => (
                                              <div key={key} className="mb-2">
                                                <strong>{key}:</strong>{" "}
                                                {JSON.stringify(value, null, 2)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="flex space-x-2 pt-4 border-t">
                                          <Button
                                            onClick={() =>
                                              handleSubmissionApproval(
                                                selectedSubmission.id,
                                                "approve",
                                              )
                                            }
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                          </Button>
                                          {selectedSubmission.type ===
                                            "basic-info" && (
                                            <Button
                                              onClick={() =>
                                                createDestinationFromSubmission(
                                                  selectedSubmission,
                                                )
                                              }
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              <MapPin className="h-4 w-4 mr-1" />
                                              Create Destination
                                            </Button>
                                          )}
                                          <Button
                                            onClick={() =>
                                              handleSubmissionApproval(
                                                selectedSubmission.id,
                                                "reject",
                                              )
                                            }
                                            variant="destructive"
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  onClick={() =>
                                    handleSubmissionApproval(
                                      submission.id,
                                      "approve",
                                    )
                                  }
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleSubmissionApproval(
                                      submission.id,
                                      "reject",
                                    )
                                  }
                                  size="sm"
                                  variant="destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.map((destination) => (
                      <TableRow key={destination.id}>
                        <TableCell className="font-medium">
                          {destination.name}
                        </TableCell>
                        <TableCell>{destination.city}</TableCell>
                        <TableCell>{destination.country}</TableCell>
                        <TableCell>{destination.submissionCount}</TableCell>
                        <TableCell>
                          {destination.averageRating ? (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              {destination.averageRating.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-gray-400">No ratings</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Destination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newDestination.city}
                      onChange={(e) =>
                        setNewDestination({
                          ...newDestination,
                          city: e.target.value,
                        })
                      }
                      placeholder="e.g., Barcelona"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newDestination.country}
                      onChange={(e) =>
                        setNewDestination({
                          ...newDestination,
                          country: e.target.value,
                        })
                      }
                      placeholder="e.g., Spain"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Destination Name</Label>
                  <Input
                    id="name"
                    value={newDestination.name}
                    onChange={(e) =>
                      setNewDestination({
                        ...newDestination,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Barcelona, Spain"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDestination.description}
                    onChange={(e) =>
                      setNewDestination({
                        ...newDestination,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of the destination..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={newDestination.imageUrl}
                    onChange={(e) =>
                      setNewDestination({
                        ...newDestination,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <Button
                  onClick={createNewDestination}
                  disabled={
                    !newDestination.city ||
                    !newDestination.country ||
                    !newDestination.name
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Destination
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
