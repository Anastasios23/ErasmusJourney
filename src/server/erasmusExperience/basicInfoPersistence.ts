import { getCyprusUniversityByEmail } from "../../../lib/authUtils";
import { prisma } from "../../../lib/prisma";
import { CYPRUS_UNIVERSITIES } from "../../data/universityAgreements";
import {
  buildExperienceSemester,
  sanitizeBasicInformationData,
} from "../../lib/basicInformation";
import { Step1ValidationError } from "./errors";

function normalizeKey(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

const CANONICAL_UNIVERSITIES_BY_CODE = new Map(
  CYPRUS_UNIVERSITIES.map((university) => [
    normalizeKey(university.code),
    university,
  ]),
);

function getCanonicalUniversityByCode(code?: string | null) {
  if (!code) {
    return null;
  }

  return CANONICAL_UNIVERSITIES_BY_CODE.get(normalizeKey(code)) || null;
}

function getSupportedUniversityCodesMessage(): string {
  return [...CANONICAL_UNIVERSITIES_BY_CODE.values()]
    .map((university) => university.code)
    .sort((left, right) => left.localeCompare(right))
    .join(", ");
}

async function resolveUniversityByReference(
  reference?: string | null,
  name?: string | null,
) {
  const normalizedReference = reference?.trim();
  const normalizedName = name?.trim();

  if (!normalizedReference && !normalizedName) {
    return null;
  }

  return prisma.universities.findFirst({
    where: {
      OR: [
        ...(normalizedReference
          ? [{ id: normalizedReference }, { code: normalizedReference }]
          : []),
        ...(normalizedName ? [{ name: normalizedName }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
    },
  });
}

export interface BasicInfoPersistenceData {
  basicInfo: ReturnType<typeof sanitizeBasicInformationData>;
  homeUniversityId: string | null;
  hostUniversityId: string | null;
  hostCity: string | null;
  hostCountry: string | null;
  semester: string | null;
}

export async function buildBasicInfoPersistenceData(
  incomingBasicInfo: unknown,
  existingBasicInfo: unknown,
  signedInEmail?: string | null,
): Promise<BasicInfoPersistenceData | null> {
  if (!incomingBasicInfo && !existingBasicInfo) {
    return null;
  }

  const mergedBasicInfo = sanitizeBasicInformationData({
    ...(typeof existingBasicInfo === "object" && existingBasicInfo
      ? (existingBasicInfo as Record<string, unknown>)
      : {}),
    ...(typeof incomingBasicInfo === "object" && incomingBasicInfo
      ? (incomingBasicInfo as Record<string, unknown>)
      : {}),
  });

  const derivedHomeUniversity = getCyprusUniversityByEmail(
    signedInEmail || undefined,
  );
  const inferredFallbackCode = getCanonicalUniversityByCode(
    mergedBasicInfo.homeUniversity,
  )?.code;
  const submittedFallbackCode =
    mergedBasicInfo.homeUniversityCode || inferredFallbackCode || null;

  let canonicalHomeUniversityCode = "";
  let canonicalHomeUniversityName = "";

  if (derivedHomeUniversity?.code) {
    const canonicalFromEmail = getCanonicalUniversityByCode(
      derivedHomeUniversity.code,
    );

    if (!canonicalFromEmail) {
      throw new Step1ValidationError(
        422,
        "INVALID_HOME_UNIVERSITY_CODE",
        "Your authenticated university is not in the supported MVP scope.",
      );
    }

    canonicalHomeUniversityCode = canonicalFromEmail.code;
    canonicalHomeUniversityName = canonicalFromEmail.name;
  } else {
    if (!submittedFallbackCode) {
      throw new Step1ValidationError(
        400,
        "MISSING_HOME_UNIVERSITY_CODE",
        "Invalid home university selection. Please choose a university from the official Erasmus Journey list.",
      );
    }

    const canonicalFallbackUniversity = getCanonicalUniversityByCode(
      submittedFallbackCode,
    );

    if (!canonicalFallbackUniversity) {
      throw new Step1ValidationError(
        422,
        "INVALID_HOME_UNIVERSITY_CODE",
        `Invalid home university selection. Please choose a university from the official Erasmus Journey list. Supported codes: ${getSupportedUniversityCodesMessage()}.`,
      );
    }

    canonicalHomeUniversityCode = canonicalFallbackUniversity.code;
    canonicalHomeUniversityName = canonicalFallbackUniversity.name;
  }

  const [homeUniversity, hostUniversity] = await Promise.all([
    resolveUniversityByReference(
      canonicalHomeUniversityCode,
      canonicalHomeUniversityName,
    ),
    resolveUniversityByReference(
      mergedBasicInfo.hostUniversityId,
      mergedBasicInfo.hostUniversity,
    ),
  ]);

  const persistedBasicInfo = sanitizeBasicInformationData({
    ...mergedBasicInfo,
    homeUniversity: homeUniversity?.name || canonicalHomeUniversityName,
    homeUniversityCode: canonicalHomeUniversityCode,
    hostUniversity:
      mergedBasicInfo.hostUniversity || hostUniversity?.name || "",
    hostUniversityId: hostUniversity?.id || "",
    hostCity: mergedBasicInfo.hostCity || hostUniversity?.city || "",
    hostCountry: mergedBasicInfo.hostCountry || hostUniversity?.country || "",
  });

  return {
    basicInfo: persistedBasicInfo,
    homeUniversityId: homeUniversity?.id || null,
    hostUniversityId: hostUniversity?.id || null,
    hostCity: persistedBasicInfo.hostCity || null,
    hostCountry: persistedBasicInfo.hostCountry || null,
    semester: buildExperienceSemester(persistedBasicInfo),
  };
}
