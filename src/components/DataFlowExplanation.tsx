import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, Users, CheckCircle, MapPin, Eye } from "lucide-react";

export function DataFlowExplanation() {
  const steps = [
    {
      step: 1,
      title: "Student Fills Multi-Step Form",
      description:
        "Student completes all 5 steps of the Erasmus application form",
      data: [
        "Basic Information (Name, Universities, Destination)",
        "Course Matching (Academic details)",
        "Accommodation (Housing preferences)",
        "Living Expenses (Monthly budget breakdown)",
        "Student Story (Experience and rating)",
      ],
      status: "input",
      icon: <Users className="h-5 w-5" />,
    },
    {
      step: 2,
      title: "Data Stored as Submission",
      description:
        "All form data is saved in the database with 'SUBMITTED' status",
      data: [
        "FormSubmission table entry created",
        "Status: 'SUBMITTED' (waiting for admin review)",
        "JSON data field contains all form responses",
        "User relationship established",
      ],
      status: "processing",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      step: 3,
      title: "Admin Reviews Submission",
      description: "Admin sees the submission in the pending review panel",
      data: [
        "Admin views all student-provided data",
        "Admin adds destination description",
        "Admin uploads/sets destination image",
        "Admin creates destination highlights",
        "Admin can approve or reject",
      ],
      status: "review",
      icon: <Eye className="h-5 w-5" />,
    },
    {
      step: 4,
      title: "Approved Data Creates Destination",
      description: "When approved, data is processed into public destination",
      data: [
        "Destination table entry created/updated",
        "Cost data aggregated from submission",
        "Admin description and image added",
        "FormSubmission status → 'APPROVED'",
        "Destination featured → true (published)",
      ],
      status: "approved",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      step: 5,
      title: "Public Destinations Page Updated",
      description: "Approved destinations appear on the public website",
      data: [
        "Destination card shown to all users",
        "Cost averages calculated from submissions",
        "Student count and ratings displayed",
        "Admin-curated content visible",
        "Real student data backing the information",
      ],
      status: "live",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "input":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "review":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "live":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>How the Destinations System Works</CardTitle>
        <p className="text-gray-600">
          Complete data flow from student form to public destination page
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-start gap-4">
                {/* Step Number */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    step.status === "input"
                      ? "bg-blue-500"
                      : step.status === "processing"
                        ? "bg-yellow-500"
                        : step.status === "review"
                          ? "bg-orange-500"
                          : step.status === "approved"
                            ? "bg-green-500"
                            : "bg-purple-500"
                  }`}
                >
                  {step.step}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {step.icon}
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(step.status)}
                    >
                      {step.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-3">{step.description}</p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">
                      Key Data Points:
                    </h4>
                    <ul className="space-y-1">
                      {step.data.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Arrow to next step */}
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-4 mb-2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4">
            🎯 Key Benefits of This System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800">For Students</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• See real cost data from actual students</li>
                <li>• Read verified experiences and ratings</li>
                <li>• Get accurate destination information</li>
                <li>• Know the data comes from peer students</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">For Admin</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Full control over what gets published</li>
                <li>• Can add context and professional descriptions</li>
                <li>• Quality assurance on all public content</li>
                <li>• Data-driven destinations from real submissions</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
