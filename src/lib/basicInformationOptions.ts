import {
  ALL_UNIVERSITY_AGREEMENTS,
  CYPRUS_UNIVERSITIES,
} from "@/data/universityAgreements";
import type { BasicInfoLevel } from "./basicInformation";
import {
  getDepartmentMatchKey,
  normalizeDepartmentList,
} from "./departmentNormalization";

export interface HostUniversityOption {
  value: string;
  label: string;
  hostUniversity: string;
  hostCity: string;
  hostCountry: string;
  hostUniversityId?: string;
}

function normalizeValue(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function sameNormalizedValue(left?: string | null, right?: string | null) {
  return normalizeValue(left) === normalizeValue(right);
}

function toAcademicLevel(level?: BasicInfoLevel | "") {
  switch (level) {
    case "Bachelor":
      return "bachelor";
    case "Master":
      return "master";
    case "PhD":
      return "phd";
    default:
      return null;
  }
}

export function createHostUniversityOptionValue(input: {
  hostUniversity: string;
  hostCity: string;
  hostCountry: string;
  hostUniversityId?: string;
}): string {
  if (input.hostUniversityId) {
    return `id:${input.hostUniversityId}`;
  }

  return `fallback:${encodeURIComponent(
    [input.hostUniversity, input.hostCity, input.hostCountry]
      .map((value) => value.trim())
      .join("|"),
  )}`;
}

function createHostUniversityOption(input: {
  hostUniversity: string;
  hostCity: string;
  hostCountry: string;
  hostUniversityId?: string;
}): HostUniversityOption {
  return {
    value: createHostUniversityOptionValue(input),
    label: `${input.hostUniversity} (${input.hostCity}, ${input.hostCountry})`,
    hostUniversity: input.hostUniversity,
    hostCity: input.hostCity,
    hostCountry: input.hostCountry,
    hostUniversityId: input.hostUniversityId,
  };
}

export function mergeHostUniversityOptions(
  ...optionGroups: HostUniversityOption[][]
): HostUniversityOption[] {
  const options = new Map<string, HostUniversityOption>();

  optionGroups.flat().forEach((option) => {
    if (!option.hostUniversity) {
      return;
    }

    const key = [
      normalizeValue(option.hostUniversity),
      normalizeValue(option.hostCity),
      normalizeValue(option.hostCountry),
    ].join("|");
    const existing = options.get(key);

    if (!existing || (!existing.hostUniversityId && option.hostUniversityId)) {
      options.set(key, option);
    }
  });

  return Array.from(options.values()).sort((left, right) =>
    left.label.localeCompare(right.label),
  );
}

export function getFallbackHomeDepartments(
  homeUniversityCode?: string,
): string[] {
  const university = CYPRUS_UNIVERSITIES.find(
    (item) => normalizeValue(item.code) === normalizeValue(homeUniversityCode),
  );

  if (!university) {
    return [];
  }

  return normalizeDepartmentList(university.departments);
}

export function getCanonicalHomeDepartmentOption(input: {
  homeUniversityCode?: string;
  homeDepartment?: string;
}): string | null {
  const homeDepartmentKey = getDepartmentMatchKey(input.homeDepartment);

  if (!homeDepartmentKey) {
    return null;
  }

  return (
    getFallbackHomeDepartments(input.homeUniversityCode).find(
      (department) => getDepartmentMatchKey(department) === homeDepartmentKey,
    ) || null
  );
}

export function getFallbackHostUniversityOptions(input: {
  homeUniversityCode?: string;
  homeDepartment?: string;
  levelOfStudy?: BasicInfoLevel | "";
}): HostUniversityOption[] {
  const homeUniversityCode = normalizeValue(input.homeUniversityCode);
  const homeDepartmentKey = getDepartmentMatchKey(input.homeDepartment);
  const academicLevel = toAcademicLevel(input.levelOfStudy);

  if (!homeUniversityCode || !homeDepartmentKey) {
    return [];
  }

  const options = ALL_UNIVERSITY_AGREEMENTS.filter((agreement) => {
    if (normalizeValue(agreement.homeUniversity) !== homeUniversityCode) {
      return false;
    }

    if (getDepartmentMatchKey(agreement.homeDepartment) !== homeDepartmentKey) {
      return false;
    }

    if (
      academicLevel &&
      agreement.academicLevel &&
      agreement.academicLevel !== "all" &&
      agreement.academicLevel !== academicLevel
    ) {
      return false;
    }

    return true;
  }).map((agreement) =>
    createHostUniversityOption({
      hostUniversity: agreement.partnerUniversity.trim(),
      hostCity: agreement.partnerCity.trim(),
      hostCountry: agreement.partnerCountry.trim(),
    }),
  );

  return mergeHostUniversityOptions(options);
}

export function findEligibleHostUniversityOption(input: {
  homeUniversityCode?: string;
  homeDepartment?: string;
  levelOfStudy?: BasicInfoLevel | "";
  hostUniversity?: string;
  hostCity?: string;
  hostCountry?: string;
}): HostUniversityOption | null {
  const options = getFallbackHostUniversityOptions({
    homeUniversityCode: input.homeUniversityCode,
    homeDepartment: input.homeDepartment,
    levelOfStudy: input.levelOfStudy,
  });

  return (
    options.find(
      (option) =>
        sameNormalizedValue(option.hostUniversity, input.hostUniversity) &&
        sameNormalizedValue(option.hostCity, input.hostCity) &&
        sameNormalizedValue(option.hostCountry, input.hostCountry),
    ) || null
  );
}
