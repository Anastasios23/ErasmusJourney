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
import { Textarea } from "../../src/components/ui/textarea";
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
  MapPin,
  Users,
  Home,
  Euro,
  Star,
  Eye,
  Check,
  X,
  Clock,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

interface FormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: any;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface LivingExpenses {
  rent?: number;
  groceries?: number;
  transportation?: number;
  eatingOut?: number;
  bills?: number;
  entertainment?: number;
  other?: number;
  total?: number;
}

export default function AdminFormReview() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = { user: { id: 'anonymous', role: 'ADMIN', email: 'admin@example.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

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
    if (status === "loading") return;

    // AUTHENTICATION DISABLED - Comment out to re-enable
    // if (!session || session.user?.role !== "ADMIN") {
    //   router.push("/login");
    //   return;
    // }

    fetchSubmissions();
  }, [/*session, status, router*/]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching form submissions...');
      const response = await safeFetch("/api/admin/form-submissions");
      if (response.ok) {
        const data = await response.json();
        console.log('Form submissions fetched successfully:', data?.length || 0);
        setSubmissions(data || []);
      } else {
        console.error('Failed to fetch form submissions, status:', response.status);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionAction = async (
    submissionId: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      const newStatus = action === "approve" ? "PUBLISHED" : "ARCHIVED";
      console.log(`${action === "approve" ? "Approving" : "Rejecting"} submission:`, submissionId);

      const response = await safeFetch(`/api/admin/form-submissions/${submissionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: notes || adminNotes
        }),
      });

      if (response.ok) {
        console.log(`Successfully ${action === "approve" ? "approved" : "rejected"} submission`);
        await fetchSubmissions();
        setSelectedSubmission(null);
        setAdminNotes("");
      } else {
        console.error(`Failed to ${action} submission, status:`, response.status);
      }
    } catch (error) {
      console.error("Error updating submission:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      "BASIC_INFO": Users,
      "ACCOMMODATION": Home,
      "LIVING_EXPENSES": Euro,
      "COURSE_MATCHING": GraduationCap,
      "EXPERIENCE": Star,
    };

    const IconComponent = iconMap[type as keyof typeof iconMap] || MapPin;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "ARCHIVED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLivingExpensesFromSubmissions = (submissions: FormSubmission[]): LivingExpenses => {
    const expenseSubmissions = submissions.filter(s => s.type === "LIVING_EXPENSES");
    
    if (expenseSubmissions.length === 0) return {};

    const expenses = ["rent", "groceries", "transportation", "eatingOut", "bills", "entertainment", "other"];
    const result: any = {};

    expenses.forEach(expense => {
      const values = expenseSubmissions
        .map(sub => parseFloat(sub.data[expense] || "0"))
        .filter(val => !isNaN(val) && val > 0);
      
      if (values.length > 0) {
        result[expense] = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
      }
    });

    result.total = Object.values(result).reduce((sum: number, val: any) => sum + (val || 0), 0);
    return result;
  };

  const renderSubmissionDetails = (submission: FormSubmission) => {
    const data = submission.data;

    switch (submission.type) {
      case "BASIC_INFO":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Personal Info</h4>
                <p className="text-sm text-gray-600">
                  {data.firstName} {data.lastName}
                </p>
                <p className="text-sm text-gray-600">{data.email}</p>
                <p className="text-sm text-gray-600">{data.homeUniversity}</p>
              </div>
              <div>
                <h4 className="font-medium">Destination</h4>
                <p className="text-sm text-gray-600">
                  {data.hostCity}, {data.hostCountry}
                </p>
                <p className="text-sm text-gray-600">{data.hostUniversity}</p>
                <p className="text-sm text-gray-600">Duration: {data.duration}</p>
              </div>
            </div>
          </div>
        );

      case "ACCOMMODATION":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Accommodation Details</h4>
                <p className="text-sm text-gray-600">Type: {data.accommodationType}</p>
                <p className="text-sm text-gray-600">Monthly Rent: €{data.monthlyRent}</p>
                <p className="text-sm text-gray-600">Location: {data.neighborhood}</p>
              </div>
              <div>
                <h4 className="font-medium">Experience</h4>
                <p className="text-sm text-gray-600">{data.accommodationDescription}</p>
                {data.pros && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-green-600">Pros:</p>
                    <ul className="text-xs text-gray-600">
                      {(Array.isArray(data.pros) ? data.pros : [data.pros]).map((pro: string, i: number) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "LIVING_EXPENSES":
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Monthly Living Expenses</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm">Rent: €{data.rent || 0}</p>
                <p className="text-sm">Groceries: €{data.groceries || 0}</p>
                <p className="text-sm">Transportation: €{data.transportation || 0}</p>
                <p className="text-sm">Eating Out: €{data.eatingOut || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Bills: €{data.bills || 0}</p>
                <p className="text-sm">Entertainment: €{data.entertainment || 0}</p>
                <p className="text-sm">Other: €{data.other || 0}</p>
                <p className="text-sm font-medium">
                  Total: €{(parseFloat(data.rent || 0) + parseFloat(data.groceries || 0) + 
                           parseFloat(data.transportation || 0) + parseFloat(data.eatingOut || 0) +
                           parseFloat(data.bills || 0) + parseFloat(data.entertainment || 0) +
                           parseFloat(data.other || 0))}
                </p>
              </div>
            </div>
          </div>
        );

      case "COURSE_MATCHING":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Academic Info</h4>
                <p className="text-sm text-gray-600">Host University: {data.hostUniversity}</p>
                <p className="text-sm text-gray-600">Field of Study: {data.fieldOfStudy}</p>
                <p className="text-sm text-gray-600">Study Level: {data.studyLevel}</p>
              </div>
              <div>
                <h4 className="font-medium">Course Details</h4>
                {data.courses && data.courses.length > 0 && (
                  <div className="space-y-1">
                    {data.courses.slice(0, 3).map((course: any, i: number) => (
                      <p key={i} className="text-sm text-gray-600">
                        {course.name} ({course.ects} ECTS)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    switch (activeTab) {
      case "pending":
        return submission.status === "SUBMITTED";
      case "approved":
        return submission.status === "PUBLISHED";
      case "rejected":
        return submission.status === "ARCHIVED";
      default:
        return true;
    }
  });

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
        <title>Form Review - Admin</title>
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Form Review</h1>
            <p className="text-gray-600">Review and approve form submissions from students</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({submissions.filter(s => s.status === "SUBMITTED").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({submissions.filter(s => s.status === "PUBLISHED").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({submissions.filter(s => s.status === "ARCHIVED").length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(submission.type)}
                            <span className="text-sm">{submission.type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {submission.user.firstName} {submission.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{submission.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.data.hostCity && submission.data.hostCountry ? (
                            <span>{submission.data.hostCity}, {submission.data.hostCountry}</span>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Form Submission Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {selectedSubmission && renderSubmissionDetails(selectedSubmission)}
                                  
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Admin Notes
                                    </label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about this submission..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  {selectedSubmission?.status === "SUBMITTED" && (
                                    <div className="flex space-x-2 pt-4">
                                      <Button
                                        onClick={() => selectedSubmission && handleSubmissionAction(selectedSubmission.id, "approve", adminNotes)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve & Create Destination
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => selectedSubmission && handleSubmissionAction(selectedSubmission.id, "reject", adminNotes)}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No submissions found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
