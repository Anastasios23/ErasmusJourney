import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { StepNavigation } from "../StepNavigation";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "@/components/ui/enhanced-select";
import { Label } from "@/components/ui/label";
import { getCyprusUniversityByEmail } from "../../../lib/authUtils";
import {
  BASIC_INFORMATION_REQUIRED_FIELDS,
  BASIC_INFO_LEVEL_OPTIONS,
  BASIC_INFO_PERIOD_OPTIONS,
  type BasicInformationData,
  sanitizeBasicInformationData,
} from "@/lib/basicInformation";
import {
  createHostUniversityOptionValue,
  getFallbackHomeDepartments,
  getFallbackHostUniversityOptions,
  mergeHostUniversityOptions,
  type HostUniversityOption,
} from "@/lib/basicInformationOptions";
import { CYPRUS_UNIVERSITIES } from "@/data/universityAgreements";
import { normalizeDepartmentList } from "@/lib/departmentNormalization";
import {
  type ShareExperienceSaveState,
  formatValidationSummaryItem,
  scrollToFirstValidationError,
} from "@/lib/shareExperienceUi";

interface BasicInformationStepProps {
  data: any;
  onComplete: (data: any) => void | Promise<void>;
  onSave: (data: any) => void | Promise<void>;
  onPrevious?: () => void;
  saveState?: ShareExperienceSaveState;
  onRequiredCountChange?: (count: number) => void;
}

const BASIC_INFO_FIELD_LABELS: Record<string, string> = {
  homeUniversity: "Home university",
  homeDepartment: "Home department",
  levelOfStudy: "Level of study",
  hostUniversity: "Host university",
  exchangeAcademicYear: "Exchange academic year",
  exchangePeriod: "Exchange period",
  exchangeEndDate: "Exchange end date",
};

function createSelectedHostOption(
  formData: BasicInformationData,
): HostUniversityOption | null {
  if (!formData.hostUniversity) {
    return null;
  }

  return {
    value: createHostUniversityOptionValue({
      hostUniversity: formData.hostUniversity,
      hostCity: formData.hostCity,
      hostCountry: formData.hostCountry,
      hostUniversityId: formData.hostUniversityId || undefined,
    }),
    label:
      formData.hostCity && formData.hostCountry
        ? `${formData.hostUniversity} (${formData.hostCity}, ${formData.hostCountry})`
        : formData.hostUniversity,
    hostUniversity: formData.hostUniversity,
    hostCity: formData.hostCity,
    hostCountry: formData.hostCountry,
    hostUniversityId: formData.hostUniversityId || undefined,
  };
}

