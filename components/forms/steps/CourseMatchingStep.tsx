import React, { useEffect, useMemo, useState } from "react";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { StepNavigation } from "../StepNavigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  buildCourseMappingsPayload,
  COURSE_RECOGNITION_OPTIONS,
  createEmptyCourseMappingRow,
  type CourseMappingFormRow,
  toCourseMappingFormRows,
} from "@/lib/courseMatching";
import {
  type ShareExperienceSaveState,
  formatValidationSummaryItem,
  scrollToFirstValidationError,
} from "@/lib/shareExperienceUi";

interface CourseMatchingStepProps {
  data: any;
  onComplete: (data: any) => void | Promise<void>;
  onSave: (data: any) => void | Promise<void>;
  onPrevious?: () => void;
  saveState?: ShareExperienceSaveState;
  onRequiredCountChange?: (count: number) => void;
}

const COURSE_FIELD_LABELS: Record<string, string> = {
  homeCourseName: "Home course name",
  homeECTS: "Home ECTS",
  hostCourseName: "Host course name",
  hostECTS: "Host ECTS",
  recognitionType: "Recognition type",
};

const COURSE_ERROR_FIELD_ORDER = [
  "homeCourseName",
  "homeECTS",
  "hostCourseName",
  "hostECTS",
  "recognitionType",
] as const;

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
  onPrevious,
  saveState = "idle",
  onRequiredCountChange,
}: CourseMatchingStepProps) {
  const [mappings, setMappings] = useState<CourseMappingFormRow[]>(() =>
    getInitialMappings(data?.courses),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedContinue, setHasAttemptedContinue] = useState(false);

  useEffect(() => {
    setMappings(getInitialMappings(data?.courses));
  }, [data?.courses]);

  const sanitizedMappings = useMemo(
    () => buildCourseMappingsPayload(mappings),
    [mappings],
  );

  const visibleMappings = useMemo(
    () => mappings.filter(hasVisibleContent),
    [mappings],
  );

  const missingRequiredCount = useMemo(() => {
    if (visibleMappings.length === 0) {
      return 1;
    }

    return visibleMappings.reduce((count, mapping) => {
      return (
        count +
        (mapping.homeCourseName.trim() ? 0 : 1) +
        (mapping.homeECTS.trim() && Number.parseFloat(mapping.homeECTS) > 0
          ? 0
          : 1) +
        (mapping.hostCourseName.trim() ? 0 : 1) +
        (mapping.hostECTS.trim() && Number.parseFloat(mapping.hostECTS) > 0
          ? 0
          : 1) +
        (mapping.recognitionType ? 0 : 1)
      );
    }, 0);
  }, [visibleMappings]);

  const validationSummary = useMemo(() => {
    if (!hasAttemptedContinue) {
      return [];
    }

    const mappingOrder = new Map(
      mappings.map((mapping, index) => [mapping.id, index + 1]),
    );

    return Object.entries(errors)
      .filter(([, message]) => Boolean(message))
      .sort(([leftKey], [rightKey]) => {
        if (leftKey === "general") {
          return -1;
        }

        if (rightKey === "general") {
          return 1;
        }

        const leftField = COURSE_ERROR_FIELD_ORDER.find((field) =>
          leftKey.endsWith(`-${field}`),
        );
        const rightField = COURSE_ERROR_FIELD_ORDER.find((field) =>
          rightKey.endsWith(`-${field}`),
        );

        const leftMappingId = leftField
          ? leftKey.slice(0, leftKey.length - leftField.length - 1)
          : leftKey;
        const rightMappingId = rightField
          ? rightKey.slice(0, rightKey.length - rightField.length - 1)
          : rightKey;

        const leftIndex = mappingOrder.get(leftMappingId) ?? Number.MAX_SAFE_INTEGER;
        const rightIndex =
          mappingOrder.get(rightMappingId) ?? Number.MAX_SAFE_INTEGER;

        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }

        return (
          COURSE_ERROR_FIELD_ORDER.indexOf(leftField || "homeCourseName") -
          COURSE_ERROR_FIELD_ORDER.indexOf(rightField || "homeCourseName")
        );
      })
      .map(([key, message]) => {
        if (key === "general") {
          return message;
        }

        const fieldKey = COURSE_ERROR_FIELD_ORDER.find((field) =>
          key.endsWith(`-${field}`),
        );

        if (!fieldKey) {
          return message;
        }

        const mappingId = key.slice(0, key.length - fieldKey.length - 1);
        const mappingIndex = mappingOrder.get(mappingId);

        return formatValidationSummaryItem(
          mappingIndex ? `Mapping ${mappingIndex}` : COURSE_FIELD_LABELS[fieldKey],
          message,
        );
      });
  }, [errors, hasAttemptedContinue, mappings]);

  useEffect(() => {
    onRequiredCountChange?.(missingRequiredCount);
  }, [missingRequiredCount, onRequiredCountChange]);

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
      nextErrors.general = "Add at least one course match to continue.";
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
    setHasAttemptedContinue(true);

    if (!validate()) {
      scrollToFirstValidationError();
      return;
    }

    setHasAttemptedContinue(false);
    void onComplete({ courses: buildCourseMappingsPayload(mappings) });
  };

  const handleSave = () => {
    void onSave({ courses: buildCourseMappingsPayload(mappings) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Course matches</h3>
        <p className="mt-1 text-sm text-gray-600">
          Add at least one example of how a host course was recognized at your
          home university.
        </p>

        {errors.general && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {mappings.map((mapping, index) => (
            <Card key={mapping.id} className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Course match {index + 1}
                  </h4>
                  {mappings.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMapping(mapping.id)}
                      className="h-7 px-2 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-900">Home course</h5>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`home-name-${mapping.id}`}
                        className="text-xs font-medium text-gray-600"
                      >
                        Home course name *
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

                    <div className="space-y-2">
                      <Label
                        htmlFor={`home-ects-${mapping.id}`}
                        className="text-xs font-medium text-gray-600"
                      >
                        Home ECTS *
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
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`home-code-${mapping.id}`}
                        className="text-xs text-gray-500"
                      >
                        Course code (optional)
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
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-900">Host course</h5>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`host-name-${mapping.id}`}
                        className="text-xs font-medium text-gray-600"
                      >
                        Host course name *
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

                    <div className="space-y-2">
                      <Label
                        htmlFor={`host-ects-${mapping.id}`}
                        className="text-xs font-medium text-gray-600"
                      >
                        Host ECTS *
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
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2">
                        <Label
                          htmlFor={`host-code-${mapping.id}`}
                          className="text-xs text-gray-500"
                        >
                          Course code (optional)
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
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`recognition-type-${mapping.id}`}
                      className="text-xs font-medium text-gray-600"
                    >
                      Recognition type *
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
                    <p className="text-xs text-gray-500">
                      How was this course recognized at your home university?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`notes-${mapping.id}`}
                      className="text-xs text-gray-500"
                    >
                      Notes (optional)
                    </Label>
                    <EnhancedTextarea
                      id={`notes-${mapping.id}`}
                      placeholder="Optional context about the equivalence decision"
                      value={mapping.notes}
                      onChange={(event) =>
                        updateMapping(mapping.id, "notes", event.target.value)
                      }
                      className="min-h-[88px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={addMapping}
            variant="outline"
            className="w-full justify-center py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add another course match
          </Button>
        </div>
      </div>

      <StepNavigation
        currentStep={2}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onNext={handleContinue}
        isLastStep={false}
        showPrevious={Boolean(onPrevious)}
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
