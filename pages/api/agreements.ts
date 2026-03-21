import { NextApiRequest, NextApiResponse } from "next";
import {
  ALL_UNIVERSITY_AGREEMENTS,
  CYPRUS_UNIVERSITIES,
  type UniversityAgreement,
} from "../../src/data/universityAgreements";

function normalizeText(value?: string | null): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function toCanonicalLevel(
  level?: string,
): "bachelor" | "master" | "phd" | null {
  const normalized = normalizeText(level);

  if (!normalized || normalized === "all") {
    return null;
  }

  if (
    normalized === "bachelor" ||
    normalized === "master" ||
    normalized === "phd"
  ) {
    return normalized;
  }

  return null;
}

function getCanonicalHomeUniversity(input?: string): {
  code: string;
  name: string;
} | null {
  const normalized = normalizeText(input);

  if (!normalized || normalized === "all") {
    return null;
  }

  const matched = CYPRUS_UNIVERSITIES.find((university) => {
    return (
      normalizeText(university.code) === normalized ||
      normalizeText(university.name) === normalized ||
      normalizeText(university.shortName) === normalized
    );
  });

  if (!matched) {
    return null;
  }

  return {
    code: matched.code,
    name: matched.name,
  };
}

function buildAgreementId(agreement: UniversityAgreement): string {
  return [
    agreement.homeUniversity,
    agreement.homeDepartment,
    agreement.partnerUniversity,
    agreement.partnerCity,
    agreement.partnerCountry,
    agreement.academicLevel || "all",
  ]
    .map((part) => normalizeText(part))
    .join("|");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { homeUniversity, department, level } = req.query;

    const homeUniversityInput =
      typeof homeUniversity === "string" ? homeUniversity : undefined;
    const departmentInput =
      typeof department === "string" ? department : undefined;
    const levelInput = typeof level === "string" ? level : undefined;

    const canonicalHomeUniversity =
      getCanonicalHomeUniversity(homeUniversityInput);
    const normalizedDepartment = normalizeText(departmentInput);
    const requestedLevel = toCanonicalLevel(levelInput);

    if (
      homeUniversityInput &&
      homeUniversityInput !== "all" &&
      !canonicalHomeUniversity
    ) {
      return res.status(200).json({ agreements: [], total: 0 });
    }

    const filteredAgreements = ALL_UNIVERSITY_AGREEMENTS.filter((agreement) => {
      if (
        canonicalHomeUniversity &&
        normalizeText(agreement.homeUniversity) !==
          normalizeText(canonicalHomeUniversity.code)
      ) {
        return false;
      }

      if (
        normalizedDepartment &&
        normalizedDepartment !== "all" &&
        normalizeText(agreement.homeDepartment) !== normalizedDepartment
      ) {
        return false;
      }

      if (!requestedLevel) {
        return true;
      }

      const agreementLevel = normalizeText(agreement.academicLevel || "all");
      return agreementLevel === "all" || agreementLevel === requestedLevel;
    });

    const formattedAgreements = filteredAgreements.map((agreement) => {
      const homeUniversityProfile = CYPRUS_UNIVERSITIES.find(
        (university) =>
          normalizeText(university.code) ===
          normalizeText(agreement.homeUniversity),
      );

      return {
        id: buildAgreementId(agreement),
        homeUniversity: {
          id: homeUniversityProfile?.code || agreement.homeUniversity,
          name: homeUniversityProfile?.name || agreement.homeUniversity,
          code: homeUniversityProfile?.code || agreement.homeUniversity,
        },
        homeDepartment: {
          id: normalizeText(agreement.homeDepartment),
          name: agreement.homeDepartment,
          faculty: undefined,
        },
        partnerUniversity: {
          id: normalizeText(
            `${agreement.partnerUniversity}|${agreement.partnerCity}|${agreement.partnerCountry}`,
          ),
          name: agreement.partnerUniversity,
          code: null,
          country: agreement.partnerCountry,
          city: agreement.partnerCity,
        },
        partnerCity: agreement.partnerCity,
        partnerCountry: agreement.partnerCountry,
        agreementType: agreement.agreementType || "student",
        isActive: true,
        startDate: null,
        endDate: null,
      };
    });

    res.status(200).json({
      agreements: formattedAgreements,
      total: formattedAgreements.length,
    });
  } catch (error) {
    console.error("Error fetching agreements:", error);
    res.status(500).json({ error: "Failed to fetch agreements" });
  }
}
