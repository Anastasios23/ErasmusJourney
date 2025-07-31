import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, Star, TrendingUp } from "lucide-react";

export function ImprovementsSummary() {
  const improvements = [
    {
      title: "Recently Viewed Functionality",
      description:
        "Track and display recently viewed accommodations and stories",
      impact: "High",
      timeToImplement: "15 minutes",
      features: [
        "Automatic tracking of viewed items",
        "Smart time-based filtering (30 days)",
        "Clean UI with type-specific icons",
        "Local storage persistence",
      ],
      status: "Completed",
    },
    {
      title: "Enhanced Form Validation",
      description: "User-friendly validation messages across all forms",
      impact: "Medium",
      timeToImplement: "10 minutes",
      features: [
        "Context-aware error messages",
        "Field-specific validation rules",
        "Real-time validation feedback",
        "Improved user experience",
      ],
      status: "Completed",
    },
    {
      title: "Quick Filters for Stories",
      description: "One-click filters for common user scenarios",
      impact: "High",
      timeToImplement: "20 minutes",
      features: [
        "Personalized filters based on user profile",
        "Category-based quick access",
        "Sort options integration",
        "Active filter indicators",
      ],
      status: "Completed",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-green-100 text-green-800 border-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Recent UX Improvements Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {improvements.map((improvement, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-lg">
                      {improvement.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getImpactColor(improvement.impact)}
                    >
                      {improvement.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {improvement.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {improvement.timeToImplement}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-900">
                  Key Features:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {improvement.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Star className="h-3 w-3 text-blue-500 fill-current" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <Badge variant="default" className="bg-green-600">
                  ✅ {improvement.status}
                </Badge>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              Total Impact Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">45</div>
                <div className="text-sm text-blue-700">
                  Minutes Implementation
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-green-700">Features Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-purple-700">Pages Enhanced</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
