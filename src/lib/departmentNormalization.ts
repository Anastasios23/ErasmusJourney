const DEPARTMENT_ALIAS_MAP: Record<string, string> = {
  businessadminsitrationandaccountingandfinance:
    "Business Administration and Accounting and Finance",
};

function normalizeRaw(value?: string | null): string {
  return (value || "").trim().replace(/\s+/g, " ");
}

function normalizeKey(value?: string | null): string {
  return normalizeRaw(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getDepartmentMatchKey(value?: string | null): string {
  const key = normalizeKey(value);
  return DEPARTMENT_ALIAS_MAP[key]
    ? normalizeKey(DEPARTMENT_ALIAS_MAP[key])
    : key;
}

export function getCanonicalDepartmentLabel(value?: string | null): string {
  const raw = normalizeRaw(value);

  if (!raw) {
    return "";
  }

  const key = normalizeKey(raw);
  return DEPARTMENT_ALIAS_MAP[key] || raw;
}

export function normalizeDepartmentList(departments: string[]): string[] {
  const deduped = new Map<string, string>();

  departments.forEach((department) => {
    const canonicalLabel = getCanonicalDepartmentLabel(department);
    const key = getDepartmentMatchKey(canonicalLabel);

    if (!canonicalLabel || !key || deduped.has(key)) {
      return;
    }

    deduped.set(key, canonicalLabel);
  });

  return Array.from(deduped.values()).sort((left, right) =>
    left.localeCompare(right),
  );
}
