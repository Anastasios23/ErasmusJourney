import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { Badge } from "../../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { Progress } from "../../src/components/ui/progress";
import { Checkbox } from "../../src/components/ui/checkbox";
import Header from "../../components/Header";
import { SafeImage } from "../../components/SafeImage";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Upload,
  Search,
  MoreVertical,
  Eye,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface Destination {
  id: string;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  climate?: string;
  costOfLiving?: any;
  highlights?: string;
  photos?: any[];
  generalInfo?: any;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  totalDestinations: number;
  featuredDestinations: number;
  monthlyGrowth: Array<{ month: string; count: number }>;
  countryStats: Array<{ country: string; count: number }>;
  recentActivity: Array<{
    id: string;
    name: string;
    country: string;
    updatedAt: string;
    featured: boolean;
  }>;
}

interface FormData {
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  climate: string;
  highlights: string;
  costOfLiving: {
    monthly: number;
    accommodation: number;
    food: number;
    transport: number;
  };
  generalInfo: {
    cityOverview: string;
    culturalNotes: string;
    practicalTips: string;
  };
}

export default function AdminDestinationsDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDestinations, setSelectedDestinations] = useState<Set<string>>(
    new Set(),
  );
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("all");

  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: "",
    country: "",
    description: "",
    imageUrl: "",
    featured: false,
    climate: "",
    highlights: "",
    costOfLiving: {
      monthly: 800,
      accommodation: 400,
      food: 200,
      transport: 100,
    },
    generalInfo: {
      cityOverview: "",
      culturalNotes: "",
      practicalTips: "",
    },
  });

  // Check admin access
  useEffect(() => {
    if (session && session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, router]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [destinationsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/destinations/manage"),
        fetch("/api/destinations/analytics?type=overview"),
      ]);

      if (destinationsRes.ok) {
        const destinationsData = await destinationsRes.json();
        setDestinations(destinationsData.destinations || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/destinations/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadData();
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating destination:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingDestination) return;

    try {
      const response = await fetch(
        `/api/admin/destinations/manage?id=${editingDestination.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        await loadData();
        setEditingDestination(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating destination:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;

    try {
      const response = await fetch(`/api/admin/destinations/manage?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting destination:", error);
    }
  };

  const handleBatchToggleFeatured = async () => {
    if (selectedDestinations.size === 0) return;

    try {
      const response = await fetch("/api/admin/destinations/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleFeatured",
          ids: Array.from(selectedDestinations),
        }),
      });

      if (response.ok) {
        await loadData();
        setSelectedDestinations(new Set());
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: "",
      country: "",
      description: "",
      imageUrl: "",
      featured: false,
      climate: "",
      highlights: "",
      costOfLiving: {
        monthly: 800,
        accommodation: 400,
        food: 200,
        transport: 100,
      },
      generalInfo: {
        cityOverview: "",
        culturalNotes: "",
        practicalTips: "",
      },
    });
  };

  const startEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description || "",
      imageUrl: destination.imageUrl || "",
      featured: destination.featured,
      climate: destination.climate || "",
      highlights: destination.highlights || "",
      costOfLiving: destination.costOfLiving || {
        monthly: 800,
        accommodation: 400,
        food: 200,
        transport: 100,
      },
      generalInfo: destination.generalInfo || {
        cityOverview: "",
        culturalNotes: "",
        practicalTips: "",
      },
    });
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedDestinations);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDestinations(newSelection);
  };

  const selectAll = () => {
    if (selectedDestinations.size === filteredDestinations.length) {
      setSelectedDestinations(new Set());
    } else {
      setSelectedDestinations(new Set(filteredDestinations.map((d) => d.id)));
    }
  };

  // Filter destinations
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !filterCountry || dest.country === filterCountry;
    const matchesFeatured =
      filterFeatured === "all" ||
      (filterFeatured === "featured" && dest.featured) ||
      (filterFeatured === "not-featured" && !dest.featured);

    return matchesSearch && matchesCountry && matchesFeatured;
  });

  const countries = [...new Set(destinations.map((d) => d.country))].sort();

  if (!session || session.user?.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Destinations | Erasmus Journey</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Destinations Management
            </h1>
            <p className="text-gray-600">
              Manage study abroad destinations and analytics
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {analytics && (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Total Destinations
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                              {analytics.totalDestinations}
                            </p>
                          </div>
                          <MapPin className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Featured
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                              {analytics.featuredDestinations}
                            </p>
                          </div>
                          <Star className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Countries
                            </p>
                            <p className="text-3xl font-bold text-purple-600">
                              {analytics.countryStats?.length || 0}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              This Month
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                              {analytics.monthlyGrowth?.slice(-1)[0]?.count ||
                                0}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.recentActivity?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.country}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Featured
                                </Badge>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(item.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Destinations Tab */}
            <TabsContent value="destinations" className="space-y-6">
              {/* Controls */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search destinations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Filters */}
                      <Select
                        value={filterCountry}
                        onValueChange={setFilterCountry}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All countries</SelectItem>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filterFeatured}
                        onValueChange={setFilterFeatured}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All destinations</SelectItem>
                          <SelectItem value="featured">
                            Featured only
                          </SelectItem>
                          <SelectItem value="not-featured">
                            Not featured
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Destination
                      </Button>
                      <Button variant="outline" onClick={loadData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Batch Actions */}
                  {selectedDestinations.size > 0 && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-4">
                      <p className="text-sm text-gray-600">
                        {selectedDestinations.size} destination
                        {selectedDestinations.size !== 1 ? "s" : ""} selected
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchToggleFeatured}
                      >
                        Toggle Featured
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDestinations(new Set())}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Destinations Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4">
                            <Checkbox
                              checked={
                                selectedDestinations.size ===
                                  filteredDestinations.length &&
                                filteredDestinations.length > 0
                              }
                              onCheckedChange={selectAll}
                            />
                          </th>
                          <th className="text-left p-4 font-medium">
                            Destination
                          </th>
                          <th className="text-left p-4 font-medium">Country</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Updated</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-8 text-center text-gray-500"
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : filteredDestinations.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-8 text-center text-gray-500"
                            >
                              No destinations found
                            </td>
                          </tr>
                        ) : (
                          filteredDestinations.map((destination) => (
                            <tr
                              key={destination.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-4">
                                <Checkbox
                                  checked={selectedDestinations.has(
                                    destination.id,
                                  )}
                                  onCheckedChange={() =>
                                    toggleSelection(destination.id)
                                  }
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                                    <SafeImage
                                      src={
                                        destination.imageUrl ||
                                        "/placeholder.svg"
                                      }
                                      alt={destination.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {destination.name}
                                    </p>
                                    <p className="text-sm text-gray-500 line-clamp-1">
                                      {destination.description ||
                                        "No description"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">{destination.country}</td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  {destination.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      <Star className="h-3 w-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 text-green-800"
                                  >
                                    Published
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                {new Date(
                                  destination.updatedAt,
                                ).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/destinations/${destination.id}`,
                                      )
                                    }
                                    title="View destination"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(destination)}
                                    title="Edit destination"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(destination.id)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete destination"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {analytics && (
                <>
                  {/* Country Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Country Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.countryStats?.map((stat) => (
                          <div
                            key={stat.country}
                            className="flex items-center justify-between"
                          >
                            <span>{stat.country}</span>
                            <div className="flex items-center gap-3">
                              <Progress
                                value={
                                  (stat.count / analytics.totalDestinations) *
                                  100
                                }
                                className="w-32"
                              />
                              <span className="text-sm font-medium w-8">
                                {stat.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Growth */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.monthlyGrowth?.map((item) => (
                          <div
                            key={item.month}
                            className="flex items-center justify-between"
                          >
                            <span>
                              {new Date(item.month + "-01").toLocaleDateString(
                                "en-US",
                                { month: "long", year: "numeric" },
                              )}
                            </span>
                            <span className="font-medium">
                              {item.count} destinations
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export & Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Destinations
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Destinations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Create/Edit Form Modal */}
          {(showCreateForm || editingDestination) && (
            <DestinationForm
              formData={formData}
              setFormData={setFormData}
              onSave={editingDestination ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingDestination(null);
                resetForm();
              }}
              isEditing={!!editingDestination}
            />
          )}
        </main>
      </div>
    </>
  );
}

// Destination Form Component
interface DestinationFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const DestinationForm: React.FC<DestinationFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  isEditing,
}) => {
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof FormData] as any),
        [field]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Destination" : "Create New Destination"}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="e.g., Berlin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country *
                  </label>
                  <Input
                    value={formData.country}
                    onChange={(e) => updateFormData("country", e.target.value)}
                    placeholder="e.g., Germany"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="Brief description of the destination..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => updateFormData("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    updateFormData("featured", checked)
                  }
                />
                <label className="text-sm font-medium">
                  Featured destination
                </label>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Climate
                </label>
                <Input
                  value={formData.climate}
                  onChange={(e) => updateFormData("climate", e.target.value)}
                  placeholder="e.g., Temperate continental"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Highlights
                </label>
                <Textarea
                  value={formData.highlights}
                  onChange={(e) => updateFormData("highlights", e.target.value)}
                  placeholder="Key highlights separated by commas..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  City Overview
                </label>
                <Textarea
                  value={formData.generalInfo.cityOverview}
                  onChange={(e) =>
                    updateNestedFormData(
                      "generalInfo",
                      "cityOverview",
                      e.target.value,
                    )
                  }
                  placeholder="Overview of the city..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cultural Notes
                </label>
                <Textarea
                  value={formData.generalInfo.culturalNotes}
                  onChange={(e) =>
                    updateNestedFormData(
                      "generalInfo",
                      "culturalNotes",
                      e.target.value,
                    )
                  }
                  placeholder="Cultural information for students..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Practical Tips
                </label>
                <Textarea
                  value={formData.generalInfo.practicalTips}
                  onChange={(e) =>
                    updateNestedFormData(
                      "generalInfo",
                      "practicalTips",
                      e.target.value,
                    )
                  }
                  placeholder="Practical tips for students..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Monthly Budget (€)
                  </label>
                  <Input
                    type="number"
                    value={formData.costOfLiving.monthly}
                    onChange={(e) =>
                      updateNestedFormData(
                        "costOfLiving",
                        "monthly",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Accommodation (€)
                  </label>
                  <Input
                    type="number"
                    value={formData.costOfLiving.accommodation}
                    onChange={(e) =>
                      updateNestedFormData(
                        "costOfLiving",
                        "accommodation",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Food (€)
                  </label>
                  <Input
                    type="number"
                    value={formData.costOfLiving.food}
                    onChange={(e) =>
                      updateNestedFormData(
                        "costOfLiving",
                        "food",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Transport (€)
                  </label>
                  <Input
                    type="number"
                    value={formData.costOfLiving.transport}
                    onChange={(e) =>
                      updateNestedFormData(
                        "costOfLiving",
                        "transport",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {isEditing ? "Update" : "Create"} Destination
          </Button>
        </div>
      </div>
    </div>
  );
};
