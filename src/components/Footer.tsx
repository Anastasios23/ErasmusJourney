import Link from "next/link";
import { Heart, Mail, MessageCircle, FileText, Globe, ExternalLink, Users, MapPin } from "lucide-react";
import { EnhancedLogo } from "@/components/ui/enhanced-logo";
import { brandingTokens } from "@/utils/brandingTokens";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Destinations", href: "/destinations", icon: MapPin },
    { name: "Partner Universities", href: "/university-exchanges", icon: Globe },
    { name: "Student Stories", href: "/student-stories", icon: Users },
    { name: "Housing", href: "/student-accommodations", icon: Heart },
    { name: "Community", href: "/community", icon: MessageCircle },
  ];

  const applicationLinks = [
    { name: "Basic Information", href: "/basic-information" },
    { name: "Course Matching", href: "/course-matching" },
    { name: "Accommodation", href: "/accommodation" },
    { name: "Living Expenses", href: "/living-expenses" },
  ];

  const supportLinks = [
    { 
      name: "Email Support", 
      href: "mailto:support@erasmusjourney.com?subject=Help Request",
      icon: Mail 
    },
    { 
      name: "Community Help", 
      href: "/community",
      icon: MessageCircle 
    },
    { 
      name: "FAQ", 
      href: "/faq",
      icon: FileText 
    },
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
  ];

  const officialLinks = [
    { 
      name: "Erasmus+ Programme", 
      href: "https://erasmus-plus.ec.europa.eu/",
      external: true 
    },
    { 
      name: "European Commission", 
      href: "https://ec.europa.eu/",
      external: true 
    },
    { 
      name: "Cyprus Education", 
      href: "https://www.moec.gov.cy/",
      external: true 
    },
  ];

  return (
    <footer className={cn(
      "bg-white dark:bg-gray-900",
      brandingTokens.colors.border.default,
      "border-t"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <EnhancedLogo size="md" showTagline={true} className="mb-4" />
              <p className={cn("text-sm leading-relaxed mb-4", brandingTokens.colors.text.secondary)}>
                Empowering students to make the most of their Erasmus experience through comprehensive guidance, community support, and seamless application processes.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={cn("text-xs", brandingTokens.colors.text.tertiary)}>
                  Platform Online
                </span>
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <h3 className={cn("text-sm font-semibold mb-4", brandingTokens.colors.text.primary)}>
                Quick Navigation
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-2 text-sm transition-colors group",
                        brandingTokens.colors.text.secondary,
                        "hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Process */}
            <div>
              <h3 className={cn("text-sm font-semibold mb-4", brandingTokens.colors.text.primary)}>
                Application Steps
              </h3>
              <ul className="space-y-3">
                {applicationLinks.map((link, index) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-2 text-sm transition-colors group",
                        brandingTokens.colors.text.secondary,
                        "hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        "border-gray-300 dark:border-gray-600 group-hover:border-blue-500"
                      )}>
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Resources */}
            <div>
              <h3 className={cn("text-sm font-semibold mb-4", brandingTokens.colors.text.primary)}>
                Support & Help
              </h3>
              <ul className="space-y-3 mb-6">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-2 text-sm transition-colors group",
                        brandingTokens.colors.text.secondary,
                        "hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Official Resources */}
              <div>
                <h4 className={cn("text-xs font-medium mb-3 uppercase tracking-wider", brandingTokens.colors.text.tertiary)}>
                  Official Resources
                </h4>
                <ul className="space-y-2">
                  {officialLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className={cn(
                          "flex items-center space-x-1 text-xs transition-colors group",
                          brandingTokens.colors.text.tertiary,
                          "hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                      >
                        <span>{link.name}</span>
                        {link.external && (
                          <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={cn(
          "border-t py-6",
          brandingTokens.colors.border.default
        )}>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className={cn("text-sm", brandingTokens.colors.text.tertiary)}>
              © {currentYear} Erasmus Journey. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center space-x-6">
              {legalLinks.map((link, index) => (
                <div key={link.name} className="flex items-center">
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors",
                      brandingTokens.colors.text.tertiary,
                      "hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className={cn("mx-3 text-gray-300 dark:text-gray-600")}>•</span>
                  )}
                </div>
              ))}
            </div>

            {/* EU Programme Badge */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <div className="flex space-x-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-0.5 h-2 bg-yellow-300 rounded-full" />
                  ))}
                </div>
              </div>
              <span className={cn("text-xs font-medium", brandingTokens.colors.text.accent)}>
                EU Programme
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
