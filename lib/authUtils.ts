export interface CyprusUniversityDomainInfo {
  code: string;
  name: string;
  domain: string;
}

export const CYPRUS_UNIVERSITY_DOMAIN_MAP: Record<
  string,
  Omit<CyprusUniversityDomainInfo, "domain">
> = {
  "ucy.ac.cy": {
    code: "UCY",
    name: "University of Cyprus",
  },
  "cut.ac.cy": {
    code: "CUT",
    name: "Cyprus University of Technology",
  },
  "ouc.ac.cy": {
    code: "OUC",
    name: "Open University of Cyprus",
  },
  "unic.ac.cy": {
    code: "UNIC",
    name: "University of Nicosia",
  },
  "euc.ac.cy": {
    code: "EUC",
    name: "European University Cyprus",
  },
  "frederick.ac.cy": {
    code: "Frederick",
    name: "Frederick University",
  },
  "uclancyprus.ac.cy": {
    code: "UCLan",
    name: "University of Central Lancashire Cyprus",
  },
  "nup.ac.cy": {
    code: "Neapolis",
    name: "Neapolis University Pafos",
  },
  "philipsuniversity.ac.cy": {
    code: "Philips",
    name: "Philips University",
  },
};

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
