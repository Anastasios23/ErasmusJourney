import React from "react";
import { Progress } from "./ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Contains lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "Contains number",
    test: (password) => /\d/.test(password),
  },
  {
    label: "Contains special character",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  onStrengthChange,
}) => {
  const passedRequirements = requirements.filter((req) => req.test(password));
  const strength = (passedRequirements.length / requirements.length) * 100;

  React.useEffect(() => {
    onStrengthChange?.(strength);
  }, [strength, onStrengthChange]);

  if (!password) return null;

  const getStrengthLabel = () => {
    if (strength < 40) return { label: "Weak", color: "text-red-600" };
    if (strength < 80) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Strong", color: "text-green-600" };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Password Strength
        </span>
        <span className={`text-sm font-medium ${strengthInfo.color}`}>
          {strengthInfo.label}
        </span>
      </div>

      <Progress
        value={strength}
        className="h-2"
        // Custom color based on strength
        style={{
          backgroundColor: "#f3f4f6",
        }}
      />

      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const isPassed = requirement.test(password);
          return (
            <div
              key={index}
              className={`flex items-center space-x-2 text-sm ${
                isPassed ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isPassed ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
