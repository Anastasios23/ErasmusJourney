import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  useAdminDestination,
  useUpdateDestination,
  useUpdateAccommodation,
  useUpdateCourseExchange,
} from "../../../src/hooks/useAdminDestinations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import { Textarea } from "../../../src/components/ui/textarea";
import { Badge } from "../../../src/components/ui/badge";
import { Switch } from "../../../src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../src/components/ui/select";
import { useToast } from "../../../src/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../src/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  Save,
  MapPin,
  Users,
  Euro,
  Star,
  Home,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminDestinationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const {
    data: destination,
    isLoading,
    error,
  } = useAdminDestination(id as string);
  const updateDestination = useUpdateDestination();
  const updateAccommodation = useUpdateAccommodation();
  const updateCourseExchange = useUpdateCourseExchange();

  // Form state
  const [formData, setFormData] = useState({
    adminTitle: "",
    adminDescription: "",
    adminImageUrl: "",
    status: "DRAFT",
    featured: false,
  });

  // Initialize form data when destination loads
  React.useEffect(() => {
    if (destination) {
      setFormData({
        adminTitle: destination.adminTitle || "",
        adminDescription: destination.adminDescription || "",
        adminImageUrl: destination.adminImageUrl || "",
        status: destination.status,
        featured: destination.featured,
      });
    }
  }, [destination]);

  const handleSave = async () => {
    try {
      await updateDestination.mutateAsync({
        id: id as string,
        updates: formData,
      });

      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive",
      });
    }
  };

  const handleAccommodationUpdate = async (
    accommodationId: string,
    updates: any,
  ) => {
    try {
      await updateAccommodation.mutateAsync({
        id: accommodationId,
        updates,
      });

      toast({
        title: "Success",
        description: "Accommodation updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update accommodation",
        variant: "destructive",
      });
    }
  };

  const handleCourseExchangeUpdate = async (
    courseExchangeId: string,
    updates: any,
  ) => {
    try {
      await updateCourseExchange.mutateAsync({
        id: courseExchangeId,
        updates,
      });

      toast({
        title: "Success",
        description: "Course exchange updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course exchange",
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

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Destination not found
          </h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {destination.adminTitle ||
                  `${destination.city}, ${destination.country}`}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge
                  className={
                    destination.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
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
            </div>
            <Button onClick={handleSave} disabled={updateDestination.isPending}>
              {updateDestination.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Submissions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {destination.totalSubmissions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {destination.averageRating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg Rating
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {destination.averageRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {destination.averageMonthlyCost && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Euro className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg Monthly Cost
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        €{Math.round(destination.averageMonthlyCost)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Location
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {destination.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      {destination.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Destination Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, featured: checked }))
                      }
                    />
                    <label htmlFor="featured" className="text-sm font-medium">
                      Featured Destination
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Title</label>
                  <Input
                    value={formData.adminTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adminTitle: e.target.value,
                      }))
                    }
                    placeholder={`${destination.city}, ${destination.country}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.adminDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adminDescription: e.target.value,
                      }))
                    }
                    placeholder="Write a compelling description for this destination..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Image URL</label>
                  <Input
                    value={formData.adminImageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adminImageUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accommodations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Accommodation Experiences ({destination.accommodations.length}
                  )
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {destination.accommodations.map((accommodation: any) => (
                    <Card
                      key={accommodation.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {accommodation.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {accommodation.accommodationType} •{" "}
                              {accommodation.neighborhood}
                            </p>
                            {accommodation.monthlyRent && (
                              <p className="text-sm font-medium text-green-600">
                                €{accommodation.monthlyRent}/month
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleAccommodationUpdate(accommodation.id, {
                                  featured: !accommodation.featured,
                                })
                              }
                            >
                              {accommodation.featured ? (
                                <Star className="w-4 h-4 fill-current text-yellow-500" />
                              ) : (
                                <Star className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleAccommodationUpdate(accommodation.id, {
                                  visible: !accommodation.visible,
                                })
                              }
                            >
                              {accommodation.visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {accommodation.description}
                        </p>

                        {accommodation.pros &&
                          accommodation.pros.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-green-700 mb-1">
                                Pros:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {accommodation.pros.map(
                                  (pro: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs bg-green-100 text-green-800"
                                    >
                                      {pro}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {accommodation.cons &&
                          accommodation.cons.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-red-700 mb-1">
                                Cons:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {accommodation.cons.map(
                                  (con: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs bg-red-100 text-red-800"
                                    >
                                      {con}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Experiences ({destination.courseExchanges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {destination.courseExchanges.map((exchange: any) => (
                    <Card
                      key={exchange.id}
                      className="border-l-4 border-l-purple-500"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{exchange.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {exchange.hostUniversity} •{" "}
                              {exchange.fieldOfStudy}
                            </p>
                            {exchange.semester && (
                              <p className="text-sm text-gray-600">
                                {exchange.semester}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCourseExchangeUpdate(exchange.id, {
                                  featured: !exchange.featured,
                                })
                              }
                            >
                              {exchange.featured ? (
                                <Star className="w-4 h-4 fill-current text-yellow-500" />
                              ) : (
                                <Star className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCourseExchangeUpdate(exchange.id, {
                                  visible: !exchange.visible,
                                })
                              }
                            >
                              {exchange.visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {exchange.description}
                        </p>

                        {(exchange.courseQuality ||
                          exchange.professorQuality ||
                          exchange.facilityQuality) && (
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            {exchange.courseQuality && (
                              <div className="text-center">
                                <p className="text-xs text-gray-600">
                                  Course Quality
                                </p>
                                <p className="font-bold text-lg">
                                  {exchange.courseQuality}/5
                                </p>
                              </div>
                            )}
                            {exchange.professorQuality && (
                              <div className="text-center">
                                <p className="text-xs text-gray-600">
                                  Professors
                                </p>
                                <p className="font-bold text-lg">
                                  {exchange.professorQuality}/5
                                </p>
                              </div>
                            )}
                            {exchange.facilityQuality && (
                              <div className="text-center">
                                <p className="text-xs text-gray-600">
                                  Facilities
                                </p>
                                <p className="font-bold text-lg">
                                  {exchange.facilityQuality}/5
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
