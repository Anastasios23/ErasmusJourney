import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { ArrowLeft, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HelpFutureStudents = () => {
  return (
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
                Step 5 of 5
              </Badge>
              <h1 className="text-2xl font-bold text-gray-900">
                Helping Future Erasmus Students
              </h1>
            </div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-16">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Help Future Erasmus Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This final page will allow you to become a mentor for future
              students, provide contact information, and share additional advice
              and tips.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-8">
              <strong>Coming Soon:</strong> Mentor signup forms, contact sharing
              options, advice submission system, and community integration.
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8">
          <Link to="/living-expenses">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Living Expenses
            </Button>
          </Link>

          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Complete Application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpFutureStudents;
