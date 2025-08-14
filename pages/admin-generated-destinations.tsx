import React, { useState } from "react";
import {
  useAdminDestinations,
  useUpdateDestination,
  useDeleteDestination,
} from "../src/hooks/useAdminDestinations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
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
} from "../src/components/ui/alert-dialog";
import { useToast } from "../src/components/ui/use-toast";
import {
  Loader2,
  MapPin,
  Users,
  Euro,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react";
import { useRouter } from "next/router";

const statusColors = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  DRAFT: Clock,
  PUBLISHED: CheckCircle,
  ARCHIVED: Archive,
};

export default function AdminDestinationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useAdminDestinations({
    status: statusFilter || undefined,
    page: currentPage,
    limit: 20,
  });

  const updateDestination = useUpdateDestination();
  const deleteDestination = useDeleteDestination();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDestination.mutateAsync({ id, updates: { status } });
      toast({
        title: "Success",
        description: `Destination status updated to ${status.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update destination status",
        variant: "destructive",
      });
    }
  };

  const handleFeaturedToggle = async (id: string, featured: boolean) => {
    try {
      await updateDestination.mutateAsync({ id, updates: { featured } });
      toast({
        title: "Success",
        description: `Destination ${featured ? "featured" : "unfeatured"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDestination.mutateAsync(id);
      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error loading destinations
          </h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Destinations Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage auto-generated destinations from student submissions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Destinations
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.pagination.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        data.destinations.filter(
                          (d) => d.status === "PUBLISHED",
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        data.destinations.filter((d) => d.status === "DRAFT")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Featured
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.destinations.filter((d) => d.featured).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Destinations List */}
        <div className="space-y-4">
          {data?.destinations.map((destination) => {
            const StatusIcon =
              statusIcons[destination.status as keyof typeof statusIcons];

            return (
              <Card
                key={destination.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {destination.adminTitle ||
                            `${destination.city}, ${destination.country}`}
                        </CardTitle>
                        <Badge
                          className={
                            statusColors[
                              destination.status as keyof typeof statusColors
                            ]
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {destination.status}
                        </Badge>
                        {destination.featured && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {destination.totalSubmissions} submissions
                        </div>
                        {destination.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {destination.averageRating.toFixed(1)} avg rating
                          </div>
                        )}
                        {destination.averageMonthlyCost && (
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />€
                            {Math.round(destination.averageMonthlyCost)}/month
                            avg
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/destinations/${destination.id}`)
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleFeaturedToggle(
                            destination.id,
                            !destination.featured,
                          )
                        }
                      >
                        {destination.featured ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Destination
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this destination?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(destination.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Select
                      value={destination.status}
                      onValueChange={(status) =>
                        handleStatusUpdate(destination.id, status)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {destination.adminDescription && (
                    <p className="text-sm text-gray-600 mb-3">
                      {destination.adminDescription.slice(0, 200)}...
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {destination.accommodations.length} accommodations,{" "}
                      {destination.courseExchanges.length} academic experiences
                    </span>
                    <span>
                      Updated{" "}
                      {new Date(destination.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {data.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(data.pagination.totalPages, prev + 1),
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
