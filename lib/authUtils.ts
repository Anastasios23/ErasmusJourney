/**
 * Allowed email domains for Cyprus Universities
 */
export const ALLOWED_DOMAINS = [
  "ucy.ac.cy", // University of Cyprus
  "cut.ac.cy", // Cyprus University of Technology
  "ouc.ac.cy", // Open University of Cyprus
  "unic.ac.cy", // University of Nicosia
  "euc.ac.cy", // European University Cyprus
  "frederick.ac.cy", // Frederick University
  "uclancyprus.ac.cy", // UCLan Cyprus
  "nup.ac.cy", // Neapolis University Paphos
  "philipsuniversity.ac.cy", // Philips University
];

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
