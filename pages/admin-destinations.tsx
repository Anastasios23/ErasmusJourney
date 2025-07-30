import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Textarea } from "../src/components/ui/textarea";
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
} from "lucide-react";
import { toast } from "../src/components/ui/use-toast";

interface Destination {
  id: string;
  city: string;
  country: string;
  description: string;
  image: string;
  costLevel: string;
  rating: number;
  studentCount: number;
  avgCostPerMonth: number;
  popularUniversities: string[];
  highlights: string[];
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

export default function AdminDestinations() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load destinations
  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/destinations");
      if (!response.ok) throw new Error("Failed to fetch destinations");

      const data = await response.json();
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error("Error loading destinations:", error);
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

            {/* Destinations Grid */}
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
                          {destination.avgCostPerMonth}/mo
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {destination.rating}
                        </span>
                        <Badge
                          className={
                            destination.costLevel === "low"
                              ? "bg-green-500"
                              : destination.costLevel === "medium"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                        >
                          {destination.costLevel} cost
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-600">
                        <p className="line-clamp-2">
                          {destination.description}
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
                            value={editingDestination.rating}
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
                            value={editingDestination.avgCostPerMonth}
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
                          value={editingDestination.costLevel}
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
                            editingDestination.popularUniversities?.join(
                              ", ",
                            ) || ""
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
          </div>
        </div>
      </div>
    </>
  );
}
