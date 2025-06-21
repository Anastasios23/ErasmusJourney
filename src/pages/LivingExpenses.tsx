import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { ArrowRight, ArrowLeft, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const LivingExpenses = () => {
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
                Step 4 of 5
              </Badge>
              <h1 className="text-2xl font-bold text-gray-900">
                Living Expenses & Lifestyle
              </h1>
            </div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-16">
          <CardHeader>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Living Expenses & Lifestyle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This page will contain budget information, spending habits,
              monthly expenses breakdown, and budget tips for future students.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-8">
              <strong>Coming Soon:</strong> Expense tracking forms, budget
              calculator, spending habit assessment, and tip sharing system.
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8">
          <Link to="/accommodation">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Accommodation
            </Button>
          </Link>

          <Link to="/help-future-students">
            <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
              Continue to Help Future Students
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LivingExpenses;
