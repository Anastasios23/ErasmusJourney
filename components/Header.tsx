"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
// import BackButton from "@/components/BackButton";
// If BackButton exists elsewhere, update the path accordingly, e.g.:
import BackButton from "./BackButton";
// Or comment/remove if not needed and remove all usages of <BackButton />
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BookOpen,
  FileText,
  Home,
  Euro,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { ErasmusIcon } from "@/components/icons/CustomIcons";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { EnhancedLogo } from "@/components/ui/enhanced-logo";
import {
  ApplicationProgress,
  createApplicationSteps,
} from "@/components/ui/application-progress";
import { useFormSubmissions } from "@/hooks/useFormSubmissions";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { cn } from "@/lib/utils";
import {
  MOCK_SESSION_USER,
  MOCK_STATUS_AUTHENTICATED,
} from "@/utils/mockSession";

export default function Header() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session, status } = useSession();
  const session = MOCK_SESSION_USER;
  const status = MOCK_STATUS_AUTHENTICATED;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get form submissions for progress tracking
  const { submissions } = useFormSubmissions();

  // Smart navigation for highlighting next steps
  const { shouldHighlightStep, analytics } = useSmartNavigation();

  // Session state tracking for reactivity

  // Reactive session handling for live updates

  const navigation = [
    { name: "Home", href: "/" },
    {
      name: "Explore",
      href: "/destinations",
      subItems: [
        {
          name: "Destinations",
          href: "/destinations",
          description: "Browse cities & countries",
        },
        {
          name: "Partner Universities",
          href: "/university-exchanges",
          description: "Exchange programs & institutions",
        },
      ],
    },
    { name: "Stories", href: "/student-stories" },
    { name: "Housing", href: "/student-accommodations" },
    { name: "Community", href: "/community" },
  ];

  const userNavigation = session
    ? [
        { name: "Dashboard", href: "/dashboard", icon: User },
        { name: "My Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
        // Add admin link for admin users
        ...((session.user as any)?.role === "ADMIN"
          ? [{ name: "Admin Panel", href: "/admin", icon: Settings }]
          : []),
      ]
    : [];

  // Application steps grouped separately for submenu
  const applicationSteps = [
    {
      name: "Basic Information",
      href: "/basic-information",
      icon: FileText,
      description: "Personal & academic details",
    },
    {
      name: "Course Matching",
      href: "/course-matching",
      icon: BookOpen,
      description: "Select courses and universities",
    },
    {
      name: "Accommodation",
      href: "/accommodation",
      icon: Home,
      description: "Housing preferences",
    },
    {
      name: "Living Expenses",
      href: "/living-expenses",
      icon: Euro,
      description: "Budget and cost planning",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isCurrentPath = (path: string) => {
    return router.pathname === path;
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-4">
            <BackButton className="hidden md:block" />
            <EnhancedLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.subItems ? (
                    <div className="relative">
                      <button
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                          isCurrentPath(item.href) ||
                          item.subItems.some((sub) => isCurrentPath(sub.href))
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item.name}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {subItem.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {subItem.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isCurrentPath(item.href)
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              {/* Primary CTA */}
              <Link href={analytics.nextStep?.href || "/basic-information"}>
                <Button
                  size="sm"
                  className={cn(
                    "ml-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm relative",
                    analytics.nextStep && "animate-pulse-gentle",
                  )}
                >
                  {analytics.nextStep
                    ? `Continue: ${analytics.nextStep.name}`
                    : "Apply Now"}
                  {analytics.nextStep && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
            {/* AUTHENTICATION DISABLED - Comment out to re-enable */}
            {/* {status === "loading" ? (
              // Loading skeleton
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : status === "authenticated" && session ? ( */}
            {
              true ? (
                <div className="flex items-center space-x-2">
                  <NotificationDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {session.user.name?.[0] || session.user.email?.[0]}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {session.user.name?.[0] || session.user.email?.[0]}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-gray-900">
                            Welcome,{" "}
                            {session.user.name?.split(" ")[0] ||
                              session.user.email?.split("@")[0]}
                            !
                          </p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {userNavigation.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 w-full"
                          >
                            <item.icon className="h-4 w-4" aria-hidden="true" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      {/* Application Steps Submenu */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-2">
                          <ClipboardList
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>Application Steps</span>
                          {analytics.nextStep && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1" />
                          )}
                          <ChevronDown className="h-3 w-3 ml-auto" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-80">
                          <div className="p-3">
                            <ApplicationProgress
                              steps={createApplicationSteps(submissions || [])}
                              className="max-h-96 overflow-y-auto"
                            />
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : false ? (
                <div className="flex items-center space-x-4">
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              ) : null
              /* } */
            }
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {/* Mobile Back Button */}
              <div className="px-3 py-2">
                <BackButton className="w-full justify-center" />
              </div>
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isCurrentPath(item.href) ||
                      (item.subItems &&
                        item.subItems.some((sub) => isCurrentPath(sub.href)))
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {/* Mobile Sub-navigation */}
                  {item.subItems && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Apply CTA */}
              <div className="pt-2">
                <Link
                  href={analytics.nextStep?.href || "/basic-information"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r from-blue-600 to-blue-700 relative",
                      analytics.nextStep && "animate-pulse-gentle",
                    )}
                  >
                    {analytics.nextStep
                      ? `Continue: ${analytics.nextStep.name}`
                      : "Apply Now"}
                    {analytics.nextStep && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
                    )}
                  </Button>
                </Link>
              </div>

              {/* Mobile User Actions */}
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                {/* AUTHENTICATION DISABLED - Comment out to re-enable */}
                {/* {status === "loading" ? (
                  <div className="px-3 py-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ) : status === "authenticated" && session ? ( */}
                {true ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                        Welcome,{" "}
                        {session.user.name?.split(" ")[0] ||
                          session.user.email?.split("@")[0]}
                        !
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {session.user.email}
                      </div>
                    </div>
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}

                    {/* Application Steps Section */}
                    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <ApplicationProgress
                        steps={createApplicationSteps(submissions || [])}
                        className="mb-2"
                      />
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                ) : false ? (
                  <div className="space-y-1">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
