import React, { useState, useEffect } from "react";
import { useFormContext } from "../FormProvider";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "@/components/ui/enhanced-select";
import { UniversitySearch } from "@/components/UniversitySearch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";

interface BasicInformationData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  homeUniversity: string;
  homeUniversityId?: string;
  homeDepartment: string;
  levelOfStudy: string;
  currentYear: string;
  studentId: string;
  hostUniversity: string;
  hostUniversityId?: string;
  hostCountry: string;
  hostCity: string;
  hostDepartment: string;
  exchangePeriod: string;
  exchangeStartDate: string;
  exchangeEndDate: string;
  languageOfInstruction: string;
  languageProficiencyLevel?: string;
  motivationForExchange?: string;
  academicGoals?: string;
}

interface BasicInformationStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

export default function BasicInformationStep({
  data,
  onComplete,
  onSave,
}: BasicInformationStepProps) {
  const { updateFormData } = useFormContext();
  const [formData, setFormData] = useState<BasicInformationData>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    homeUniversity: "",
    homeUniversityId: "",
    homeDepartment: "",
    levelOfStudy: "",
    currentYear: "",
    studentId: "",
    hostUniversity: "",
    hostUniversityId: "",
    hostCountry: "",
    hostCity: "",
    hostDepartment: "",
    exchangePeriod: "",
    exchangeStartDate: "",
    exchangeEndDate: "",
    languageOfInstruction: "",
    languageProficiencyLevel: "",
    motivationForExchange: "",
    academicGoals: "",
    ...data?.basicInfo,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.basicInfo) {
      setFormData((prev) => ({ ...prev, ...data.basicInfo }));
    }
  }, [data]);

  const handleInputChange = (
    field: keyof BasicInformationData,
    value: string,
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-save on change
    updateFormData("basicInfo", newData);
  };

  const handleUniversitySelect = (
    type: "home" | "host",
    id: string,
    name: string,
  ) => {
    const fieldName = type === "home" ? "homeUniversity" : "hostUniversity";
    const idFieldName =
      type === "home" ? "homeUniversityId" : "hostUniversityId";

    const newData = {
      ...formData,
      [fieldName]: name,
      [idFieldName]: id,
    };
    setFormData(newData);
    updateFormData("basicInfo", newData);

    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "hostUniversity",
      "hostCountry",
      "hostCity",
      "exchangePeriod",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof BasicInformationData]?.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Date validation
    if (formData.exchangeStartDate && formData.exchangeEndDate) {
      if (
        new Date(formData.exchangeStartDate) >=
        new Date(formData.exchangeEndDate)
      ) {
        newErrors.exchangeEndDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onComplete({ basicInfo: formData });
    } else {
      // Scroll to top error
      const firstError = document.querySelector(".text-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSave = () => {
    onSave({ basicInfo: formData });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Personal Information Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">
            Personal Information
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <EnhancedInput
              id="firstName"
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              error={errors.firstName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <EnhancedInput
              id="lastName"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              error={errors.lastName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <EnhancedInput
              id="email"
              type="email"
              placeholder="john.doe@university.edu"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
              required
              helperText="We'll use this to contact you about your submission."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <EnhancedInput
              id="nationality"
              placeholder="e.g. Cypriot"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Home University Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">
            Home University
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <UniversitySearch
              label="University Name"
              value={formData.homeUniversity}
              onSelect={(id, name) => handleUniversitySelect("home", id, name)}
              placeholder="Search for your home university..."
              type="cyprus" // Assuming users are from Cyprus as per prompt
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeDepartment">Department/Faculty</Label>
            <EnhancedInput
              id="homeDepartment"
              placeholder="e.g. Computer Science"
              value={formData.homeDepartment}
              onChange={(e) => handleInputChange("homeDepartment", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Level of Study</Label>
            <EnhancedSelect
              value={formData.levelOfStudy}
              onValueChange={(value) => handleInputChange("levelOfStudy", value)}
            >
              <EnhancedSelectTrigger>
                <EnhancedSelectValue placeholder="Select level" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                <EnhancedSelectItem value="Bachelor">Bachelor</EnhancedSelectItem>
                <EnhancedSelectItem value="Master">Master</EnhancedSelectItem>
                <EnhancedSelectItem value="PhD">PhD</EnhancedSelectItem>
              </EnhancedSelectContent>
            </EnhancedSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <EnhancedInput
              id="studentId"
              placeholder="Optional"
              value={formData.studentId}
              onChange={(e) => handleInputChange("studentId", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Exchange Details Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-teal-600 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">
            Exchange Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <UniversitySearch
              label="Host University"
              value={formData.hostUniversity}
              onSelect={(id, name) => handleUniversitySelect("host", id, name)}
              placeholder="Search for your host university..."
              required
              error={errors.hostUniversity}
              type="international"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostCountry">Host Country</Label>
            <EnhancedInput
              id="hostCountry"
              value={formData.hostCountry}
              onChange={(e) => handleInputChange("hostCountry", e.target.value)}
              error={errors.hostCountry}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostCity">Host City</Label>
            <EnhancedInput
              id="hostCity"
              value={formData.hostCity}
              onChange={(e) => handleInputChange("hostCity", e.target.value)}
              error={errors.hostCity}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Exchange Period *</Label>
            <EnhancedSelect
              value={formData.exchangePeriod}
              onValueChange={(value) => handleInputChange("exchangePeriod", value)}
            >
              <EnhancedSelectTrigger error={errors.exchangePeriod}>
                <EnhancedSelectValue placeholder="Select period" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                <EnhancedSelectItem value="Fall Semester">Fall Semester</EnhancedSelectItem>
                <EnhancedSelectItem value="Spring Semester">Spring Semester</EnhancedSelectItem>
                <EnhancedSelectItem value="Full Academic Year">Full Academic Year</EnhancedSelectItem>
                <EnhancedSelectItem value="Summer Program">Summer Program</EnhancedSelectItem>
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.exchangePeriod && (
              <p className="text-sm text-red-500 mt-1">{errors.exchangePeriod}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeStartDate">Start Date</Label>
            <EnhancedInput
              id="exchangeStartDate"
              type="date"
              value={formData.exchangeStartDate}
              onChange={(e) => handleInputChange("exchangeStartDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeEndDate">End Date</Label>
            <EnhancedInput
              id="exchangeEndDate"
              type="date"
              value={formData.exchangeEndDate}
              onChange={(e) => handleInputChange("exchangeEndDate", e.target.value)}
              error={errors.exchangeEndDate}
            />
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">
            Additional Information
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="languageOfInstruction">Language of Instruction</Label>
            <EnhancedInput
              id="languageOfInstruction"
              placeholder="e.g., English, Spanish, French"
              value={formData.languageOfInstruction}
              onChange={(e) => handleInputChange("languageOfInstruction", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivationForExchange">Motivation for Exchange</Label>
            <EnhancedTextarea
              id="motivationForExchange"
              placeholder="Why did you choose this destination? What were your expectations?"
              value={formData.motivationForExchange || ""}
              onChange={(e) => handleInputChange("motivationForExchange", e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicGoals">Academic Goals</Label>
            <EnhancedTextarea
              id="academicGoals"
              placeholder="What did you hope to achieve academically?"
              value={formData.academicGoals || ""}
              onChange={(e) => handleInputChange("academicGoals", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Save Draft
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue to Courses
        </button>
      </div>
    </div>
  );
}
