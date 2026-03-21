import { CYPRUS_UNIVERSITIES } from "../src/data/universityAgreements";

export interface CyprusUniversityDomainInfo {
  code: string;
  name: string;
  domain: string;
}

const CYPRUS_UNIVERSITIES_BY_CODE = new Map(
  CYPRUS_UNIVERSITIES.map((university) => [
    university.code.toLowerCase(),
    university,
  ]),
);

const CYPRUS_UNIVERSITY_DOMAIN_TO_CODE: Record<string, string> = {
  "ucy.ac.cy": "UCY",
  "unic.ac.cy": "UNIC",
  "euc.ac.cy": "EUC",
  "frederick.ac.cy": "Frederick",
  "uclancyprus.ac.cy": "UCLan",
};

export const CYPRUS_UNIVERSITY_DOMAIN_MAP: Record<
  string,
  Omit<CyprusUniversityDomainInfo, "domain">
> = Object.entries(CYPRUS_UNIVERSITY_DOMAIN_TO_CODE).reduce(
  (accumulator, [domain, code]) => {
    const university = CYPRUS_UNIVERSITIES_BY_CODE.get(code.toLowerCase());

    if (!university) {
      return accumulator;
    }

    accumulator[domain] = {
      code: university.code,
      name: university.name,
    };

    return accumulator;
  },
  {} as Record<string, Omit<CyprusUniversityDomainInfo, "domain">>,
);

/**
 * Allowed email domains for Cyprus Universities
 */
export const ALLOWED_DOMAINS = Object.keys(CYPRUS_UNIVERSITY_DOMAIN_MAP);

/**
 * Admin emails that are always allowed regardless of domain
 */
export const ADMIN_EMAILS = ["admin@erasmusjourney.com"];

/**
 * Validates if an email belongs to a Cyprus University domain or is an admin email
 * @param email The email address to check
 * @returns boolean
 */
export function isCyprusUniversityEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;

  const normalizedEmail = email.toLowerCase();

  // Allow admin emails
  if (ADMIN_EMAILS.includes(normalizedEmail)) return true;

  const domain = normalizedEmail.split("@")[1];

  return ALLOWED_DOMAINS.includes(domain);
}

export function getCyprusUniversityByEmail(
  email?: string | null,
): CyprusUniversityDomainInfo | null {
  if (!email || !email.includes("@")) return null;

  const domain = email.toLowerCase().split("@")[1];
  const university = CYPRUS_UNIVERSITY_DOMAIN_MAP[domain];

  if (!university) {
    return null;
  }

  return {
    ...university,
    domain,
  };
}

interface EnforcedHomeUniversityOptions {
  email?: string | null;
  fallbackName?: string | null;
  fallbackId?: string | null;
  resolvedUniversity?: {
    id?: string | null;
    name?: string | null;
  } | null;
}

export function getEnforcedHomeUniversityFields({
  email,
  fallbackName,
  fallbackId,
  resolvedUniversity,
}: EnforcedHomeUniversityOptions): {
  homeUniversity: string;
  homeUniversityId: string;
  enforcedFromEmail: boolean;
} {
  const derivedUniversity = getCyprusUniversityByEmail(email);

  if (derivedUniversity) {
    return {
      homeUniversity:
        resolvedUniversity?.name?.trim() || derivedUniversity.name,
      homeUniversityId: resolvedUniversity?.id?.trim() || "",
      enforcedFromEmail: true,
    };
  }

  return {
    homeUniversity:
      resolvedUniversity?.name?.trim() || fallbackName?.trim() || "",
    homeUniversityId:
      resolvedUniversity?.id?.trim() || fallbackId?.trim() || "",
    enforcedFromEmail: false,
  };
}
