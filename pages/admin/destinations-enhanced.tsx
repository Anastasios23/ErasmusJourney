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
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../src/components/ui/alert";
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
  TrendingUp,
  Calendar,
  BarChart3,
  Sparkles,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface EnhancedDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  status: string;
  source: string;
  description?: string;
  imageUrl?: string;
  submissionCount: number;
  lastUpdated: string;
  hasAggregatedData: boolean;
  aggregatedData?: any;
  linkedSubmissions: any[];
  adminOverrides?: any;
}

interface PotentialDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  submissionCount: number;
  submissions: any[];
}

export default function EnhancedDestinationsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [destinations, setDestinations] = useState<EnhancedDestination[]>([]);
  const [potentialDestinations, setPotentialDestinations] = useState<PotentialDestination[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedDestination, setSelectedDestination] = useState<EnhancedDestination | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: "",
    city: "",
    country: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    setLoading(false);
    fetchEnhancedData();
  }, [session, status, router]);

  const fetchEnhancedData = async () => {
    try {
      const response = await fetch("/api/admin/destinations/enhanced");
      if (response.ok) {
        const data = await response.json();
        setDestinations(data.destinations || []);
        setPotentialDestinations(data.potentialDestinations || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching enhanced destinations data:", error);
    }
  };

  const createDestinationFromSubmissions = async (city: string, country: string, overrides: any = {}) => {
    try {
      const response = await fetch("/api/admin/destinations/enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_from_submissions",
          city,
          country,
          adminOverrides: overrides,
        }),
      });

      if (response.ok) {
        await fetchEnhancedData(); // Refresh data
      }
    } catch (error) {
      console.error("Error creating destination from submissions:", error);
    }
  };

  const createManualDestination = async () => {
    try {
      const response = await fetch("/api/admin/destinations/enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_manual",
          ...newDestination,
        }),
      });

      if (response.ok) {
        setNewDestination({
          name: "",
          city: "",
          country: "",
          description: "",
          imageUrl: "",
        });
        await fetchEnhancedData(); // Refresh data
      }
    } catch (error) {
      console.error("Error creating manual destination:", error);
    }
  };

  const updateDestination = async (destinationId: string, updates: any) => {
    try {
      const response = await fetch("/api/admin/destinations/enhanced", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinationId,
          ...updates,
        }),
      });

      if (response.ok) {
        await fetchEnhancedData(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating destination:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800", label: "Published" },
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      under_review: { color: "bg-yellow-100 text-yellow-800", label: "Under Review" },
      potential: { color: "bg-blue-100 text-blue-800", label: "Potential" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      admin_created: { color: "bg-purple-100 text-purple-800", label: "Admin Created", icon: Edit },
      user_generated: { color: "bg-blue-100 text-blue-800", label: "User Generated", icon: Users },
      hybrid: { color: "bg-orange-100 text-orange-800", label: "Hybrid", icon: Sparkles },
    };

    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.admin_created;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
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

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Enhanced Destinations Management - Admin</title>
      </Head>
      
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Destinations Management</h1>
            <p className="text-gray-600">Advanced content management with aggregated data and admin controls</p>
          </div>
          <Button onClick={fetchEnhancedData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published || 0}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.potential || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Generated</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.userGenerated || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Created</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.adminCreated || 0}</p>
                </div>
                <Edit className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hybrid</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.hybrid || 0}</p>
                </div>
                <Sparkles className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="potential">
              Potential Destinations ({potentialDestinations.length})
            </TabsTrigger>
            <TabsTrigger value="published">Published Destinations</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Content Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>User Generated</span>
                      <Badge className="bg-blue-100 text-blue-800">{stats.userGenerated || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Admin Created</span>
                      <Badge className="bg-purple-100 text-purple-800">{stats.adminCreated || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hybrid Content</span>
                      <Badge className="bg-orange-100 text-orange-800">{stats.hybrid || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Potential Destinations</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{stats.potential || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Under Review</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{stats.needsReview || 0}</Badge>
                    </div>
                    {potentialDestinations.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>New Potential Destinations</AlertTitle>
                        <AlertDescription>
                          There are {potentialDestinations.length} potential destinations that can be created from user submissions.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="potential" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Potential Destinations from User Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {potentialDestinations.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No potential destinations waiting to be created.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Contributors</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {potentialDestinations.map((potential) => (
                        <TableRow key={potential.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {potential.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              {potential.submissionCount} submissions
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {potential.submissions.slice(0, 3).map((submission, idx) => (
                                <div 
                                  key={submission.id}
                                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                  title={submission.user?.firstName || submission.user?.email}
                                >
                                  {(submission.user?.firstName?.[0] || submission.user?.email?.[0] || '?').toUpperCase()}
                                </div>
                              ))}
                              {potential.submissions.length > 3 && (
                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                  +{potential.submissions.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Review: {potential.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Submissions ({potential.submissionCount})</h4>
                                      <div className="space-y-2">
                                        {potential.submissions.map((submission) => (
                                          <div key={submission.id} className="p-3 border rounded-md">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <p className="font-medium">{submission.title}</p>
                                                <p className="text-sm text-gray-600">
                                                  by {submission.user?.firstName} {submission.user?.lastName}
                                                </p>
                                              </div>
                                              <span className="text-xs text-gray-500">
                                                {new Date(submission.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 pt-4 border-t">
                                      <Button 
                                        onClick={() => createDestinationFromSubmissions(potential.city, potential.country)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Create Destination
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button 
                                onClick={() => createDestinationFromSubmissions(potential.city, potential.country)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Create
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

          <TabsContent value="published" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.map((destination) => (
                      <TableRow key={destination.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{destination.name}</p>
                            <p className="text-sm text-gray-500">{destination.city}, {destination.country}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getSourceBadge(destination.source)}</TableCell>
                        <TableCell>{getStatusBadge(destination.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {destination.submissionCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(destination.lastUpdated).toLocaleDateString()}
                          </div>
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
                <CardTitle>Create New Destination Manually</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newDestination.city}
                      onChange={(e) => setNewDestination({...newDestination, city: e.target.value})}
                      placeholder="e.g., Barcelona"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newDestination.country}
                      onChange={(e) => setNewDestination({...newDestination, country: e.target.value})}
                      placeholder="e.g., Spain"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Destination Name</Label>
                  <Input
                    id="name"
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                    placeholder="e.g., Barcelona, Spain"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({...newDestination, description: e.target.value})}
                    placeholder="Brief description of the destination..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={newDestination.imageUrl}
                    onChange={(e) => setNewDestination({...newDestination, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <Button 
                  onClick={createManualDestination}
                  disabled={!newDestination.city || !newDestination.country || !newDestination.name}
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
