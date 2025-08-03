import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Textarea } from "../src/components/ui/textarea";
import { Badge } from "../src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  Plus,
  Edit,
  Eye,
  Star,
  Users,
  MapPin,
  Building,
  Euro,
  ThumbsUp,
  Calendar,
  Save,
  X,
} from "lucide-react";

interface AdminDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  highlights?: string[];
  officialUniversities?: Array<{
    name: string;
    website: string;
    programs: string[];
  }>;
  generalInfo?: {
    language: string;
    currency: string;
    timeZone: string;
    publicTransport: string;
  };
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasStudentData?: boolean;
  lastDataUpdate?: Date;
}

interface StudentData {
  totalSubmissions: number;
  livingCosts: {
    avgTotalMonthly: number;
  };
  ratings: {
    avgOverallRating: number;
  };
  recommendations: {
    recommendationPercentage: number;
  };
}

export default function AdminDestinationsManager() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDestination, setEditingDestination] =
    useState<AdminDestination | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    description: "",
    imageUrl: "",
    climate: "",
    highlights: "",
    language: "",
    currency: "",
    timeZone: "",
    publicTransport: "",
    featured: false,
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/admin/destinations?withStudentData=true",
      );
      const result = await response.json();

      if (result.success) {
        setDestinations(result.data);
      } else {
        console.error("Failed to fetch destinations:", result.message);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDestination = async () => {
    try {
      const destinationData = {
        ...formData,
        highlights: formData.highlights
          ? formData.highlights.split(",").map((h) => h.trim())
          : [],
        generalInfo: {
          language: formData.language,
          currency: formData.currency,
          timeZone: formData.timeZone,
          publicTransport: formData.publicTransport,
        },
      };

      const response = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(destinationData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateForm(false);
        setFormData({
          name: "",
          city: "",
          country: "",
          description: "",
          imageUrl: "",
          climate: "",
          highlights: "",
          language: "",
          currency: "",
          timeZone: "",
          publicTransport: "",
          featured: false,
        });
        fetchDestinations();
      } else {
        console.error("Failed to create destination:", result.message);
      }
    } catch (error) {
      console.error("Error creating destination:", error);
    }
  };

  const handleUpdateDestination = async (id: string, updateData: any) => {
    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setEditingDestination(null);
        fetchDestinations();
      } else {
        console.error("Failed to update destination:", result.message);
      }
    } catch (error) {
      console.error("Error updating destination:", error);
    }
  };

  const toggleFeatured = async (destination: AdminDestination) => {
    await handleUpdateDestination(destination.id, {
      featured: !destination.featured,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Destination Management</h1>
          <p className="text-gray-600 mt-2">
            Manage admin-curated destinations and view student data insights
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Destinations</p>
                <p className="text-2xl font-bold">{destinations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold">
                  {destinations.filter((d) => d.featured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">With Student Data</p>
                <p className="text-2xl font-bold">
                  {destinations.filter((d) => d.hasStudentData).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {destinations.filter((d) => d.active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Destination Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Create New Destination</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Destination Name
                  </label>
                  <Input
                    placeholder="e.g., Barcelona, Spain"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    placeholder="e.g., Barcelona"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    placeholder="e.g., Spain"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Climate</label>
                  <Input
                    placeholder="e.g., Mediterranean"
                    value={formData.climate}
                    onChange={(e) =>
                      setFormData({ ...formData, climate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    rows={4}
                    placeholder="Describe what makes this destination special..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Highlights (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g., Beach city, Rich culture, Affordable"
                    value={formData.highlights}
                    onChange={(e) =>
                      setFormData({ ...formData, highlights: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Input
                    placeholder="e.g., Spanish"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Input
                    placeholder="e.g., EUR"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured Destination
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDestination}>
                <Save className="h-4 w-4 mr-2" />
                Create Destination
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Destinations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {destinations.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onToggleFeatured={toggleFeatured}
            onEdit={setEditingDestination}
          />
        ))}
      </div>
    </div>
  );
}

function DestinationCard({
  destination,
  onToggleFeatured,
  onEdit,
}: {
  destination: AdminDestination;
  onToggleFeatured: (dest: AdminDestination) => void;
  onEdit: (dest: AdminDestination) => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {destination.name}
              {destination.featured && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </CardTitle>
            <CardDescription>
              {destination.city}, {destination.country}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleFeatured(destination)}
            >
              <Star
                className={`h-4 w-4 ${destination.featured ? "fill-yellow-400 text-yellow-400" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(destination)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {destination.imageUrl && (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full h-32 object-cover rounded"
            />
          )}

          <p className="text-sm text-gray-600 line-clamp-3">
            {destination.description}
          </p>

          {destination.highlights && destination.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {destination.highlights.slice(0, 3).map((highlight, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {highlight}
                </Badge>
              ))}
              {destination.highlights.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{destination.highlights.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Student Data Preview */}
          {destination.hasStudentData ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">
                Student Data Available
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-green-700">5</div>
                  <div className="text-green-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-700">€850</div>
                  <div className="text-green-600">Avg Cost</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-700">4.2⭐</div>
                  <div className="text-green-600">Rating</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                No student data available yet
              </p>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              Created: {new Date(destination.createdAt).toLocaleDateString()}
            </span>
            {destination.lastDataUpdate && (
              <span>
                Data updated:{" "}
                {new Date(destination.lastDataUpdate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
