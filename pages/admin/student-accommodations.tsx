import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Star,
  Home,
  MapPin,
  Euro,
  Wifi,
  Users,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AccommodationSubmissionData {
  id: string;
  student: {
    name: string;
    email: string;
    homeUniversity: string;
    studyPeriod: string;
  };
  location: {
    hostCity: string;
    hostCountry: string;
    hostUniversity: string;
    neighborhood: string;
    distanceToUniversity: number;
  };
  accommodationDetails: {
    housingType: "DORMITORY" | "APARTMENT" | "HOMESTAY" | "SHARED_FLAT";
    monthlyRent: number;
    roomType: "SINGLE" | "SHARED" | "STUDIO";
    privateBathroom: boolean;
    amenities: string[];
    furnished: boolean;
    utilitiesIncluded: boolean;
  };
  contactInfo: {
    landlordContact: string;
    deposit: number;
    contractLength: string;
  };
  studentExperience: {
    overallRating: number;
    cleanlinessRating: number;
    locationRating: number;
    valueRating: number;
    noiseLevel: number;
    safetyRating: number;
    experienceDescription: string;
    pros: string[];
    cons: string[];
    wouldRecommend: boolean;
  };
  submittedAt: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
}

export default function AdminStudentAccommodations() {
  const [pendingSubmissions, setPendingSubmissions] = useState<
    AccommodationSubmissionData[]
  >([]);
  const [liveAccommodations, setLiveAccommodations] = useState([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AccommodationSubmissionData | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin fields for adding professional content
  const [adminContent, setAdminContent] = useState({
    title: "",
    professionalDescription: "",
    verifiedContact: "",
    officialWebsite: "",
    adminNotes: "",
    adminPhotos: [""],
    priceVerified: false,
    qualityVerified: false,
    availabilityStatus: "AVAILABLE",
    recommendationLevel: "STANDARD",
    highlights: [""],
    warnings: [""],
  });

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
    fetchPendingSubmissions();
    fetchLiveAccommodations();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      console.log('Fetching pending accommodation submissions...');
      const response = await safeFetch(
        "/api/admin/accommodation-submissions?status=SUBMITTED",
      );
      if (!response.ok) throw new Error("Failed to fetch submissions");
      const data = await response.json();
      console.log('Pending submissions fetched successfully:', data?.length || 0);
      setPendingSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setPendingSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveAccommodations = async () => {
    try {
      console.log('Fetching live accommodations...');
      const response = await safeFetch("/api/admin/student-accommodations");
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      const data = await response.json();
      console.log('Live accommodations fetched successfully:', data?.length || 0);
      setLiveAccommodations(data || []);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      setLiveAccommodations([]);
    }
  };

  const handleReviewSubmission = (submission: AccommodationSubmissionData) => {
    setSelectedSubmission(submission);
    setReviewDialogOpen(true);

    // Pre-populate admin content with student data
    setAdminContent({
      ...adminContent,
      title: `${submission.accommodationDetails.housingType} in ${submission.location.neighborhood}`,
      professionalDescription: `${submission.accommodationDetails.housingType.toLowerCase()} accommodation near ${submission.location.hostUniversity}. Monthly rent: €${submission.accommodationDetails.monthlyRent}`,
      highlights: submission.studentExperience.pros.slice(0, 3),
      verifiedContact: submission.contactInfo.landlordContact,
    });
  };

  const handleApproveSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(
        `/api/admin/accommodation-submissions/${selectedSubmission.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            adminContent,
            createAccommodationListing: true,
          }),
        },
      );

      if (response.ok) {
        fetchPendingSubmissions();
        fetchLiveAccommodations();
        setReviewDialogOpen(false);
        alert("Accommodation approved and published!");
      }
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const reason = prompt("Reason for rejection:");
      if (!reason) return;

      const response = await fetch(
        `/api/admin/accommodation-submissions/${submissionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rejected",
            adminNotes: reason,
          }),
        },
      );

      if (response.ok) {
        fetchPendingSubmissions();
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  return (
    <div className="admin-dashboard p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Student Accommodations Management
        </h1>
        <p className="text-gray-600 mt-2">
          Review student accommodation submissions and manage housing listings
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            🏠 Pending Review ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="live">
            ✅ Live Listings ({liveAccommodations.length})
          </TabsTrigger>
        </TabsList>

        {/* PENDING SUBMISSIONS TAB */}
        <TabsContent value="pending" className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">🏠 Review Process</h3>
            <p className="text-blue-700 text-sm mt-1">
              Student submissions from accommodation forms with housing details,
              costs, and experiences. Review each submission, add admin content
              and photos, then approve to create public listings.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading submissions...</div>
          ) : (
            pendingSubmissions
              .filter((sub) => sub.status === "SUBMITTED")
              .map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center">
                          <Home className="h-5 w-5 mr-2" />
                          {submission.accommodationDetails.housingType} in{" "}
                          {submission.location.neighborhood}
                        </CardTitle>
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {submission.location.hostCity},{" "}
                          {submission.location.hostCountry}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {submission.accommodationDetails.roomType}
                        </Badge>
                        <p className="text-2xl font-bold text-green-600 flex items-center">
                          <Euro className="h-5 w-5 mr-1" />
                          {submission.accommodationDetails.monthlyRent}
                        </p>
                        <p className="text-sm text-gray-500">per month</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Student Information */}
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Student Information
                        </h4>
                        <p className="text-sm">
                          <strong>Name:</strong> {submission.student.name}
                        </p>
                        <p className="text-sm">
                          <strong>University:</strong>{" "}
                          {submission.location.hostUniversity}
                        </p>
                        <p className="text-sm">
                          <strong>Period:</strong>{" "}
                          {submission.student.studyPeriod}
                        </p>
                        <p className="text-sm">
                          <strong>Distance:</strong>{" "}
                          {submission.location.distanceToUniversity}km from
                          university
                        </p>
                      </div>

                      {/* Accommodation Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          Accommodation Details
                        </h4>
                        <p className="text-sm">
                          <strong>Type:</strong>{" "}
                          {submission.accommodationDetails.housingType}
                        </p>
                        <p className="text-sm">
                          <strong>Room:</strong>{" "}
                          {submission.accommodationDetails.roomType}
                        </p>
                        <p className="text-sm">
                          <strong>Private Bathroom:</strong>{" "}
                          {submission.accommodationDetails.privateBathroom
                            ? "Yes"
                            : "No"}
                        </p>
                        <p className="text-sm">
                          <strong>Furnished:</strong>{" "}
                          {submission.accommodationDetails.furnished
                            ? "Yes"
                            : "No"}
                        </p>
                        <p className="text-sm">
                          <strong>Utilities Included:</strong>{" "}
                          {submission.accommodationDetails.utilitiesIncluded
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <h4 className="font-semibold flex items-center mb-2">
                        <Wifi className="h-4 w-4 mr-2" />
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.accommodationDetails.amenities.map(
                          (amenity, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Experience Ratings */}
                    <div className="mb-4">
                      <h4 className="font-semibold flex items-center mb-2">
                        <Star className="h-4 w-4 mr-2" />
                        Student Experience Ratings
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                        <div className="text-center">
                          <p className="font-medium">Overall</p>
                          <Badge variant="secondary">
                            {submission.studentExperience.overallRating}/5
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Cleanliness</p>
                          <Badge variant="secondary">
                            {submission.studentExperience.cleanlinessRating}/5
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Location</p>
                          <Badge variant="secondary">
                            {submission.studentExperience.locationRating}/5
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Value</p>
                          <Badge variant="secondary">
                            {submission.studentExperience.valueRating}/5
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Safety</p>
                          <Badge variant="secondary">
                            {submission.studentExperience.safetyRating}/5
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Recommend</p>
                          <Badge
                            variant={
                              submission.studentExperience.wouldRecommend
                                ? "default"
                                : "destructive"
                            }
                          >
                            {submission.studentExperience.wouldRecommend
                              ? "Yes"
                              : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Student Experience Description */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">
                        Student's Experience:
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        "
                        {submission.studentExperience.experienceDescription?.substring(
                          0,
                          200,
                        )}
                        ..."
                      </p>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">
                          Pros:
                        </h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          {submission.studentExperience.pros
                            .slice(0, 3)
                            .map((pro, index) => (
                              <li key={index}>• {pro}</li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">Cons:</h5>
                        <ul className="text-sm text-red-600 space-y-1">
                          {submission.studentExperience.cons
                            .slice(0, 3)
                            .map((con, index) => (
                              <li key={index}>• {con}</li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-4 bg-gray-50 p-3 rounded">
                      <h4 className="font-semibold mb-2">
                        Contact Information:
                      </h4>
                      <p className="text-sm">
                        <strong>Landlord Contact:</strong>{" "}
                        {submission.contactInfo.landlordContact}
                      </p>
                      <p className="text-sm">
                        <strong>Deposit:</strong> €
                        {submission.contactInfo.deposit}
                      </p>
                      <p className="text-sm">
                        <strong>Contract Length:</strong>{" "}
                        {submission.contactInfo.contractLength}
                      </p>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReviewSubmission(submission)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review & Add Content
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectSubmission(submission.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        {/* LIVE ACCOMMODATIONS TAB */}
        <TabsContent value="live" className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">
              🏠 Published Accommodations
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Currently published accommodation listings with admin-verified
              information and photos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveAccommodations.map((accommodation: any, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default">LIVE</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(accommodation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold">
                    {accommodation.title || "Accommodation Listing"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {accommodation.location} • €{accommodation.rent}/month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* REVIEW DIALOG */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Accommodation:{" "}
              {selectedSubmission?.accommodationDetails.housingType} in{" "}
              {selectedSubmission?.location.neighborhood}
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Student Data Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">
                  🏠 Student Submission Data
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedSubmission.location.neighborhood},{" "}
                      {selectedSubmission.location.hostCity}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {selectedSubmission.accommodationDetails.housingType}
                    </p>
                    <p>
                      <strong>Monthly Rent:</strong> €
                      {selectedSubmission.accommodationDetails.monthlyRent}
                    </p>
                    <p>
                      <strong>Room Type:</strong>{" "}
                      {selectedSubmission.accommodationDetails.roomType}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Overall Rating:</strong>{" "}
                      {selectedSubmission.studentExperience.overallRating}/5
                    </p>
                    <p>
                      <strong>Would Recommend:</strong>{" "}
                      {selectedSubmission.studentExperience.wouldRecommend
                        ? "Yes"
                        : "No"}
                    </p>
                    <p>
                      <strong>Distance to Uni:</strong>{" "}
                      {selectedSubmission.location.distanceToUniversity}km
                    </p>
                    <p>
                      <strong>Deposit:</strong> €
                      {selectedSubmission.contactInfo.deposit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Content Form */}
              <div className="space-y-4">
                <h3 className="font-semibold">✏️ Add Admin Content & Photos</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Listing Title
                  </label>
                  <Input
                    value={adminContent.title}
                    onChange={(e) =>
                      setAdminContent({
                        ...adminContent,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Modern Student Dormitory near UCL Campus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Professional Description
                  </label>
                  <Textarea
                    value={adminContent.professionalDescription}
                    onChange={(e) =>
                      setAdminContent({
                        ...adminContent,
                        professionalDescription: e.target.value,
                      })
                    }
                    placeholder="Professional description of the accommodation..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Verified Contact
                    </label>
                    <Input
                      value={adminContent.verifiedContact}
                      onChange={(e) =>
                        setAdminContent({
                          ...adminContent,
                          verifiedContact: e.target.value,
                        })
                      }
                      placeholder="Verified landlord/agency contact"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Official Website
                    </label>
                    <Input
                      value={adminContent.officialWebsite}
                      onChange={(e) =>
                        setAdminContent({
                          ...adminContent,
                          officialWebsite: e.target.value,
                        })
                      }
                      placeholder="https://accommodation-website.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Availability Status
                    </label>
                    <Select
                      value={adminContent.availabilityStatus}
                      onValueChange={(value) =>
                        setAdminContent({
                          ...adminContent,
                          availabilityStatus: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="LIMITED">
                          Limited Availability
                        </SelectItem>
                        <SelectItem value="WAITLIST">Waitlist Only</SelectItem>
                        <SelectItem value="UNAVAILABLE">
                          Currently Unavailable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Recommendation Level
                    </label>
                    <Select
                      value={adminContent.recommendationLevel}
                      onValueChange={(value) =>
                        setAdminContent({
                          ...adminContent,
                          recommendationLevel: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGHLY_RECOMMENDED">
                          Highly Recommended
                        </SelectItem>
                        <SelectItem value="RECOMMENDED">Recommended</SelectItem>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="CAUTION">Use Caution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Admin Photos (URLs)
                  </label>
                  <div className="space-y-2">
                    <Input
                      value={adminContent.adminPhotos[0]}
                      onChange={(e) =>
                        setAdminContent({
                          ...adminContent,
                          adminPhotos: [
                            e.target.value,
                            ...adminContent.adminPhotos.slice(1),
                          ],
                        })
                      }
                      placeholder="https://example.com/accommodation-photo1.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setAdminContent({
                          ...adminContent,
                          adminPhotos: [...adminContent.adminPhotos, ""],
                        })
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Another Photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={adminContent.priceVerified}
                      onChange={(e) =>
                        setAdminContent({
                          ...adminContent,
                          priceVerified: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Price Verified by Admin</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={adminContent.qualityVerified}
                      onChange={(e) =>
                        setAdminContent({
                          ...adminContent,
                          qualityVerified: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Quality Verified by Admin</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Admin Notes (Internal)
                  </label>
                  <Textarea
                    value={adminContent.adminNotes}
                    onChange={(e) =>
                      setAdminContent({
                        ...adminContent,
                        adminNotes: e.target.value,
                      })
                    }
                    placeholder="Internal notes about this accommodation..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleApproveSubmission}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Publish Listing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
