import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Force dynamic rendering for this page since it requires session
export const dynamic = "force-dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
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
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import Header from "../components/Header";
import { ArrowRight, ArrowLeft, Home, Star, Euro } from "lucide-react";

export default function Accommodation() {
  const { data: session } = useSession();
  const router = useRouter();

  // Authentication temporarily disabled - all users can access

  const [formData, setFormData] = useState({
    accommodationAddress: "",
    accommodationType: "",
    landlordName: "",
    landlordEmail: "",
    landlordPhone: "",
    bookingLink: "",
    monthlyRent: "",
    billsIncluded: "",
    avgUtilityCost: "",
    accommodationRating: "",
    easyToFind: "",
    findingChallenges: "",
    wouldRecommend: "",
    recommendationReason: "",
    additionalNotes: "",
    neighborhood: "",
    transportLinks: "",
    nearbyAmenities: [],
    roomSize: "",
    roomFurnished: "",
    kitchenAccess: "",
    internetIncluded: "",
    laundryAccess: "",
    parkingAvailable: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      nearbyAmenities: checked
        ? [...prev.nearbyAmenities, amenity]
        : prev.nearbyAmenities.filter((a) => a !== amenity),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Accommodation Form submitted:", formData);
    router.push("/living-expenses");
  };

  const accommodationTypes = [
    "University Dorms",
    "Private Apartment",
    "Shared Apartment",
    "Student Residence",
    "Host Family",
    "Other",
  ];

  const amenities = [
    "Supermarket",
    "Public Transport",
    "Gym/Fitness Center",
    "Restaurants/Cafes",
    "Library",
    "Medical Center",
    "Shopping Mall",
    "Banks/ATMs",
    "Pharmacy",
    "Parks/Recreation",
  ];

  return (
    <>
      <Head>
        <title>Accommodation Details - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share details about your accommodation experience"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Progress Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Step 3 of 5
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">
                  Accommodation Details
                </h1>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Accommodation Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Basic Accommodation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accommodationAddress">
                    Address of Accommodation
                  </Label>
                  <Textarea
                    id="accommodationAddress"
                    placeholder="Enter the full address of your accommodation..."
                    value={formData.accommodationAddress}
                    onChange={(e) =>
                      handleInputChange("accommodationAddress", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accommodationType">
                      Type of Accommodation
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("accommodationType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accommodationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Neighborhood/District</Label>
                    <Input
                      id="neighborhood"
                      placeholder="e.g., Friedrichshain, Södermalm..."
                      value={formData.neighborhood}
                      onChange={(e) =>
                        handleInputChange("neighborhood", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Landlord Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="landlordName">Landlord Name</Label>
                    <Input
                      id="landlordName"
                      placeholder="Enter landlord's name"
                      value={formData.landlordName}
                      onChange={(e) =>
                        handleInputChange("landlordName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landlordEmail">Email Address</Label>
                    <Input
                      id="landlordEmail"
                      type="email"
                      placeholder="landlord@example.com"
                      value={formData.landlordEmail}
                      onChange={(e) =>
                        handleInputChange("landlordEmail", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="landlordPhone">Phone Number</Label>
                    <Input
                      id="landlordPhone"
                      placeholder="+49 123 456789"
                      value={formData.landlordPhone}
                      onChange={(e) =>
                        handleInputChange("landlordPhone", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookingLink">
                      Booking Link (if applicable)
                    </Label>
                    <Input
                      id="bookingLink"
                      placeholder="https://..."
                      value={formData.bookingLink}
                      onChange={(e) =>
                        handleInputChange("bookingLink", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Euro className="h-5 w-5 mr-2" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRent">Monthly Rent (€)</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      placeholder="e.g., 450"
                      value={formData.monthlyRent}
                      onChange={(e) =>
                        handleInputChange("monthlyRent", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Were ALL the bills included?</Label>
                    <RadioGroup
                      value={formData.billsIncluded}
                      onValueChange={(value) =>
                        handleInputChange("billsIncluded", value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="bills-yes" />
                        <Label htmlFor="bills-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="bills-no" />
                        <Label htmlFor="bills-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {formData.billsIncluded === "no" && (
                  <div className="space-y-2">
                    <Label htmlFor="avgUtilityCost">
                      Average Monthly Expense for Utility Bills Not Included (€)
                    </Label>
                    <Input
                      id="avgUtilityCost"
                      type="number"
                      placeholder="e.g., 80"
                      value={formData.avgUtilityCost}
                      onChange={(e) =>
                        handleInputChange("avgUtilityCost", e.target.value)
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Facilities and Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Facilities and Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Kitchen Access</Label>
                      <RadioGroup
                        value={formData.kitchenAccess}
                        onValueChange={(value) =>
                          handleInputChange("kitchenAccess", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="private"
                            id="kitchen-private"
                          />
                          <Label htmlFor="kitchen-private">Private</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shared" id="kitchen-shared" />
                          <Label htmlFor="kitchen-shared">Shared</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="kitchen-none" />
                          <Label htmlFor="kitchen-none">None</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Internet Included</Label>
                      <RadioGroup
                        value={formData.internetIncluded}
                        onValueChange={(value) =>
                          handleInputChange("internetIncluded", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="internet-yes" />
                          <Label htmlFor="internet-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="internet-no" />
                          <Label htmlFor="internet-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Laundry Access</Label>
                      <RadioGroup
                        value={formData.laundryAccess}
                        onValueChange={(value) =>
                          handleInputChange("laundryAccess", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-room" id="laundry-room" />
                          <Label htmlFor="laundry-room">In Room</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shared" id="laundry-shared" />
                          <Label htmlFor="laundry-shared">
                            Shared Facility
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nearby" id="laundry-nearby" />
                          <Label htmlFor="laundry-nearby">
                            Nearby Laundromat
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Parking Available</Label>
                      <RadioGroup
                        value={formData.parkingAvailable}
                        onValueChange={(value) =>
                          handleInputChange("parkingAvailable", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="parking-yes" />
                          <Label htmlFor="parking-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="parking-no" />
                          <Label htmlFor="parking-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nearby Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={formData.nearbyAmenities.includes(amenity)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportLinks">Transport Links</Label>
                  <Textarea
                    id="transportLinks"
                    placeholder="Describe nearby public transport (metro, bus, tram stations, etc.)..."
                    value={formData.transportLinks}
                    onChange={(e) =>
                      handleInputChange("transportLinks", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evaluation and Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Evaluation and Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accommodationRating">
                      Rating (1-5 stars)
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("accommodationRating", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Poor</SelectItem>
                        <SelectItem value="2">2 - Fair</SelectItem>
                        <SelectItem value="3">3 - Good</SelectItem>
                        <SelectItem value="4">4 - Very Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Was it easy to find accommodation?</Label>
                    <RadioGroup
                      value={formData.easyToFind}
                      onValueChange={(value) =>
                        handleInputChange("easyToFind", value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="easy-yes" />
                        <Label htmlFor="easy-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="easy-no" />
                        <Label htmlFor="easy-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {formData.easyToFind === "no" && (
                  <div className="space-y-2">
                    <Label htmlFor="findingChallenges">
                      What were the challenges?
                    </Label>
                    <Textarea
                      id="findingChallenges"
                      placeholder="Describe the challenges you faced when looking for accommodation..."
                      value={formData.findingChallenges}
                      onChange={(e) =>
                        handleInputChange("findingChallenges", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Would you recommend this accommodation?</Label>
                    <RadioGroup
                      value={formData.wouldRecommend}
                      onValueChange={(value) =>
                        handleInputChange("wouldRecommend", value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="recommend-yes" />
                        <Label htmlFor="recommend-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="recommend-no" />
                        <Label htmlFor="recommend-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.wouldRecommend === "no" && (
                    <div className="space-y-2">
                      <Label htmlFor="recommendationReason">Why not?</Label>
                      <Textarea
                        id="recommendationReason"
                        placeholder="Explain why you wouldn't recommend this accommodation..."
                        value={formData.recommendationReason}
                        onChange={(e) =>
                          handleInputChange(
                            "recommendationReason",
                            e.target.value,
                          )
                        }
                        rows={4}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional tips, warnings, or information that would help future students..."
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleInputChange("additionalNotes", e.target.value)
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8">
              <Link href="/course-matching">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Course Matching
                </Button>
              </Link>

              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
              >
                Continue to Living Expenses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
