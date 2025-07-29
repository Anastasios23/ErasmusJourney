import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu";
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
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

interface AdminStoryData {
  id: string;
  studentName: string;
  university: string;
  city: string;
  country: string;
  story: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "PUBLISHED"
    | "SUBMITTED"
    | "DELETED";
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  moderatorNotes?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DELETED", label: "Deleted" },
];

export default function AdminStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<AdminStoryData[]>([]);
  const [filteredStories, setFilteredStories] = useState<AdminStoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStory, setSelectedStory] = useState<AdminStoryData | null>(
    null,
  );

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, searchTerm, statusFilter]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stories");
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = stories;

    if (searchTerm) {
      filtered = filtered.filter(
        (story) =>
          story.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.story.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((story) => story.status === statusFilter);
    }

    setFilteredStories(filtered);
  };

  const updateStoryStatus = async (
    storyId: string,
    newStatus: AdminStoryData["status"],
    notes?: string,
  ) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          moderatorNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update story status");
      }

      // Update local state
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? { ...story, status: newStatus, moderatorNotes: notes }
            : story,
        ),
      );
    } catch (err) {
      console.error("Error updating story status:", err);
      alert("Failed to update story status");
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete story");
      }

      // Remove from local state
      setStories((prev) => prev.filter((story) => story.id !== storyId));
    } catch (err) {
      console.error("Error deleting story:", err);
      alert("Failed to delete story");
    }
  };

  const exportStories = async () => {
    try {
      const response = await fetch("/api/admin/stories/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student-stories-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting stories:", err);
      alert("Failed to export stories");
    }
  };

  const getStatusBadge = (status: AdminStoryData["status"]) => {
    const statusConfig = {
      PENDING: {
        variant: "warning" as const,
        label: "Pending Review",
      },
      APPROVED: {
        variant: "success" as const,
        label: "Approved",
      },
      PUBLISHED: {
        variant: "info" as const,
        label: "Published",
      },
      REJECTED: {
        variant: "error" as const,
        label: "Rejected",
      },
      SUBMITTED: {
        variant: "secondary" as const,
        label: "Submitted",
      },
      DELETED: {
        variant: "outline" as const,
        label: "Deleted",
      },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading stories...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin - Student Stories | Erasmus Journey</title>
        <meta
          name="description"
          content="Manage and moderate student stories"
        />
      </Head>

      <Header />

      <main className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Story Management
              </h1>
              <p className="text-gray-600 mt-2">
                Review, moderate, and manage student stories
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportStories}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={fetchStories}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Search Stories</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search by name, university, city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">
                  {stories.filter((s) => s.status === "PENDING").length}
                </div>
                <p className="text-sm text-gray-600">Pending Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {stories.filter((s) => s.status === "PUBLISHED").length}
                </div>
                <p className="text-sm text-gray-600">Published</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {stories.filter((s) => s.status === "APPROVED").length}
                </div>
                <p className="text-sm text-gray-600">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {stories.filter((s) => s.status === "REJECTED").length}
                </div>
                <p className="text-sm text-gray-600">Rejected</p>
              </CardContent>
            </Card>
          </div>

          {/* Stories Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Stories ({filteredStories.length} of {stories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {story.studentName}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {story.story.substring(0, 50)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{story.university}</TableCell>
                        <TableCell>
                          {story.city}, {story.country}
                        </TableCell>
                        <TableCell>{getStatusBadge(story.status)}</TableCell>
                        <TableCell>
                          {new Date(story.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/stories/${story.id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStoryStatus(story.id, "APPROVED")
                                }
                                disabled={story.status === "APPROVED"}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStoryStatus(story.id, "PUBLISHED")
                                }
                                disabled={story.status === "PUBLISHED"}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStoryStatus(story.id, "REJECTED")
                                }
                                disabled={story.status === "REJECTED"}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Story
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      story? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteStory(story.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredStories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No stories found matching your criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
