import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  nextStep?: {
    label: string;
    path: string;
  };
  showConfetti?: boolean;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  nextStep,
  showConfetti = true,
}) => {
  const [confettiVisible, setConfettiVisible] = useState(false);

  useEffect(() => {
    if (isOpen && showConfetti) {
      setConfettiVisible(true);
      const timer = setTimeout(() => setConfettiVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti]);

  return (
    <>
      {/* Confetti Effect */}
      {confettiVisible && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
            {[...Array(50)].map((_, i) => (
              <div
                key={i + 50}
                className="absolute w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
            {[...Array(50)].map((_, i) => (
              <div
                key={i + 100}
                className="absolute w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              {title}
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Information saved successfully!
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your data has been securely stored and will help future Erasmus
                students.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {nextStep && (
                <Link to={nextStep.path} className="flex-1">
                  <Button className="w-full">
                    {nextStep.label}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Thank you for contributing to the Erasmus community! 🎉
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuccessDialog;
