import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Submission {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  universityInCyprus: string;
  department: string;
  receptionCountry: string;
  receptionCity: string;
  foreignUniversity: string;
  created_at: string;
  wantToHelp: string;
  nickname: string;
  accommodationType: string;
  monthlyRent: string;
  monthlyIncomeAmount: string;
  hostCourseCount: number;
  homeCourseCount: number;
}

const AdminPanel = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const { toast } = useToast();

  const adminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok && data.role === "admin") {
        setAdminUser(data);
        setIsLoggedIn(true);
        toast({
          title: "Welcome Admin!",
          description: "Successfully logged into admin panel.",
        });
        fetchSubmissions();
      } else {
        toast({
          title: "Access Denied",
          description: "Admin credentials required.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await apiService.getAllSubmissions();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions.",
        variant: "destructive",
      });
    }
  };

  const fetchSubmissionDetails = async (id: number) => {
    try {
      const data = await apiService.getSubmissionById(id);
      setSelectedSubmission(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submission details.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const csv = [
      [
        "ID",
        "Name",
        "Email",
        "University",
        "Department",
        "Destination",
        "Accommodation",
        "Date",
      ].join(","),
      ...filteredSubmissions.map((sub) =>
        [
          sub.id,
          `"${sub.firstName} ${sub.lastName}"`,
          sub.email,
          `"${sub.universityInCyprus}"`,
          `"${sub.department}"`,
          `"${sub.receptionCity}, ${sub.receptionCountry}"`,
          `"${sub.accommodationType}"`,
          new Date(sub.created_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `erasmus-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSubmissions(submissions);
    } else {
      const filtered = submissions.filter(
        (sub) =>
          sub.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.universityInCyprus
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.receptionCity.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredSubmissions(filtered);
    }
  }, [searchTerm, submissions]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <p className="text-gray-600">Administrator access required</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={adminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login to Admin Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: submissions.length,
    completed: submissions.filter((s) => s.wantToHelp).length,
    pending: submissions.filter((s) => !s.wantToHelp).length,
    withAccommodation: submissions.filter((s) => s.accommodationType).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {adminUser?.firstName}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsLoggedIn(false);
                setAdminUser(null);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Complete Forms
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    With Accommodation
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.withAccommodation}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {
                      submissions.filter(
                        (s) =>
                          new Date(s.created_at).getMonth() ===
                          new Date().getMonth(),
                      ).length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchSubmissions}>
                  <Clock className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Erasmus Submissions ({filteredSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {submission.firstName} {submission.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {submission.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {submission.universityInCyprus}
                        </p>
                        <p className="text-sm text-gray-600">
                          {submission.department}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {submission.receptionCity}
                        </p>
                        <p className="text-sm text-gray-600">
                          {submission.receptionCountry}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.wantToHelp === "yes"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {submission.wantToHelp === "yes"
                          ? "Complete"
                          : "Incomplete"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              fetchSubmissionDetails(submission.id)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Submission Details - {submission.firstName}{" "}
                              {submission.lastName}
                            </DialogTitle>
                            <DialogDescription>
                              Complete submission data for review and approval
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-6">
                              {/* Basic Information */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">
                                  Basic Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Name:</strong>{" "}
                                    {selectedSubmission.basic?.firstName}{" "}
                                    {selectedSubmission.basic?.lastName}
                                  </div>
                                  <div>
                                    <strong>Email:</strong>{" "}
                                    {selectedSubmission.basic?.email}
                                  </div>
                                  <div>
                                    <strong>Semester:</strong>{" "}
                                    {selectedSubmission.basic?.semester}
                                  </div>
                                  <div>
                                    <strong>Level:</strong>{" "}
                                    {selectedSubmission.basic?.levelOfStudy}
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              {/* Accommodation */}
                              {selectedSubmission.accommodation && (
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Accommodation
                                  </h3>
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>Type:</strong>{" "}
                                      {
                                        selectedSubmission.accommodation
                                          .accommodationType
                                      }
                                    </div>
                                    <div>
                                      <strong>Monthly Rent:</strong>{" "}
                                      {
                                        selectedSubmission.accommodation
                                          .monthlyRent
                                      }
                                    </div>
                                    <div>
                                      <strong>Neighborhood:</strong>{" "}
                                      {
                                        selectedSubmission.accommodation
                                          .neighborhood
                                      }
                                    </div>
                                    <div>
                                      <strong>Satisfaction:</strong>{" "}
                                      {
                                        selectedSubmission.accommodation
                                          .satisfactionLevel
                                      }
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Courses */}
                              {selectedSubmission.courses?.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Courses ({selectedSubmission.courses.length}
                                    )
                                  </h3>
                                  <div className="space-y-2">
                                    {selectedSubmission.courses.map(
                                      (course: any, index: number) => (
                                        <div
                                          key={index}
                                          className="p-3 bg-gray-50 rounded-lg"
                                        >
                                          <p className="font-medium">
                                            {course.name} ({course.code})
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {course.ects} ECTS, Difficulty:{" "}
                                            {course.difficulty}
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
