import Link from "next/link";

import { cn } from "../lib/utils";

type PublicDestinationSection = "overview" | "accommodation" | "courses";

interface PublicDestinationSubnavProps {
  slug: string;
  active: PublicDestinationSection;
}

const NAV_ITEMS: Array<{
  id: PublicDestinationSection;
  label: string;
  href: (slug: string) => string;
}> = [
  {
    id: "overview",
    label: "Overview",
    href: (slug) => `/destinations/${slug}`,
  },
  {
    id: "accommodation",
    label: "Accommodation insights",
    href: (slug) => `/destinations/${slug}/accommodation`,
  },
  {
    id: "courses",
    label: "Course equivalences",
    href: (slug) => `/destinations/${slug}/courses`,
  },
];

export default function PublicDestinationSubnav({
  slug,
  active,
}: PublicDestinationSubnavProps) {
  return (
    <nav
      aria-label="Destination sections"
      className="flex flex-wrap gap-2 border-b border-slate-200 pb-4"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href(slug)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            item.id === active
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
