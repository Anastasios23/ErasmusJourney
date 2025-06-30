import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
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
    // Handle form submission
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
    "Restaurants",
    "Pharmacy",
    "Hospital",
    "Bank/ATM",
    "Library",
    "Gym",
    "Parks",
    "Shopping Center",
  ];

  return (
    <>
      <Head>
        <title>Accommodation Details - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share details about your accommodation during your Erasmus exchange"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Accommodation Details
              </h1>
              <p className="text-gray-600">
                Help future students by sharing information about your housing
                experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Accommodation Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Accommodation Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="accommodationType">
                        Type of Accommodation
                      </Label>
                      <Select
                        value={formData.accommodationType}
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

                    <div>
                      <Label htmlFor="accommodationAddress">Address/Area</Label>
                      <Input
                        placeholder="Enter general area (e.g., City Center, University District)"
                        value={formData.accommodationAddress}
                        onChange={(e) =>
                          handleInputChange(
                            "accommodationAddress",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="neighborhood">
                      Neighborhood Description
                    </Label>
                    <Textarea
                      placeholder="Describe the neighborhood, its character, safety, etc."
                      value={formData.neighborhood}
                      onChange={(e) =>
                        handleInputChange("neighborhood", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="transportLinks">
                      Transport Links to University
                    </Label>
                    <Textarea
                      placeholder="Describe how to get to university (bus lines, walking time, etc.)"
                      value={formData.transportLinks}
                      onChange={(e) =>
                        handleInputChange("transportLinks", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cost Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Cost Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="monthlyRent">Monthly Rent (€)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.monthlyRent}
                        onChange={(e) =>
                          handleInputChange("monthlyRent", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="billsIncluded">Bills Included?</Label>
                      <RadioGroup
                        value={formData.billsIncluded}
                        onValueChange={(value) =>
                          handleInputChange("billsIncluded", value)
                        }
                        className="flex space-x-6 mt-2"
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

                    <div>
                      <Label htmlFor="avgUtilityCost">
                        Average Utility Cost (€/month)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.avgUtilityCost}
                        onChange={(e) =>
                          handleInputChange("avgUtilityCost", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="roomSize">Room Size</Label>
                      <Select
                        value={formData.roomSize}
                        onValueChange={(value) =>
                          handleInputChange("roomSize", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select room size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">
                            Small (&lt; 15m²)
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium (15-25m²)
                          </SelectItem>
                          <SelectItem value="large">
                            Large (&gt; 25m²)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="roomFurnished">Room Furnished?</Label>
                      <RadioGroup
                        value={formData.roomFurnished}
                        onValueChange={(value) =>
                          handleInputChange("roomFurnished", value)
                        }
                        className="flex space-x-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fully" id="furnished-fully" />
                          <Label htmlFor="furnished-fully">Fully</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="partially"
                            id="furnished-partially"
                          />
                          <Label htmlFor="furnished-partially">Partially</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="furnished-no" />
                          <Label htmlFor="furnished-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Kitchen Access</Label>
                      <RadioGroup
                        value={formData.kitchenAccess}
                        onValueChange={(value) =>
                          handleInputChange("kitchenAccess", value)
                        }
                        className="mt-2"
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
                      <Label>Additional Facilities</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="internet"
                            checked={formData.internetIncluded === "yes"}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "internetIncluded",
                                checked ? "yes" : "no",
                              )
                            }
                          />
                          <Label htmlFor="internet">Internet Included</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="laundry"
                            checked={formData.laundryAccess === "yes"}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "laundryAccess",
                                checked ? "yes" : "no",
                              )
                            }
                          />
                          <Label htmlFor="laundry">Laundry Access</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="parking"
                            checked={formData.parkingAvailable === "yes"}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "parkingAvailable",
                                checked ? "yes" : "no",
                              )
                            }
                          />
                          <Label htmlFor="parking">Parking Available</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                </CardContent>
              </Card>

              {/* Experience & Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="accommodationRating">
                      Rate your accommodation experience (1-5 stars)
                    </Label>
                    <Select
                      value={formData.accommodationRating}
                      onValueChange={(value) =>
                        handleInputChange("accommodationRating", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Star - Poor</SelectItem>
                        <SelectItem value="2">2 Stars - Fair</SelectItem>
                        <SelectItem value="3">3 Stars - Good</SelectItem>
                        <SelectItem value="4">4 Stars - Very Good</SelectItem>
                        <SelectItem value="5">5 Stars - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="easyToFind">
                      Was this accommodation easy to find?
                    </Label>
                    <RadioGroup
                      value={formData.easyToFind}
                      onValueChange={(value) =>
                        handleInputChange("easyToFind", value)
                      }
                      className="flex space-x-6 mt-2"
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

                  <div>
                    <Label htmlFor="findingChallenges">
                      What challenges did you face finding accommodation?
                    </Label>
                    <Textarea
                      placeholder="Describe any challenges or difficulties..."
                      value={formData.findingChallenges}
                      onChange={(e) =>
                        handleInputChange("findingChallenges", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wouldRecommend">
                      Would you recommend this accommodation?
                    </Label>
                    <RadioGroup
                      value={formData.wouldRecommend}
                      onValueChange={(value) =>
                        handleInputChange("wouldRecommend", value)
                      }
                      className="flex space-x-6 mt-2"
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

                  <div>
                    <Label htmlFor="recommendationReason">
                      Please explain your recommendation
                    </Label>
                    <Textarea
                      placeholder="Why would you recommend or not recommend this place?"
                      value={formData.recommendationReason}
                      onChange={(e) =>
                        handleInputChange(
                          "recommendationReason",
                          e.target.value,
                        )
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">
                      Additional Notes & Tips
                    </Label>
                    <Textarea
                      placeholder="Any other advice for future students about accommodation..."
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        handleInputChange("additionalNotes", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-between">
                <Link href="/course-matching">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                </Link>
                <Button type="submit">
                  Continue to Living Expenses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
