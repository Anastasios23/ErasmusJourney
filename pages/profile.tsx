import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../src/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { Separator } from "../src/components/ui/separator";
import { User, Calendar, Edit, Save, X, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  const [initialProfileData, setInitialProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    dateOfBirth: "",
  });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    dateOfBirth: "",
  });

  // Initialize form with session data
  useEffect(() => {
    if (session?.user) {
      const initialData = {
        name: session.user?.name || "",
        email: session.user?.email || "",
        phone: (session.user as any)?.phone || "",
        address: (session.user as any)?.address || "",
        bio: (session.user as any)?.bio || "",
        dateOfBirth: (session.user as any)?.dateOfBirth || "",
      };
      setProfileData(initialData);
      setInitialProfileData(initialData);
    }
  }, [session]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        // Update the session with new data
        await update();
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanged =
      JSON.stringify(profileData) !== JSON.stringify(initialProfileData);

    if (hasChanged) {
      setIsCancelAlertOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmCancel = () => {
    // Reset form data to original session data
    setProfileData(initialProfileData);
    setIsEditing(false);
    setIsCancelAlertOpen(false);
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>My Profile - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Manage your personal information and profile settings"
          />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Profile - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Manage your personal information and profile settings"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Profile
              </h1>
              <p className="text-gray-600">
                Manage your personal information and profile settings
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={(session.user as any)?.image} />
                      <AvatarFallback className="text-2xl">
                        {session.user?.name?.[0] || session.user?.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">
                      {session.user?.name || "User"}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      {session.user?.email}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {new Date().getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {profileData.address || "No address provided"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/basic-information")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Application Info
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/settings")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="name"
                              value={profileData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              {profileData.name || "Not provided"}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="p-3 bg-gray-100 rounded-md text-gray-600">
                            {profileData.email}
                            <span className="text-xs block text-gray-500 mt-1">
                              Email cannot be changed
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          {isEditing ? (
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              {profileData.phone || "Not provided"}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          {isEditing ? (
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={profileData.dateOfBirth}
                              onChange={(e) =>
                                handleInputChange("dateOfBirth", e.target.value)
                              }
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              {profileData.dateOfBirth || "Not provided"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        {isEditing ? (
                          <Input
                            id="address"
                            value={profileData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            placeholder="Enter your address"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            {profileData.address || "Not provided"}
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) =>
                              handleInputChange("bio", e.target.value)
                            }
                            placeholder="Tell us about yourself..."
                            rows={4}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                            {profileData.bio || "No bio provided"}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you cancel now, your changes will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
