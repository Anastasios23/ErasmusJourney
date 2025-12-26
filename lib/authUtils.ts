/**
 * Allowed email domains for Cyprus Universities
 */
export const ALLOWED_DOMAINS = [
  "ucy.ac.cy",       // University of Cyprus
  "cut.ac.cy",       // Cyprus University of Technology
  "ouc.ac.cy",       // Open University of Cyprus
  "unic.ac.cy",      // University of Nicosia
  "euc.ac.cy",       // European University Cyprus
  "frederick.ac.cy", // Frederick University
  "uclancyprus.ac.cy", // UCLan Cyprus
  "nup.ac.cy",       // Neapolis University Paphos
  "philipsuniversity.ac.cy", // Philips University
];

/**
 * Validates if an email belongs to a Cyprus University domain
 * @param email The email address to check
 * @returns boolean
 */
export function isCyprusUniversityEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  
  const domain = email.split("@")[1].toLowerCase();
  
  // Also allow the EXACT test email if it's not in the list (for developer ease if needed)
  // if (process.env.NODE_ENV === "development" && email === "test@example.com") return true;

  return ALLOWED_DOMAINS.includes(domain);
}
