import React, { useState, useEffect } from "react";
import { useFormContext } from "../FormProvider";

interface BasicInformationData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  homeUniversity: string;
  homeDepartment: string;
  levelOfStudy: string;
  currentYear: string;
  studentId: string;
  hostUniversity: string;
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
    homeDepartment: "",
    levelOfStudy: "",
    currentYear: "",
    studentId: "",
    hostUniversity: "",
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
    const updateData = { basicInfo: newData };
    updateFormData("basicInfo", newData);
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
    }
  };

  const handleSave = () => {
    onSave({ basicInfo: formData });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Home University
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Name
            </label>
            <input
              type="text"
              value={formData.homeUniversity}
              onChange={(e) =>
                handleInputChange("homeUniversity", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department/Faculty
            </label>
            <input
              type="text"
              value={formData.homeDepartment}
              onChange={(e) =>
                handleInputChange("homeDepartment", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level of Study
            </label>
            <select
              value={formData.levelOfStudy}
              onChange={(e) =>
                handleInputChange("levelOfStudy", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select level</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => handleInputChange("studentId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Exchange Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host University *
            </label>
            <input
              type="text"
              value={formData.hostUniversity}
              onChange={(e) =>
                handleInputChange("hostUniversity", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hostUniversity ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.hostUniversity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.hostUniversity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host Country *
            </label>
            <input
              type="text"
              value={formData.hostCountry}
              onChange={(e) => handleInputChange("hostCountry", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hostCountry ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.hostCountry && (
              <p className="text-red-500 text-sm mt-1">{errors.hostCountry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host City *
            </label>
            <input
              type="text"
              value={formData.hostCity}
              onChange={(e) => handleInputChange("hostCity", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hostCity ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.hostCity && (
              <p className="text-red-500 text-sm mt-1">{errors.hostCity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exchange Period *
            </label>
            <select
              value={formData.exchangePeriod}
              onChange={(e) =>
                handleInputChange("exchangePeriod", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.exchangePeriod ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select period</option>
              <option value="Fall Semester">Fall Semester</option>
              <option value="Spring Semester">Spring Semester</option>
              <option value="Full Academic Year">Full Academic Year</option>
              <option value="Summer Program">Summer Program</option>
            </select>
            {errors.exchangePeriod && (
              <p className="text-red-500 text-sm mt-1">
                {errors.exchangePeriod}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.exchangeStartDate}
              onChange={(e) =>
                handleInputChange("exchangeStartDate", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.exchangeEndDate}
              onChange={(e) =>
                handleInputChange("exchangeEndDate", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.exchangeEndDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.exchangeEndDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.exchangeEndDate}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Additional Information
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language of Instruction
            </label>
            <input
              type="text"
              value={formData.languageOfInstruction}
              onChange={(e) =>
                handleInputChange("languageOfInstruction", e.target.value)
              }
              placeholder="e.g., English, Spanish, French"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivation for Exchange
            </label>
            <textarea
              value={formData.motivationForExchange || ""}
              onChange={(e) =>
                handleInputChange("motivationForExchange", e.target.value)
              }
              rows={3}
              placeholder="Why did you choose this destination?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Goals
            </label>
            <textarea
              value={formData.academicGoals || ""}
              onChange={(e) =>
                handleInputChange("academicGoals", e.target.value)
              }
              rows={3}
              placeholder="What did you hope to achieve academically?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Save Draft
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue to Courses
        </button>
      </div>
    </div>
  );
}
