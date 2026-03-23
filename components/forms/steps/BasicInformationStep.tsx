import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useFormContext } from "../FormProvider";
import { EnhancedInput } from "@/components/ui/enhanced-input";
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

interface BasicInformationStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

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
}: BasicInformationStepProps) {
  const { data: session } = useSession();
  const { updateFormData } = useFormContext();
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

    if (formData.homeUniversityId) {
      return formData.homeUniversityId;
    }

    const matched = CYPRUS_UNIVERSITIES.find(
      (university) =>
        university.name.toLowerCase() === formData.homeUniversity.toLowerCase(),
    );

    return matched?.code || "";
  }, [
    derivedHomeUniversity?.code,
    formData.homeUniversity,
    formData.homeUniversityId,
  ]);

  useEffect(() => {
    setFormData(sanitizeBasicInformationData(data?.basicInfo));
  }, [data]);

  useEffect(() => {
    if (!derivedHomeUniversity?.name || !derivedHomeUniversity.code) {
      return;
    }

    setFormData((current) => {
      if (
        current.homeUniversity === derivedHomeUniversity.name &&
        current.homeUniversityId === derivedHomeUniversity.code
      ) {
        return current;
      }

      return sanitizeBasicInformationData({
        ...current,
        homeUniversity: derivedHomeUniversity.name,
        homeUniversityId: derivedHomeUniversity.code,
      });
    });
  }, [derivedHomeUniversity?.code, derivedHomeUniversity?.name]);

  useEffect(() => {
    if (!selectedHomeUniversityCode) {
      setDepartmentOptions([]);
      return;
    }

    let isActive = true;
    const fallbackDepartments = getFallbackHomeDepartments(
      selectedHomeUniversityCode,
    );

    setDepartmentOptions(fallbackDepartments);
    setDepartmentsLoading(true);

    fetch(
      `/api/universities/${encodeURIComponent(selectedHomeUniversityCode)}/departments`,
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
        console.error("Error loading home departments:", error);
      })
      .finally(() => {
        if (isActive) {
          setDepartmentsLoading(false);
        }
      });

    return () => {
      isActive = false;
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

    fetch(`/api/agreements?${params.toString()}`)
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
        console.error("Error loading host universities:", error);
      })
      .finally(() => {
        if (isActive) {
          setHostOptionsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    selectedHomeUniversityCode,
    formData.homeDepartment,
    formData.levelOfStudy,
    formData.hostUniversity,
    formData.hostCity,
    formData.hostCountry,
    formData.hostUniversityId,
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

  const persistBasicInfo = (nextData: BasicInformationData) => {
    setFormData(nextData);
    updateFormData("basicInfo", nextData);
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
      homeUniversityId: isHomeUniversityLocked
        ? derivedHomeUniversity?.code || formData.homeUniversityId
        : formData.homeUniversityId,
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
      homeUniversityId: isHomeUniversityLocked
        ? derivedHomeUniversity?.code || formData.homeUniversityId
        : formData.homeUniversityId,
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
    const cleanedData = sanitizeBasicInformationData({
      ...formData,
      homeUniversity: isHomeUniversityLocked
        ? derivedHomeUniversity?.name || formData.homeUniversity
        : formData.homeUniversity,
      homeUniversityId: isHomeUniversityLocked
        ? derivedHomeUniversity?.code || formData.homeUniversityId
        : formData.homeUniversityId,
    });

    setFormData(cleanedData);

    if (validateForm(cleanedData)) {
      onComplete({ basicInfo: cleanedData });
    } else {
      const firstError = document.querySelector(".text-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSave = () => {
    const cleanedData = sanitizeBasicInformationData({
      ...formData,
      homeUniversity: isHomeUniversityLocked
        ? derivedHomeUniversity?.name || formData.homeUniversity
        : formData.homeUniversity,
      homeUniversityId: isHomeUniversityLocked
        ? derivedHomeUniversity?.code || formData.homeUniversityId
        : formData.homeUniversityId,
    });

    setFormData(cleanedData);
    onSave({ ...data, basicInfo: cleanedData });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          Step 1 now collects only Erasmus eligibility and destination context.
          Your identity and email stay in your authenticated account, not inside
          this submission.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Academic Context
            </h3>
            <p className="text-sm text-gray-500">
              Confirm your home institution and the academic profile used to
              match Erasmus agreements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="homeUniversity">Home University</Label>
            {isHomeUniversityLocked ? (
              <EnhancedInput
                id="homeUniversity"
                value={derivedHomeUniversity?.name || formData.homeUniversity}
                disabled
                readOnly
                error={errors.homeUniversity}
                helperText={
                  derivedHomeUniversity?.domain
                    ? `Locked from your authenticated university email (${derivedHomeUniversity.domain}).`
                    : "Locked from your authenticated university email."
                }
              />
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
                    homeUniversityId: selectedUniversity.code,
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeDepartment">Home Department *</Label>
            {departmentOptions.length > 0 ? (
              <EnhancedSelect
                value={formData.homeDepartment}
                onValueChange={(value) =>
                  handleInputChange("homeDepartment", value)
                }
              >
                <EnhancedSelectTrigger error={errors.homeDepartment}>
                  <EnhancedSelectValue
                    placeholder={
                      departmentsLoading
                        ? "Loading departments..."
                        : "Select your department"
                    }
                  />
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
              <EnhancedInput
                id="homeDepartment"
                placeholder="e.g. Computer Science"
                value={formData.homeDepartment}
                onChange={(event) =>
                  handleInputChange("homeDepartment", event.target.value)
                }
                error={errors.homeDepartment}
                helperText="Used to filter your eligible partner universities."
              />
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
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-teal-600 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Erasmus Destination
            </h3>
            <p className="text-sm text-gray-500">
              Select the host institution available for your home department and
              study level.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label>Host University *</Label>
            <EnhancedSelect
              value={selectedHostOption?.value}
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
                      ? "Select department and level first"
                      : hostOptionsLoading
                        ? "Loading host universities..."
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostCity">Host City</Label>
            <EnhancedInput
              id="hostCity"
              value={formData.hostCity}
              readOnly
              disabled
              helperText="Derived from the selected host university."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostCountry">Host Country</Label>
            <EnhancedInput
              id="hostCountry"
              value={formData.hostCountry}
              readOnly
              disabled
              helperText="Derived from the selected host university."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Exchange Plan
            </h3>
            <p className="text-sm text-gray-500">
              Capture the academic year, period, and optional timing details for
              your exchange.
            </p>
          </div>
        </div>

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
              helperText="Use the academic year of your Erasmus mobility."
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
              Language of Instruction
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
          Continue to Courses
        </button>
      </div>
    </div>
  );
}
