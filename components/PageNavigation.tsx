import BackButton from "./BackButton";
import Breadcrumb from "./Breadcrumb";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PageNavigationProps {
  breadcrumbItems?: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

export default function PageNavigation({
  breadcrumbItems,
  showBackButton = true,
  className = "",
}: PageNavigationProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <Breadcrumb items={breadcrumbItems} />
      {showBackButton && (
        <div className="md:hidden">
          <BackButton variant="outline" size="sm" />
        </div>
      )}
    </div>
  );
}
