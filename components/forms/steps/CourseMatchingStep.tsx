import React, { useState, useEffect } from "react";
import { useFormContext } from "../FormProvider";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, BookOpen, GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CourseMapping {
  id: string;
  homeCourseCode: string;
  homeCourseName: string;
  homeCredits: string;
  hostCourseCode: string;
  hostCourseName: string;
  hostCredits: string;
}

interface CourseMatchingStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

export default function CourseMatchingStep({
  data,
  onComplete,
  onSave,
}: CourseMatchingStepProps) {
  const { updateFormData } = useFormContext();
  const [mappings, setMappings] = useState<CourseMapping[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.courses && Array.isArray(data.courses)) {
      setMappings(data.courses);
    } else if (mappings.length === 0) {
      // Start with one empty mapping if none exist
      addMapping();
    }
  }, [data]);

  const addMapping = () => {
    const newMapping: CourseMapping = {
      id: crypto.randomUUID(),
      homeCourseCode: "",
      homeCourseName: "",
      homeCredits: "",
      hostCourseCode: "",
      hostCourseName: "",
      hostCredits: "",
    };
    setMappings([...mappings, newMapping]);
  };

  const removeMapping = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id));
  };

  const updateMapping = (id: string, field: keyof CourseMapping, value: string) => {
    const newMappings = mappings.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setMappings(newMappings);
    updateFormData("courses", newMappings);
    
    // Clear error for this field if it exists
    if (errors[`${id}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${id}-${field}`];
      setErrors(newErrors);
    }
  };

  const calculateTotalECTS = (type: "home" | "host") => {
    return mappings.reduce((total, m) => {
      const credits = parseFloat(type === "home" ? m.homeCredits : m.hostCredits) || 0;
      return total + credits;
    }, 0);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (mappings.length === 0) {
      newErrors["general"] = "Please add at least one course mapping.";
      isValid = false;
    }

    mappings.forEach((m) => {
      // If a mapping exists, these fields are mandatory
      if (!m.homeCourseName.trim()) {
        newErrors[`${m.id}-homeCourseName`] = "Required";
        isValid = false;
      }
      if (!m.homeCredits.trim() || isNaN(parseFloat(m.homeCredits))) {
        newErrors[`${m.id}-homeCredits`] = "Required (number)";
        isValid = false;
      }
      if (!m.hostCourseName.trim()) {
        newErrors[`${m.id}-hostCourseName`] = "Required";
        isValid = false;
      }
      if (!m.hostCredits.trim() || isNaN(parseFloat(m.hostCredits))) {
        newErrors[`${m.id}-hostCredits`] = "Required (number)";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({ courses: mappings });
    } else {
      // Scroll to first error
      const firstError = document.querySelector(".text-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Course Matching
              </h3>
              <p className="text-sm text-gray-500">
                List the courses you took abroad and their equivalents at your home university.
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              Home ECTS: {calculateTotalECTS("home")}
            </div>
            <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
              Host ECTS: {calculateTotalECTS("host")}
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          {mappings.map((mapping, index) => (
            <Card key={mapping.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100 rounded-t-xl flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Course Pair #{index + 1}
                </CardTitle>
                {mappings.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMapping(mapping.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Home University Course */}
                <div className="space-y-4 relative">
                  <div className="absolute -right-4 top-1/2 hidden md:block text-gray-300">
                    →
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-medium text-sm text-gray-900">Home University Course</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor={`home-code-${mapping.id}`} className="text-xs text-gray-500">Code</Label>
                      <EnhancedInput
                        id={`home-code-${mapping.id}`}
                        placeholder="CS101"
                        value={mapping.homeCourseCode}
                        onChange={(e) => updateMapping(mapping.id, "homeCourseCode", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`home-name-${mapping.id}`} className="text-xs text-gray-500">Course Name *</Label>
                      <EnhancedInput
                        id={`home-name-${mapping.id}`}
                        placeholder="Intro to Programming"
                        value={mapping.homeCourseName}
                        onChange={(e) => updateMapping(mapping.id, "homeCourseName", e.target.value)}
                        error={errors[`${mapping.id}-homeCourseName`]}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`home-credits-${mapping.id}`} className="text-xs text-gray-500">ECTS Credits *</Label>
                    <EnhancedInput
                      id={`home-credits-${mapping.id}`}
                      type="number"
                      placeholder="6"
                      value={mapping.homeCredits}
                      onChange={(e) => updateMapping(mapping.id, "homeCredits", e.target.value)}
                      error={errors[`${mapping.id}-homeCredits`]}
                      className="h-9 w-24"
                    />
                  </div>
                </div>

                {/* Host University Course */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-teal-500" />
                    <h4 className="font-medium text-sm text-gray-900">Host University Course</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor={`host-code-${mapping.id}`} className="text-xs text-gray-500">Code</Label>
                      <EnhancedInput
                        id={`host-code-${mapping.id}`}
                        placeholder="INF-100"
                        value={mapping.hostCourseCode}
                        onChange={(e) => updateMapping(mapping.id, "hostCourseCode", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`host-name-${mapping.id}`} className="text-xs text-gray-500">Course Name *</Label>
                      <EnhancedInput
                        id={`host-name-${mapping.id}`}
                        placeholder="Computer Science I"
                        value={mapping.hostCourseName}
                        onChange={(e) => updateMapping(mapping.id, "hostCourseName", e.target.value)}
                        error={errors[`${mapping.id}-hostCourseName`]}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`host-credits-${mapping.id}`} className="text-xs text-gray-500">ECTS Credits *</Label>
                    <EnhancedInput
                      id={`host-credits-${mapping.id}`}
                      type="number"
                      placeholder="6"
                      value={mapping.hostCredits}
                      onChange={(e) => updateMapping(mapping.id, "hostCredits", e.target.value)}
                      error={errors[`${mapping.id}-hostCredits`]}
                      className="h-9 w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={addMapping}
            variant="outline"
            className="w-full border-dashed border-2 py-8 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Course Pair
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={() => onSave({ courses: mappings })}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Save Draft
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue to Accommodation
        </button>
      </div>
    </div>
  );
}