export default function BasicInformationStep({
  data,
  onComplete,
  onSave,
  onPrevious,
  saveState = "idle",
  onRequiredCountChange,
}: BasicInformationStepProps) {
  const { data: session } = useSession();
  const derivedHomeUniversity = useMemo(
    () => getCyprusUniversityByEmail(session?.user?.email),
    [session?.user?.email],
  );
  const isHomeUniversityLocked = Boolean(derivedHomeUniversity?.code);
  const homeUniversityOptions = useMemo(
    () =>
      [...CYPRUS_UNIVERSITIES]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((university) => ({
          code: university.code,
          label: `${university.name} (${university.code})`,
          name: university.name,
        })),
    [],
  );

  const [formData, setFormData] = useState<BasicInformationData>(() =>
    sanitizeBasicInformationData(data?.basicInfo),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedContinue, setHasAttemptedContinue] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [hostUniversityOptions, setHostUniversityOptions] = useState<
    HostUniversityOption[]
  >([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [hostOptionsLoading, setHostOptionsLoading] = useState(false);

  const selectedHomeUniversityCode = useMemo(() => {
    if (derivedHomeUniversity?.code) {
      return derivedHomeUniversity.code;
    }

    if (formData.homeUniversityCode) {
      return formData.homeUniversityCode;
    }

    const matched = CYPRUS_UNIVERSITIES.find(
      (university) =>
        university.name.toLowerCase() === formData.homeUniversity.toLowerCase(),
    );

    return matched?.code || "";
  }, [
    derivedHomeUniversity?.code,
    formData.homeUniversity,
    formData.homeUniversityCode,
  ]);

  useEffect(() => {
    setFormData(sanitizeBasicInformationData(data?.basicInfo));
  }, [data?.basicInfo]);

  useEffect(() => {
    if (!derivedHomeUniversity?.name || !derivedHomeUniversity.code) {
      return;
    }

    setFormData((current) => {
      if (
        current.homeUniversity === derivedHomeUniversity.name &&
        current.homeUniversityCode === derivedHomeUniversity.code
      ) {
        return current;
      }

      return sanitizeBasicInformationData({
        ...current,
        homeUniversity: derivedHomeUniversity.name,
        homeUniversityCode: derivedHomeUniversity.code,
      });
    });
  }, [derivedHomeUniversity?.code, derivedHomeUniversity?.name]);

  useEffect(() => {
    if (!selectedHomeUniversityCode) {
      setDepartmentOptions([]);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const fallbackDepartments = getFallbackHomeDepartments(
      selectedHomeUniversityCode,
    );

    setDepartmentOptions(fallbackDepartments);
    setDepartmentsLoading(true);

    fetch(
      `/api/universities/${encodeURIComponent(selectedHomeUniversityCode)}/departments`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load departments");
        }

        return response.json();
      })
      .then((payload) => {
        if (!isActive) {
          return;
        }

        const mergedDepartments = normalizeDepartmentList([
          ...fallbackDepartments,
          ...(payload.departments || []),
        ]);

        setDepartmentOptions(mergedDepartments);
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Error loading home departments:", error);
      })
      .finally(() => {
        if (isActive) {
          setDepartmentsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [selectedHomeUniversityCode]);

  useEffect(() => {
    const selectedHost = createSelectedHostOption(formData);

    if (
      !selectedHomeUniversityCode ||
      !formData.homeDepartment ||
      !formData.levelOfStudy
    ) {
      setHostUniversityOptions(selectedHost ? [selectedHost] : []);
      setHostOptionsLoading(false);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const fallbackOptions = getFallbackHostUniversityOptions({
      homeUniversityCode: selectedHomeUniversityCode,
      homeDepartment: formData.homeDepartment,
      levelOfStudy: formData.levelOfStudy,
    });

    setHostUniversityOptions(
      mergeHostUniversityOptions(
        fallbackOptions,
        selectedHost ? [selectedHost] : [],
      ),
    );
    setHostOptionsLoading(true);

    const params = new URLSearchParams({
      homeUniversityCode: selectedHomeUniversityCode,
      department: formData.homeDepartment,
      level: formData.levelOfStudy.toLowerCase(),
    });

    fetch(`/api/agreements?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load agreements");
        }

        return response.json();
      })
      .then((payload) => {
        if (!isActive) {
          return;
        }

        const apiOptions = (payload.agreements || []).map((agreement: any) => ({
          value: createHostUniversityOptionValue({
            hostUniversity: agreement.partnerUniversity?.name || "",
            hostCity:
              agreement.partnerUniversity?.city || agreement.partnerCity || "",
            hostCountry:
              agreement.partnerUniversity?.country ||
              agreement.partnerCountry ||
              "",
            hostUniversityId: agreement.partnerUniversity?.id,
          }),
          label: `${agreement.partnerUniversity?.name || "Partner University"} (${
            agreement.partnerUniversity?.city ||
            agreement.partnerCity ||
            "Unknown City"
          }, ${
            agreement.partnerUniversity?.country ||
            agreement.partnerCountry ||
            "Unknown Country"
          })`,
          hostUniversity: agreement.partnerUniversity?.name || "",
          hostCity:
            agreement.partnerUniversity?.city || agreement.partnerCity || "",
          hostCountry:
            agreement.partnerUniversity?.country ||
            agreement.partnerCountry ||
            "",
          hostUniversityId: agreement.partnerUniversity?.id,
        }));

        setHostUniversityOptions(
          mergeHostUniversityOptions(
            apiOptions,
            fallbackOptions,
            selectedHost ? [selectedHost] : [],
          ),
        );
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Error loading host universities:", error);
      })
      .finally(() => {
        if (isActive) {
          setHostOptionsLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    selectedHomeUniversityCode,
    formData.homeDepartment,
    formData.levelOfStudy,
  ]);

  const selectedHostOption = useMemo(() => {
    return hostUniversityOptions.find((option) => {
      if (option.hostUniversityId && formData.hostUniversityId) {
        return option.hostUniversityId === formData.hostUniversityId;
      }

      return (
        option.hostUniversity === formData.hostUniversity &&
        option.hostCity === formData.hostCity &&
        option.hostCountry === formData.hostCountry
      );
    });
  }, [
    formData.hostCity,
    formData.hostCountry,
    formData.hostUniversity,
    formData.hostUniversityId,
    hostUniversityOptions,
  ]);

  const cleanedFormData = useMemo(
    () =>
      sanitizeBasicInformationData({
        ...formData,
        homeUniversity: isHomeUniversityLocked
          ? derivedHomeUniversity?.name || formData.homeUniversity
          : formData.homeUniversity,
        homeUniversityCode: isHomeUniversityLocked
          ? derivedHomeUniversity?.code || formData.homeUniversityCode
          : formData.homeUniversityCode,
      }),
    [
      derivedHomeUniversity?.code,
      derivedHomeUniversity?.name,
      formData,
      isHomeUniversityLocked,
    ],
  );

  const missingRequiredCount = useMemo(
    () =>
      BASIC_INFORMATION_REQUIRED_FIELDS.filter(
        (field) => !cleanedFormData[field],
      ).length,
    [cleanedFormData],
  );

  const validationSummary = useMemo(() => {
    if (!hasAttemptedContinue) {
      return [];
    }

    return [
      "homeUniversity",
      "homeDepartment",
      "levelOfStudy",
      "hostUniversity",
      "exchangeAcademicYear",
      "exchangePeriod",
      "exchangeEndDate",
    ]
      .filter((field) => errors[field])
      .map((field) =>
        formatValidationSummaryItem(
          BASIC_INFO_FIELD_LABELS[field] || field,
          errors[field],
        ),
      );
  }, [errors, hasAttemptedContinue]);

  useEffect(() => {
    onRequiredCountChange?.(missingRequiredCount);
  }, [missingRequiredCount, onRequiredCountChange]);

  const persistBasicInfo = (nextData: BasicInformationData) => {
    setFormData(nextData);
  };

  const handleInputChange = (
    field: keyof BasicInformationData,
    value: string,
  ) => {
    const shouldResetHost =
      field === "homeDepartment" || field === "levelOfStudy";

    const nextData = sanitizeBasicInformationData({
      ...formData,
      homeUniversity: isHomeUniversityLocked
        ? derivedHomeUniversity?.name || formData.homeUniversity
        : formData.homeUniversity,
      homeUniversityCode: isHomeUniversityLocked
        ? derivedHomeUniversity?.code || formData.homeUniversityCode
        : formData.homeUniversityCode,
      [field]: value,
      ...(shouldResetHost
        ? {
            hostUniversity: "",
            hostUniversityId: "",
            hostCity: "",
            hostCountry: "",
          }
        : {}),
    });

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }

    if (shouldResetHost && errors.hostUniversity) {
      setErrors((current) => ({ ...current, hostUniversity: "" }));
    }

    persistBasicInfo(nextData);
  };

  const handleHostUniversityChange = (value: string) => {
    const selectedOption = hostUniversityOptions.find(
      (option) => option.value === value,
    );

    if (!selectedOption) {
      return;
    }

    const nextData = sanitizeBasicInformationData({
      ...formData,
      homeUniversity: isHomeUniversityLocked
        ? derivedHomeUniversity?.name || formData.homeUniversity
        : formData.homeUniversity,
      homeUniversityCode: isHomeUniversityLocked
        ? derivedHomeUniversity?.code || formData.homeUniversityCode
        : formData.homeUniversityCode,
      hostUniversity: selectedOption.hostUniversity,
      hostUniversityId: selectedOption.hostUniversityId || "",
      hostCity: selectedOption.hostCity,
      hostCountry: selectedOption.hostCountry,
    });

    if (errors.hostUniversity) {
      setErrors((current) => ({ ...current, hostUniversity: "" }));
    }

    persistBasicInfo(nextData);
  };

  const validateForm = (
    candidate: BasicInformationData = formData,
  ): boolean => {
    const newErrors: Record<string, string> = {};

    if (!candidate.homeUniversity) {
      newErrors.homeUniversity = isHomeUniversityLocked
        ? "We could not derive your home university from your signed-in email."
        : "Home university is required.";
    }

    if (!candidate.homeDepartment) {
      newErrors.homeDepartment = "Home department is required";
    }

    if (!candidate.levelOfStudy) {
      newErrors.levelOfStudy = "Level of study is required";
    }

    if (!candidate.hostUniversity) {
      newErrors.hostUniversity = "Host university is required";
    }

    if (!candidate.exchangeAcademicYear) {
      newErrors.exchangeAcademicYear = "Exchange academic year is required";
    }

    if (!candidate.exchangePeriod) {
      newErrors.exchangePeriod = "Exchange period is required";
    }

    if (candidate.exchangeStartDate && candidate.exchangeEndDate) {
      if (
        new Date(candidate.exchangeStartDate) >=
        new Date(candidate.exchangeEndDate)
      ) {
        newErrors.exchangeEndDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    setHasAttemptedContinue(true);
    setFormData(cleanedFormData);

    if (validateForm(cleanedFormData)) {
      setHasAttemptedContinue(false);
      void onComplete({ basicInfo: cleanedFormData });
    } else {
      scrollToFirstValidationError();
    }
  };

  const handleSave = () => {
    setFormData(cleanedFormData);
    void onSave({ basicInfo: cleanedFormData });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <p className="text-sm text-gray-600">
        Use this step to confirm your home university, host university, and
        exchange period.
      </p>

      {hasAttemptedContinue && validationSummary.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please complete {validationSummary.length} required{" "}
          {validationSummary.length === 1 ? "field" : "fields"}.
        </div>
      ) : null}

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Erasmus setup
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="homeUniversity">Home University</Label>
            {isHomeUniversityLocked ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {derivedHomeUniversity?.name || formData.homeUniversity}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Locked from your university email
                </p>
              </div>
            ) : (
              <EnhancedSelect
                value={selectedHomeUniversityCode}
                onValueChange={(value) => {
                  const selectedUniversity = homeUniversityOptions.find(
                    (university) => university.code === value,
                  );

                  if (!selectedUniversity) {
                    return;
                  }

                  const nextData = sanitizeBasicInformationData({
                    ...formData,
                    homeUniversity: selectedUniversity.name,
                    homeUniversityCode: selectedUniversity.code,
                    homeDepartment: "",
                    hostUniversity: "",
                    hostUniversityId: "",
                    hostCity: "",
                    hostCountry: "",
                  });

                  if (
                    errors.homeUniversity ||
                    errors.homeDepartment ||
                    errors.hostUniversity
                  ) {
                    setErrors((current) => ({
                      ...current,
                      homeUniversity: "",
                      homeDepartment: "",
                      hostUniversity: "",
                    }));
                  }

                  persistBasicInfo(nextData);
                }}
              >
                <EnhancedSelectTrigger error={errors.homeUniversity}>
                  <EnhancedSelectValue placeholder="Select your home university" />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  {homeUniversityOptions.map((university) => (
                    <EnhancedSelectItem
                      key={university.code}
                      value={university.code}
                    >
                      {university.label}
                    </EnhancedSelectItem>
                  ))}
                </EnhancedSelectContent>
              </EnhancedSelect>
            )}
            {errors.homeUniversity ? (
              <p className="text-sm text-red-600">{errors.homeUniversity}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeDepartment">Home Department *</Label>
            {departmentsLoading ? (
              <p className="text-sm text-gray-500">Loading departments</p>
            ) : null}
            {departmentOptions.length > 0 ? (
              <EnhancedSelect
                value={formData.homeDepartment}
                onValueChange={(value) =>
                  handleInputChange("homeDepartment", value)
                }
              >
                <EnhancedSelectTrigger error={errors.homeDepartment}>
                  <EnhancedSelectValue placeholder="Select your department" />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  {departmentOptions.map((department) => (
                    <EnhancedSelectItem key={department} value={department}>
                      {department}
                    </EnhancedSelectItem>
                  ))}
                </EnhancedSelectContent>
              </EnhancedSelect>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  Department not listed? Enter it manually
                </p>
                <EnhancedInput
                  id="homeDepartment"
                  placeholder="e.g. Computer Science"
                  value={formData.homeDepartment}
                  onChange={(event) =>
                    handleInputChange("homeDepartment", event.target.value)
                  }
                  error={errors.homeDepartment}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Level of Study *</Label>
            <EnhancedSelect
              value={formData.levelOfStudy}
              onValueChange={(value) =>
                handleInputChange("levelOfStudy", value)
              }
            >
              <EnhancedSelectTrigger error={errors.levelOfStudy}>
                <EnhancedSelectValue placeholder="Select level of study" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {BASIC_INFO_LEVEL_OPTIONS.map((level) => (
                  <EnhancedSelectItem key={level} value={level}>
                    {level}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Host University *</Label>
            <EnhancedSelect
              value={selectedHostOption?.value || ""}
              onValueChange={handleHostUniversityChange}
              disabled={
                !formData.homeDepartment ||
                !formData.levelOfStudy ||
                hostUniversityOptions.length === 0
              }
            >
              <EnhancedSelectTrigger error={errors.hostUniversity}>
                <EnhancedSelectValue
                  placeholder={
                    !formData.homeDepartment || !formData.levelOfStudy
                      ? "Select your host university"
                      : hostOptionsLoading
                        ? "Loading eligible host universities"
                        : hostUniversityOptions.length === 0
                          ? "No partner universities found for this combination"
                          : "Select your host university"
                  }
                />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {hostUniversityOptions.map((option) => (
                  <EnhancedSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>

            {!formData.homeDepartment || !formData.levelOfStudy ? (
              <p className="text-xs text-gray-500">
                Select your department and study level first
              </p>
            ) : hostOptionsLoading ? (
              <p className="text-xs text-gray-500">
                Loading eligible host universities
              </p>
            ) : hostUniversityOptions.length === 0 ? (
              <p className="text-xs text-gray-500">
                No partner universities found for this combination
              </p>
            ) : null}

            {formData.hostUniversity &&
            (formData.hostCity || formData.hostCountry) ? (
              <p className="text-sm text-gray-600">
                City: {formData.hostCity || "-"} | Country:{" "}
                {formData.hostCountry || "-"}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Exchange details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="exchangeAcademicYear">
              Exchange Academic Year *
            </Label>
            <EnhancedInput
              id="exchangeAcademicYear"
              placeholder="e.g. 2026/2027"
              value={formData.exchangeAcademicYear}
              onChange={(event) =>
                handleInputChange("exchangeAcademicYear", event.target.value)
              }
              error={errors.exchangeAcademicYear}
              helperText="Use format: 2026/2027"
            />
          </div>

          <div className="space-y-2">
            <Label>Exchange Period *</Label>
            <EnhancedSelect
              value={formData.exchangePeriod}
              onValueChange={(value) =>
                handleInputChange("exchangePeriod", value)
              }
            >
              <EnhancedSelectTrigger error={errors.exchangePeriod}>
                <EnhancedSelectValue placeholder="Select exchange period" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {BASIC_INFO_PERIOD_OPTIONS.map((period) => (
                  <EnhancedSelectItem key={period} value={period}>
                    {period}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languageOfInstruction">
              Language of Instruction (optional)
            </Label>
            <EnhancedInput
              id="languageOfInstruction"
              placeholder="e.g. English"
              value={formData.languageOfInstruction}
              onChange={(event) =>
                handleInputChange("languageOfInstruction", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeStartDate">Exchange Start Date</Label>
            <EnhancedInput
              id="exchangeStartDate"
              type="date"
              value={formData.exchangeStartDate}
              onChange={(event) =>
                handleInputChange("exchangeStartDate", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeEndDate">Exchange End Date</Label>
            <EnhancedInput
              id="exchangeEndDate"
              type="date"
              value={formData.exchangeEndDate}
              onChange={(event) =>
                handleInputChange("exchangeEndDate", event.target.value)
              }
              error={errors.exchangeEndDate}
            />
          </div>
        </div>
      </section>

      <StepNavigation
        currentStep={1}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onNext={handleContinue}
        isLastStep={false}
        showPrevious={false}
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
