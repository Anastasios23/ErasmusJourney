import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
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
import { Badge } from "../src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  User,
  Edit3,
  Save,
  MapPin,
  Calendar,
  BookOpen,
  Home,
  MessageSquare,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  department: string;
  levelOfStudy: string;
  bio: string;
  country: string;
  city: string;
  createdAt: string;
}

interface UserSubmission {
  id: string;
  type:
    | "basic-info"
    | "course-matching"
    | "accommodation"
    | "story"
    | "experience";
  title: string;
  status: "draft" | "submitted" | "published";
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    university: "UNIC",
    department: "Computer Science",
    levelOfStudy: "bachelor",
    bio: "Passionate computer science student interested in AI and machine learning.",
    country: "Cyprus",
    city: "Nicosia",
    createdAt: "2024-01-15",
  });

  const [submissions, setSubmissions] = useState<UserSubmission[]>([
    {
      id: "1",
      type: "basic-info",
      title: "Basic Information Form",
      status: "published",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-16",
    },
    {
      id: "2",
      type: "course-matching",
      title: "Course Matching - Fall 2024",
      status: "submitted",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-20",
    },
    {
      id: "3",
      type: "accommodation",
      title: "Student Housing Experience",
      status: "draft",
      createdAt: "2024-01-22",
      updatedAt: "2024-01-22",
    },
  ]);

  const [editForm, setEditForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: profile.bio,
    country: profile.country,
    city: profile.city,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfile({
        ...profile,
        ...editForm,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "basic-info":
        return <User className="h-4 w-4" />;
      case "course-matching":
        return <BookOpen className="h-4 w-4" />;
      case "accommodation":
        return <Home className="h-4 w-4" />;
      case "story":
        return <MessageSquare className="h-4 w-4" />;
      case "experience":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Head>
        <title>My Profile - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Manage your profile and submissions on the Erasmus Journey Platform"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {profile.university} - {profile.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {profile.city}, {profile.country}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Member since{" "}
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleEditToggle}
                    variant={isEditing ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Edit3 className="h-4 w-4" />
                    )}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="submissions">My Submissions</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={editForm.firstName}
                                onChange={(e) =>
                                  handleInputChange("firstName", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={editForm.lastName}
                                onChange={(e) =>
                                  handleInputChange("lastName", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editForm.bio}
                              onChange={(e) =>
                                handleInputChange("bio", e.target.value)
                              }
                              rows={3}
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="country">Country</Label>
                              <Input
                                id="country"
                                value={editForm.country}
                                onChange={(e) =>
                                  handleInputChange("country", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={editForm.city}
                                onChange={(e) =>
                                  handleInputChange("city", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Bio</p>
                            <p className="text-gray-900">{profile.bio}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                Level of Study
                              </p>
                              <p className="text-gray-900 capitalize">
                                {profile.levelOfStudy}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Department
                              </p>
                              <p className="text-gray-900">
                                {profile.department}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link href="/basic-information">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Update Basic Information
                        </Button>
                      </Link>
                      <Link href="/course-matching">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Submit Course Matching
                        </Button>
                      </Link>
                      <Link href="/student-accommodations">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Share Accommodation Experience
                        </Button>
                      </Link>
                      <Link href="/student-stories">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Write Your Story
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {submissions.length}
                      </p>
                      <p className="text-sm text-gray-600">Total Submissions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {
                          submissions.filter((s) => s.status === "published")
                            .length
                        }
                      </p>
                      <p className="text-sm text-gray-600">Published</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {
                          submissions.filter((s) => s.status === "submitted")
                            .length
                        }
                      </p>
                      <p className="text-sm text-gray-600">Pending Review</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {submissions.filter((s) => s.status === "draft").length}
                      </p>
                      <p className="text-sm text-gray-600">Drafts</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Submissions Tab */}
              <TabsContent value="submissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(submission.type)}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {submission.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Last updated:{" "}
                                {new Date(
                                  submission.updatedAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={getStatusColor(submission.status)}
                            >
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              {submission.status === "draft" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Drafts Tab */}
              <TabsContent value="drafts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Draft Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submissions
                        .filter((s) => s.status === "draft")
                        .map((submission) => (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getTypeIcon(submission.type)}
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {submission.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Created:{" "}
                                  {new Date(
                                    submission.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm">Continue Editing</Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      {submissions.filter((s) => s.status === "draft")
                        .length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No drafts found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={profile.university}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        University information is set during registration.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button variant="destructive">Delete Account</Button>
                      <p className="text-sm text-gray-500 mt-2">
                        This action cannot be undone. All your data will be
                        permanently deleted.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
