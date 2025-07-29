import { Badge } from "./ui/badge";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  title,
}: StepIndicatorProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Step {currentStep} of {totalSteps}
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
