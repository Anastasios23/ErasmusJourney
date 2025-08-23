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
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
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
  BookOpen,
  Eye,
  Check,
  X,
  Star,
  MapPin,
  User,
  Calendar,
  ArrowLeft,
} from "lucide-react";

interface StorySubmission {
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

export default function StoriesAdmin() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: 'anonymous', role: 'ADMIN', email: 'admin@example.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<StorySubmission[]>([]);
  const [selectedStory, setSelectedStory] = useState<StorySubmission | null>(
    null,
  );

  // safeFetch function to bypass FullStory interference using XMLHttpRequest
  const safeFetch = async (url: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}, retries = 3) => {
    const method = options.method || 'GET';
    console.log(`${method} ${url} using XMLHttpRequest to bypass FullStory interference...`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await new Promise<{ok: boolean; status: number; json: () => Promise<any>}>((resolve, reject) => {
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
              const responseData = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                json: async () => responseData
              });
            } catch (parseError) {
              console.warn(`JSON parse error on attempt ${attempt}:`, parseError);
              resolve({
                ok: false,
                status: xhr.status,
                json: async () => ({})
              });
            }
          };

          xhr.onerror = () => {
            reject(new Error(`XMLHttpRequest failed: ${xhr.status} ${xhr.statusText}`));
          };

          xhr.ontimeout = () => {
            reject(new Error('XMLHttpRequest timeout'));
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
        console.warn(`Attempt ${attempt}/${retries} failed for ${method} ${url}:`, error);

        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`All ${retries} attempts failed for ${method} ${url}`);
  };

  useEffect(() => {
    if (status === "loading") return;

    // AUTHENTICATION DISABLED - Comment out to re-enable
    // if (!session || session.user?.role !== "ADMIN") {
    //   router.push("/login");
    //   return;
    // }

    setLoading(false);
    fetchStories();
  }, [/*session, status, router*/]);

  const fetchStories = async () => {
    try {
      console.log('Fetching stories...');
      const response = await safeFetch("/api/admin/stories");
      if (response.ok) {
        const data = await response.json();
        console.log('Stories fetched successfully:', data?.stories?.length || 0);
        setStories(data.stories || []);
      } else {
        console.error('Failed to fetch stories, status:', response.status);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
    }
  };

  const handleStoryAction = async (
    storyId: string,
    action: "approve" | "reject" | "feature",
  ) => {
    try {
      let newStatus = "PUBLISHED";
      if (action === "reject") newStatus = "ARCHIVED";
      if (action === "feature") newStatus = "FEATURED";

      console.log(`${action} story:`, storyId, 'to status:', newStatus);

      const response = await safeFetch(`/api/admin/stories/${storyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          featured: action === "feature",
        }),
      });

      if (response.ok) {
        console.log(`Successfully ${action}d story`);
        await fetchStories(); // Refresh data
        setSelectedStory(null);
      } else {
        console.error(`Failed to ${action} story, status:`, response.status);
      }
    } catch (error) {
      console.error("Error updating story:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      SUBMITTED: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending Review",
      },
      PUBLISHED: { color: "bg-green-100 text-green-800", label: "Published" },
      FEATURED: { color: "bg-blue-100 text-blue-800", label: "Featured" },
      ARCHIVED: { color: "bg-red-100 text-red-800", label: "Archived" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getLocationFromStory = (story: StorySubmission) => {
    const data = story.data;
    if (data.hostCity && data.hostCountry) {
      return `${data.hostCity}, ${data.hostCountry}`;
    }
    if (data.city && data.country) {
      return `${data.city}, ${data.country}`;
    }
    return "Location not specified";
  };

  const getRatingFromStory = (story: StorySubmission) => {
    const data = story.data;
    if (data.overallRating) {
      return data.overallRating;
    }
    if (data.ratings && data.ratings.overallRating) {
      return data.ratings.overallRating;
    }
    return null;
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

  const pendingStories = stories.filter((s) => s.status === "SUBMITTED");
  const publishedStories = stories.filter((s) => s.status === "PUBLISHED");
  const featuredStories = stories.filter((s) => s.status === "FEATURED");

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Stories Management - Admin</title>
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stories Management
          </h1>
          <p className="text-gray-600">
            Review and manage student stories and experiences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingStories.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {publishedStories.length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {featuredStories.length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Stories
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stories.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Stories Section */}
        {pendingStories.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-yellow-600" />
                Stories Pending Review ({pendingStories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingStories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {story.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {getLocationFromStory(story)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-400" />
                          {story.user
                            ? `${story.user.firstName || ""} ${story.user.lastName || ""}`.trim() ||
                              story.user.email
                            : "Unknown User"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRatingFromStory(story) ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {getRatingFromStory(story)}/5
                          </div>
                        ) : (
                          <span className="text-gray-400">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(story.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStory(story)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Review Story: {story.title}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedStory && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <strong>Location:</strong>{" "}
                                      {getLocationFromStory(selectedStory)}
                                    </div>
                                    <div>
                                      <strong>Rating:</strong>{" "}
                                      {getRatingFromStory(selectedStory) ||
                                        "No rating"}
                                    </div>
                                  </div>

                                  <div>
                                    <strong>Story Content:</strong>
                                    <div className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                                      {Object.entries(selectedStory.data).map(
                                        ([key, value]) => (
                                          <div key={key} className="mb-3">
                                            <strong className="block text-gray-700">
                                              {key
                                                .replace(/([A-Z])/g, " $1")
                                                .replace(/^./, (str) =>
                                                  str.toUpperCase(),
                                                )}
                                              :
                                            </strong>
                                            <div className="mt-1 pl-2 border-l-2 border-gray-300">
                                              {typeof value === "string"
                                                ? value
                                                : JSON.stringify(
                                                    value,
                                                    null,
                                                    2,
                                                  )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex space-x-2 pt-4 border-t">
                                    <Button
                                      onClick={() =>
                                        handleStoryAction(
                                          selectedStory.id,
                                          "approve",
                                        )
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleStoryAction(
                                          selectedStory.id,
                                          "feature",
                                        )
                                      }
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Feature
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleStoryAction(
                                          selectedStory.id,
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
                              handleStoryAction(story.id, "approve")
                            }
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() =>
                              handleStoryAction(story.id, "feature")
                            }
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Star className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() =>
                              handleStoryAction(story.id, "reject")
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
            </CardContent>
          </Card>
        )}

        {/* All Stories Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {story.title}
                    </TableCell>
                    <TableCell>{getStatusBadge(story.status)}</TableCell>
                    <TableCell>{getLocationFromStory(story)}</TableCell>
                    <TableCell>
                      {story.user
                        ? `${story.user.firstName || ""} ${story.user.lastName || ""}`.trim() ||
                          story.user.email
                        : "Unknown User"}
                    </TableCell>
                    <TableCell>
                      {new Date(story.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
