import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "../ui/enhanced-select";
import { EnhancedInput } from "../ui/enhanced-input";
import { EnhancedTextarea } from "../ui/enhanced-textarea";
import {
  FormField,
  FormSection,
  FormGrid,
  DisabledFieldHint,
} from "../ui/form-components";
import {
  formSpacing,
  formLayout,
  formStates,
  getFieldClasses,
  getSelectClasses,
  formPatterns,
} from "../../utils/formDesignUtils";
import {
  User,
  GraduationCap,
  MapPin,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface FormDesignDemoProps {
  className?: string;
}

export const FormDesignDemo: React.FC<FormDesignDemoProps> = ({
  className,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    department: "",
    country: "",
    city: "",
    comments: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.university)
      newErrors.university = "University selection is required";
    if (!formData.department && formData.university) {
      newErrors.department = "Please select a department";
    }

    setErrors(newErrors);
    setShowValidation(true);
    return Object.keys(newErrors).length === 0;
  };

  const universities = [
    { value: "ucy", label: "University of Cyprus" },
    { value: "cut", label: "Cyprus University of Technology" },
    { value: "unic", label: "University of Nicosia" },
  ];

  const departments = formData.university
    ? [
        { value: "cs", label: "Computer Science" },
        { value: "eng", label: "Engineering" },
        { value: "bus", label: "Business Administration" },
        { value: "med", label: "Medicine" },
      ]
    : [];

  const countries = formData.department
    ? [
        { value: "de", label: "Germany" },
        { value: "fr", label: "France" },
        { value: "es", label: "Spain" },
        { value: "it", label: "Italy" },
      ]
    : [];

  return (
    <div className={className}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="info" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            Form Design Improvements Demo
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Form Design System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstrating improved visual cues for disabled fields, better error
            message spacing, and mobile-optimized form layouts.
          </p>
        </div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Before: Standard Implementation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-red-600">❌</span>
                <span>Before: Standard Forms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-university">Cyprus University *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.value} value={uni.value}>
                        {uni.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="old-department">Department *</Label>
                <Select disabled={!formData.university}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="old-email">Email *</Label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {showValidation && errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="text-sm text-gray-500 space-y-2">
                <h4 className="font-medium">Issues:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• No visual cue why department is disabled</li>
                  <li>• Error messages can overlap content</li>
                  <li>• Inconsistent spacing on mobile</li>
                  <li>• No helper text for user guidance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* After: Enhanced Implementation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>After: Enhanced Forms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Cyprus University"
                required
                error={showValidation ? errors.university : undefined}
                fieldId="enhanced-university"
              >
                <EnhancedSelect
                  value={formData.university}
                  onValueChange={(value) =>
                    handleInputChange("university", value)
                  }
                >
                  <EnhancedSelectTrigger
                    id="enhanced-university"
                    error={showValidation ? errors.university : undefined}
                  >
                    <EnhancedSelectValue placeholder="Select your university" />
                  </EnhancedSelectTrigger>
                  <EnhancedSelectContent>
                    {universities.map((uni) => (
                      <EnhancedSelectItem key={uni.value} value={uni.value}>
                        {uni.label}
                      </EnhancedSelectItem>
                    ))}
                  </EnhancedSelectContent>
                </EnhancedSelect>
              </FormField>

              <FormField
                label="Department"
                required
                error={showValidation ? errors.department : undefined}
                fieldId="enhanced-department"
              >
                <EnhancedSelect
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                  disabled={!formData.university}
                >
                  <EnhancedSelectTrigger
                    id="enhanced-department"
                    disabled={!formData.university}
                    error={showValidation ? errors.department : undefined}
                  >
                    <EnhancedSelectValue
                      placeholder={
                        !formData.university
                          ? "Select university first"
                          : "Select your department"
                      }
                      disabledMessage="Select university first"
                      disabled={!formData.university}
                    />
                  </EnhancedSelectTrigger>
                  <EnhancedSelectContent>
                    {departments.map((dept) => (
                      <EnhancedSelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </EnhancedSelectItem>
                    ))}
                  </EnhancedSelectContent>
                </EnhancedSelect>
                {!formData.university && (
                  <DisabledFieldHint message="Choose your Cyprus university to see available departments" />
                )}
              </FormField>

              <FormField
                label="Email Address"
                required
                error={showValidation ? errors.email : undefined}
                helperText="We'll use this to send you important updates"
                fieldId="enhanced-email"
              >
                <EnhancedInput
                  id="enhanced-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={showValidation ? errors.email : undefined}
                />
              </FormField>

              <div className="text-sm text-green-600 space-y-2">
                <h4 className="font-medium flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Improvements:</span>
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>• Clear visual cues for disabled fields</li>
                  <li>• Proper spacing for error messages</li>
                  <li>• Mobile-optimized touch targets</li>
                  <li>• Helpful guidance text</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Form Sections Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Enhanced Form Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Personal Information Section */}
              <FormSection
                title="Personal Information"
                subtitle="Your basic details for the Erasmus application"
                icon={User}
              >
                <FormGrid columns={2}>
                  <FormField
                    label="First Name"
                    required
                    error={showValidation ? errors.firstName : undefined}
                    fieldId="demo-firstName"
                  >
                    <EnhancedInput
                      id="demo-firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      error={showValidation ? errors.firstName : undefined}
                    />
                  </FormField>

                  <FormField
                    label="Last Name"
                    required
                    error={showValidation ? errors.lastName : undefined}
                    fieldId="demo-lastName"
                  >
                    <EnhancedInput
                      id="demo-lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      error={showValidation ? errors.lastName : undefined}
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Academic Information Section */}
              <FormSection
                title="Academic Information"
                subtitle="Details about your studies and exchange preferences"
                icon={GraduationCap}
              >
                <FormGrid columns={2}>
                  <FormField
                    label="Cyprus University"
                    required
                    error={showValidation ? errors.university : undefined}
                    fieldId="demo-university"
                  >
                    <EnhancedSelect
                      value={formData.university}
                      onValueChange={(value) =>
                        handleInputChange("university", value)
                      }
                    >
                      <EnhancedSelectTrigger
                        id="demo-university"
                        error={showValidation ? errors.university : undefined}
                      >
                        <EnhancedSelectValue placeholder="Select your university" />
                      </EnhancedSelectTrigger>
                      <EnhancedSelectContent>
                        {universities.map((uni) => (
                          <EnhancedSelectItem key={uni.value} value={uni.value}>
                            {uni.label}
                          </EnhancedSelectItem>
                        ))}
                      </EnhancedSelectContent>
                    </EnhancedSelect>
                  </FormField>

                  <FormField
                    label="Department"
                    required
                    error={showValidation ? errors.department : undefined}
                    fieldId="demo-department"
                  >
                    <EnhancedSelect
                      value={formData.department}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                      disabled={!formData.university}
                    >
                      <EnhancedSelectTrigger
                        id="demo-department"
                        disabled={!formData.university}
                        error={showValidation ? errors.department : undefined}
                      >
                        <EnhancedSelectValue
                          placeholder={
                            !formData.university
                              ? "Select university first"
                              : "Select your department"
                          }
                          disabledMessage="Select university first"
                          disabled={!formData.university}
                        />
                      </EnhancedSelectTrigger>
                      <EnhancedSelectContent>
                        {departments.map((dept) => (
                          <EnhancedSelectItem
                            key={dept.value}
                            value={dept.value}
                          >
                            {dept.label}
                          </EnhancedSelectItem>
                        ))}
                      </EnhancedSelectContent>
                    </EnhancedSelect>
                    {!formData.university && (
                      <DisabledFieldHint message="Choose your Cyprus university to see available departments" />
                    )}
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Exchange Preferences Section */}
              <FormSection
                title="Exchange Preferences"
                subtitle="Where would you like to study abroad?"
                icon={MapPin}
              >
                <FormGrid columns={2}>
                  <FormField label="Preferred Country" fieldId="demo-country">
                    <EnhancedSelect
                      value={formData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                      disabled={!formData.department}
                    >
                      <EnhancedSelectTrigger
                        id="demo-country"
                        disabled={!formData.department}
                      >
                        <EnhancedSelectValue
                          placeholder={
                            !formData.department
                              ? "Complete academic info first"
                              : "Select preferred country"
                          }
                          disabledMessage="Complete academic info first"
                          disabled={!formData.department}
                        />
                      </EnhancedSelectTrigger>
                      <EnhancedSelectContent>
                        {countries.map((country) => (
                          <EnhancedSelectItem
                            key={country.value}
                            value={country.value}
                          >
                            {country.label}
                          </EnhancedSelectItem>
                        ))}
                      </EnhancedSelectContent>
                    </EnhancedSelect>
                    {!formData.department && (
                      <DisabledFieldHint message="Complete your academic information to see available countries" />
                    )}
                  </FormField>

                  <FormField
                    label="Preferred City"
                    helperText="Optional - we'll show options based on your country selection"
                    fieldId="demo-city"
                  >
                    <EnhancedInput
                      id="demo-city"
                      placeholder={
                        !formData.country
                          ? "Select country first"
                          : "Enter preferred city"
                      }
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      disabled={!formData.country}
                    />
                    {!formData.country && (
                      <DisabledFieldHint message="Choose a country to specify your preferred city" />
                    )}
                  </FormField>
                </FormGrid>

                <FormField
                  label="Additional Comments"
                  helperText="Tell us about any specific preferences or requirements"
                  fieldId="demo-comments"
                >
                  <EnhancedTextarea
                    id="demo-comments"
                    placeholder="Share any additional information that might help us find the perfect match for your exchange..."
                    value={formData.comments}
                    onChange={(e) =>
                      handleInputChange("comments", e.target.value)
                    }
                    className="min-h-[100px]"
                  />
                </FormField>
              </FormSection>

              {/* Form Actions */}
              <div className={formPatterns.navigation.container}>
                <Button variant="outline">← Previous Step</Button>
                <div className={formPatterns.navigation.buttonGroup}>
                  <Button variant="outline" onClick={validateForm}>
                    Save as Draft
                  </Button>
                  <Button onClick={validateForm}>
                    Continue to Next Step →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 mb-2">
                  ✅ What's Improved
                </h4>
                <ul className="text-sm space-y-1">
                  <li>
                    • Enhanced Select components with disabled state
                    placeholders
                  </li>
                  <li>
                    • Proper error message spacing (mt-1.5) and line height
                  </li>
                  <li>• Mobile-optimized touch targets (min-h-[44px])</li>
                  <li>• Visual hints for disabled field dependencies</li>
                  <li>• Consistent form section structure</li>
                  <li>• Responsive grid layouts with proper gaps</li>
                  <li>• Helper text for user guidance</li>
                  <li>• Improved accessibility with proper labels and roles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-600 mb-2">
                  🔧 Technical Features
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• FormField wrapper component for consistency</li>
                  <li>
                    • Enhanced Input/Select/Textarea with built-in error
                    handling
                  </li>
                  <li>• Utility functions for responsive form classes</li>
                  <li>• Standardized spacing using design system</li>
                  <li>• DisabledFieldHint component with emoji icons</li>
                  <li>• FormSection for semantic grouping</li>
                  <li>• FormGrid for responsive layouts</li>
                  <li>• Mobile-first design approach</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">
                Usage in Existing Forms
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                To implement these improvements in your existing forms
                (basic-information.tsx, course-matching.tsx, etc.), replace
                standard Input/Select components with Enhanced versions and wrap
                fields in FormField components. The enhanced components handle
                error display automatically and provide better visual feedback.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
