import { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Search, Download, Filter, Users, FileText } from "lucide-react";

type Submission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  level: string;
  homeUniversity: string;
  partnerUniversity: string;
  partnerCity: string;
  partnerCountry: string;
  status: string;
  semester: string | null;
  academicYear: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then(({ submissions }) => {
        setSubmissions(submissions);
        setFilteredSubmissions(submissions);
      })
      .catch((err) => console.error("Error fetching submissions:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter submissions based on search and filters
  useEffect(() => {
    let filtered = submissions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          submission.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.partnerUniversity
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (submission) => submission.status === statusFilter,
      );
    }

    // University filter
    if (universityFilter !== "all") {
      filtered = filtered.filter(
        (submission) => submission.homeUniversity === universityFilter,
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, universityFilter]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      DRAFT: "bg-gray-100 text-gray-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const uniqueUniversities = [
    ...new Set(submissions.map((s) => s.homeUniversity)),
  ];

  const exportToCSV = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Course",
      "Level",
      "Home University",
      "Partner University",
      "Partner City",
      "Partner Country",
      "Status",
      "Semester",
      "Academic Year",
      "Submitted Date",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredSubmissions.map((s) =>
        [
          s.id,
          s.firstName,
          s.lastName,
          s.email,
          s.course,
          s.level,
          s.homeUniversity,
          s.partnerUniversity,
          s.partnerCity,
          s.partnerCountry,
          s.status,
          s.semester || "",
          s.academicYear || "",
          new Date(s.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `erasmus-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Erasmus Submissions - Admin Dashboard</title>
        <meta
          name="description"
          content="View and manage Erasmus application submissions"
        />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Erasmus Submissions
            </h1>
            <p className="mt-2 text-gray-600">
              View and manage all Erasmus application submissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Submissions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {submissions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        submissions.filter((s) => s.status === "ACCEPTED")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Filter className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Under Review
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        submissions.filter((s) => s.status === "UNDER_REVIEW")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Download className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      This Month
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        submissions.filter((s) => {
                          const submissionDate = new Date(s.createdAt);
                          const currentDate = new Date();
                          return (
                            submissionDate.getMonth() ===
                              currentDate.getMonth() &&
                            submissionDate.getFullYear() ===
                              currentDate.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={universityFilter}
                  onValueChange={setUniversityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    {uniqueUniversities.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={exportToCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No submissions found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course & Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Universities
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {submission.firstName} {submission.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {submission.course}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.level}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              From: {submission.homeUniversity}
                            </div>
                            <div className="text-sm text-gray-500">
                              To: {submission.partnerUniversity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {submission.partnerCity}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.partnerCountry}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(submission.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {submission.semester || "Not specified"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.academicYear || "Not specified"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              submission.createdAt,
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
