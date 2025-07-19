import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  BookOpen,
  Home,
  MessageSquare,
  Target,
} from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  action?: string;
  actionUrl?: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Erasmus Journey!",
    description:
      "We're excited to help you with your exchange experience. Let's take a quick tour to get you started.",
    icon: Target,
  },
  {
    title: "Complete Your Profile",
    description:
      "Start by filling out your personal information to get personalized recommendations and connect with other students.",
    icon: User,
    action: "Complete Profile",
    actionUrl: "/profile",
  },
  {
    title: "Track Your Application",
    description:
      "Use your dashboard to track progress on your application steps, from basic information to course matching.",
    icon: BookOpen,
    action: "View Dashboard",
    actionUrl: "/dashboard",
  },
  {
    title: "Find Accommodation",
    description:
      "Explore housing options, get budget estimates, and connect with housing offices in your destination city.",
    icon: Home,
    action: "Browse Housing",
    actionUrl: "/student-accommodations",
  },
  {
    title: "Connect with Students",
    description:
      "Read stories from other students, join the community, and get mentorship from experienced exchange participants.",
    icon: MessageSquare,
    action: "Join Community",
    actionUrl: "/community",
  },
];

interface WelcomeTourProps {
  isNewUser?: boolean;
  onComplete?: () => void;
}

const WelcomeTour: React.FC<WelcomeTourProps> = ({
  isNewUser = false,
  onComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Show tour for new users or if manually triggered
    if (isNewUser) {
      const hasSeenTour = localStorage.getItem("erasmus-tour-completed");
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }
  }, [isNewUser]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("erasmus-tour-completed", "true");
    setIsOpen(false);
    setCurrentStep(0);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem("erasmus-tour-completed", "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const currentStepData = tourSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>

          <DialogTitle className="text-xl font-bold">
            {currentStepData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6">
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>

          {currentStepData.actionUrl && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                Ready to get started?
              </p>
              <a href={currentStepData.actionUrl}>
                <Button size="sm" className="w-full">
                  {currentStepData.action}
                </Button>
              </a>
            </div>
          )}

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-blue-600"
                    : index < currentStep
                      ? "bg-blue-300"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between space-x-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              <Button variant="ghost" onClick={handleSkip} size="sm">
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>
                  {currentStep === tourSteps.length - 1
                    ? "Get Started"
                    : "Next"}
                </span>
                {currentStep < tourSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTour;
