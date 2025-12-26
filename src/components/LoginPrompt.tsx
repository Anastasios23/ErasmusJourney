import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, UserPlus, Eye, BookOpen } from "lucide-react";

interface LoginPromptProps {
  title?: string;
  description?: string;
  currentPath?: string;
  showBenefits?: boolean;
  showAlternatives?: boolean;
  className?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({
  title = "Account Required",
  description = "To access this feature, you'll need to create an account or log in. This helps us save your progress and keep your information secure.",
  currentPath = "/basic-information",
  showBenefits = true,
  showAlternatives = true,
  className = "",
}) => {
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
  const registerUrl = `/register?callbackUrl=${encodeURIComponent(currentPath)}`;

  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}
    >
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </CardTitle>
          <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Login/Register Buttons */}
          <div className="space-y-3">
            <Link href={loginUrl} className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">
                <Lock className="h-4 w-4 mr-2" />
                Log In to Continue
              </Button>
            </Link>
            <Link href={registerUrl} className="block">
              <Button
                variant="outline"
                className="w-full h-11 text-base border-2 hover:bg-gray-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Benefits Section */}
          {showBenefits && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                Why create an account?
              </h4>
              <ul className="space-y-1 text-blue-800 text-xs">
                <li className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="w-1.5 h-1.5 rounded-full mr-2 p-0 bg-blue-400"
                  />
                  Save your application progress automatically
                </li>
                <li className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="w-1.5 h-1.5 rounded-full mr-2 p-0 bg-blue-400"
                  />
                  Access personalized recommendations
                </li>
                <li className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="w-1.5 h-1.5 rounded-full mr-2 p-0 bg-blue-400"
                  />
                  Connect with other Erasmus students
                </li>
                <li className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="w-1.5 h-1.5 rounded-full mr-2 p-0 bg-blue-400"
                  />
                  Track your application status
                </li>
              </ul>
            </div>
          )}

          {/* Alternatives Section */}
          {showAlternatives && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3 text-center">
                Want to explore first? You can browse without an account:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/destinations">
                  <Button
                    variant="ghost"
                    className="w-full text-xs h-9 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Destinations
                  </Button>
                </Link>
                <Link href="/course-matching-experiences">
                  <Button
                    variant="ghost"
                    className="w-full text-xs h-9 text-blue-600 hover:bg-blue-50"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Course Experiences
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              🔒 Your data is secure and will never be shared with third parties
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPrompt;
