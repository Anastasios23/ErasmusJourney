import React, { useEffect, useMemo, useState } from "react";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "@/components/ui/enhanced-select";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRightLeft,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
} from "lucide-react";
import {
  buildCourseMappingsPayload,
  COURSE_RECOGNITION_OPTIONS,
  createEmptyCourseMappingRow,
  type CourseMappingFormRow,
  toCourseMappingFormRows,
} from "@/lib/courseMatching";

interface CourseMatchingStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

function hasVisibleContent(mapping: CourseMappingFormRow) {
  return !!(
    mapping.homeCourseCode.trim() ||
    mapping.homeCourseName.trim() ||
    mapping.homeECTS.trim() ||
    mapping.hostCourseCode.trim() ||
    mapping.hostCourseName.trim() ||
    mapping.hostECTS.trim() ||
    mapping.recognitionType ||
    mapping.notes.trim()
  );
}

function getInitialMappings(input: unknown): CourseMappingFormRow[] {
  const rows = toCourseMappingFormRows(input);
  return rows.length > 0 ? rows : [createEmptyCourseMappingRow()];
}

export default function CourseMatchingStep({
  data,
  onComplete,
  onSave,
}: CourseMatchingStepProps) {
  const [mappings, setMappings] = useState<CourseMappingFormRow[]>(() =>
    getInitialMappings(data?.courses),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMappings(getInitialMappings(data?.courses));
  }, [data?.courses]);

  const sanitizedMappings = useMemo(
    () => buildCourseMappingsPayload(mappings),
    [mappings],
  );

  const calculateTotalECTS = (type: "home" | "host") => {
    return sanitizedMappings.reduce((total, mapping) => {
      const ects = type === "home" ? mapping.homeECTS : mapping.hostECTS;
      return total + (ects || 0);
    }, 0);
  };

  const syncMappings = (nextMappings: CourseMappingFormRow[]) => {
    const nextPayload = buildCourseMappingsPayload(nextMappings);

    setMappings(nextMappings);

    if (errors.general && nextPayload.length > 0) {
      const nextErrors = { ...errors };
      delete nextErrors.general;
      setErrors(nextErrors);
    }
  };

  const addMapping = () => {
    syncMappings([...mappings, createEmptyCourseMappingRow()]);
  };

  const removeMapping = (id: string) => {
    syncMappings(mappings.filter((mapping) => mapping.id !== id));
  };

  const updateMapping = <K extends keyof CourseMappingFormRow>(
    id: string,
    field: K,
    value: CourseMappingFormRow[K],
  ) => {
    const nextMappings = mappings.map((mapping) =>
      mapping.id === id ? { ...mapping, [field]: value } : mapping,
    );

    syncMappings(nextMappings);

    const errorKey = `${id}-${String(field)}`;
    if (errors[errorKey]) {
      const nextErrors = { ...errors };
      delete nextErrors[errorKey];
      setErrors(nextErrors);
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const visibleMappings = mappings.filter(hasVisibleContent);
    let isValid = true;

    if (visibleMappings.length === 0) {
      nextErrors.general =
        "Please add at least one course equivalence example.";
      isValid = false;
    }

    visibleMappings.forEach((mapping) => {
      if (!mapping.homeCourseName.trim()) {
        nextErrors[`${mapping.id}-homeCourseName`] =
          "Home course name is required";
        isValid = false;
      }

      const homeECTS = Number.parseFloat(mapping.homeECTS);
      if (!mapping.homeECTS.trim() || Number.isNaN(homeECTS) || homeECTS <= 0) {
        nextErrors[`${mapping.id}-homeECTS`] =
          "Home ECTS must be a number greater than 0";
        isValid = false;
      }

      if (!mapping.hostCourseName.trim()) {
        nextErrors[`${mapping.id}-hostCourseName`] =
          "Host course name is required";
        isValid = false;
      }

      const hostECTS = Number.parseFloat(mapping.hostECTS);
      if (!mapping.hostECTS.trim() || Number.isNaN(hostECTS) || hostECTS <= 0) {
        nextErrors[`${mapping.id}-hostECTS`] =
          "Host ECTS must be a number greater than 0";
        isValid = false;
      }

      if (!mapping.recognitionType) {
        nextErrors[`${mapping.id}-recognitionType`] =
          "Recognition type is required";
        isValid = false;
      }
    });

    setErrors(nextErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (!validate()) {
      const firstError = document.querySelector(".text-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    onComplete({ courses: buildCourseMappingsPayload(mappings) });
  };

  const handleSave = () => {
    onSave({ courses: buildCourseMappingsPayload(mappings) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-1 bg-indigo-600 rounded-full mt-1"></div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Course Exchanges / Course Matching
              </h3>
              <p className="text-sm text-gray-500">
                Add anonymous examples of how host university courses were
                recognized at your home university.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-medium">
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
            <Card
              key={mapping.id}
              className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100 rounded-t-xl flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Course Mapping #{index + 1}
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

              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 relative">
                    <div className="absolute -right-5 top-10 hidden md:flex items-center justify-center text-gray-300">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-medium text-sm text-gray-900">
                        Home University Course
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1 space-y-2">
                        <Label
                          htmlFor={`home-code-${mapping.id}`}
                          className="text-xs text-gray-500"
                        >
                          Code
                        </Label>
                        <EnhancedInput
                          id={`home-code-${mapping.id}`}
                          placeholder="CS101"
                          value={mapping.homeCourseCode}
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "homeCourseCode",
                              event.target.value,
                            )
                          }
                          className="h-9"
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label
                          htmlFor={`home-name-${mapping.id}`}
                          className="text-xs text-gray-500"
                        >
                          Course Name *
                        </Label>
                        <EnhancedInput
                          id={`home-name-${mapping.id}`}
                          placeholder="Algorithms and Data Structures"
                          value={mapping.homeCourseName}
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "homeCourseName",
                              event.target.value,
                            )
                          }
                          error={errors[`${mapping.id}-homeCourseName`]}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`home-ects-${mapping.id}`}
                        className="text-xs text-gray-500"
                      >
                        ECTS *
                      </Label>
                      <EnhancedInput
                        id={`home-ects-${mapping.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="6"
                        value={mapping.homeECTS}
                        onChange={(event) =>
                          updateMapping(
                            mapping.id,
                            "homeECTS",
                            event.target.value,
                          )
                        }
                        error={errors[`${mapping.id}-homeECTS`]}
                        className="h-9 w-28"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-teal-500" />
                      <h4 className="font-medium text-sm text-gray-900">
                        Host University Course
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1 space-y-2">
                        <Label
                          htmlFor={`host-code-${mapping.id}`}
                          className="text-xs text-gray-500"
                        >
                          Code
                        </Label>
                        <EnhancedInput
                          id={`host-code-${mapping.id}`}
                          placeholder="INF-201"
                          value={mapping.hostCourseCode}
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "hostCourseCode",
                              event.target.value,
                            )
                          }
                          className="h-9"
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label
                          htmlFor={`host-name-${mapping.id}`}
                          className="text-xs text-gray-500"
                        >
                          Course Name *
                        </Label>
                        <EnhancedInput
                          id={`host-name-${mapping.id}`}
                          placeholder="Advanced Algorithms"
                          value={mapping.hostCourseName}
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "hostCourseName",
                              event.target.value,
                            )
                          }
                          error={errors[`${mapping.id}-hostCourseName`]}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`host-ects-${mapping.id}`}
                        className="text-xs text-gray-500"
                      >
                        ECTS *
                      </Label>
                      <EnhancedInput
                        id={`host-ects-${mapping.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="6"
                        value={mapping.hostECTS}
                        onChange={(event) =>
                          updateMapping(
                            mapping.id,
                            "hostECTS",
                            event.target.value,
                          )
                        }
                        error={errors[`${mapping.id}-hostECTS`]}
                        className="h-9 w-28"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`recognition-type-${mapping.id}`}
                      className="text-xs text-gray-500"
                    >
                      Recognition Type *
                    </Label>
                    <EnhancedSelect
                      value={mapping.recognitionType || undefined}
                      onValueChange={(value) =>
                        updateMapping(
                          mapping.id,
                          "recognitionType",
                          value as CourseMappingFormRow["recognitionType"],
                        )
                      }
                    >
                      <EnhancedSelectTrigger
                        id={`recognition-type-${mapping.id}`}
                        error={errors[`${mapping.id}-recognitionType`]}
                      >
                        <EnhancedSelectValue placeholder="Select recognition type" />
                      </EnhancedSelectTrigger>
                      <EnhancedSelectContent>
                        {COURSE_RECOGNITION_OPTIONS.map((option) => (
                          <EnhancedSelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </EnhancedSelectItem>
                        ))}
                      </EnhancedSelectContent>
                    </EnhancedSelect>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`notes-${mapping.id}`}
                      className="text-xs text-gray-500"
                    >
                      Notes
                    </Label>
                    <EnhancedTextarea
                      id={`notes-${mapping.id}`}
                      placeholder="Optional context about the equivalence decision"
                      value={mapping.notes}
                      onChange={(event) =>
                        updateMapping(mapping.id, "notes", event.target.value)
                      }
                      className="min-h-[96px]"
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
            Add Another Course Mapping
          </Button>
        </div>
      </div>

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
          Continue to Accommodation
        </button>
      </div>
    </div>
  );
}
