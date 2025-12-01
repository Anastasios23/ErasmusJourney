"use client";

import { useState, useEffect } from "react";
import { useSession, signOut, getCsrfToken } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import BackButton from "./BackButton";
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
  Globe,
  MapPin,
  School,
  Star,
  Plane,
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { ErasmusIcon } from "@/components/icons/CustomIcons";
import { EnhancedLogo } from "@/components/ui/enhanced-logo";
import {
  ApplicationProgress,
  createApplicationSteps,
} from "@/components/ui/application-progress";
import { useFormSubmissions } from "@/hooks/useFormSubmissions";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { submissions } = useFormSubmissions();
  const { shouldHighlightStep, analytics } = useSmartNavigation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    {
      name: "Explore",
      href: "/destinations",
      icon: Globe,
      subItems: [
        {
          name: "Destinations",
          href: "/destinations",
          description: "Browse cities & countries",
          icon: MapPin,
        },
        {
          name: "Universities",
          href: "/university-exchanges",
          description: "Exchange programs & institutions",
          icon: School,
        },
        {
          name: "Reviews",
          href: "/student-accommodations",
          description: "Student housing ratings",
          icon: Star,
        },
      ],
    },
    {
      name: "Share Experience",
      href: "/submissions",
      icon: Plane,
    },
  ];

  const userNavigation = session
    ? [
        { name: "Dashboard", href: "/dashboard", icon: User },
        { name: "Profile", href: "/profile", icon: User },
        ...((session.user as any)?.role === "ADMIN"
          ? [
              { name: "─────────", href: "#", icon: User, disabled: true },
              { name: "Admin Dashboard", href: "/admin", icon: Settings },
              {
                name: "Review Queue",
                href: "/admin/review",
                icon: ClipboardList,
              },
            ]
          : []),
      ]
    : [];

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/",
        redirect: false,
      });
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = "/";
    }
  };

  const isCurrentPath = (path: string) => {
    return router.pathname === path;
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <BackButton className="hidden md:block" />
            <EnhancedLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.subItems ? (
                    <div className="relative">
                      <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          isCurrentPath(item.href) ||
                          item.subItems.some((sub) => isCurrentPath(sub.href))
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </button>
                      
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group/item"
                          >
                            <div className="mt-1 p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/50 transition-colors">
                              <subItem.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {subItem.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {subItem.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        isCurrentPath(item.href)
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Primary CTA */}
              <Link href={analytics.nextStep?.href || "/basic-information"}>
                <Button
                  className={cn(
                    "ml-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-6",
                    analytics.nextStep && "animate-pulse-gentle ring-2 ring-blue-400/50",
                  )}
                >
                  {analytics.nextStep
                    ? `Continue: ${analytics.nextStep.name}`
                    : "Start Your Journey"}
                </Button>
              </Link>
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {status === "loading" ? (
              <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse"></div>
            ) : status === "authenticated" && session ? (
              <div className="flex items-center space-x-2">
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-blue-100 transition-all"
                    >
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <div className="flex items-center gap-3 p-2 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    
                    {userNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer"
                        >
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    <DropdownMenuItem
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full px-5">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-5 bg-gray-900 text-white hover:bg-gray-800">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-5 duration-200">
            <div className="space-y-1 px-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </div>
                      <div className="pl-4 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 ml-4">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <subItem.icon className="w-4 h-4" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href={analytics.nextStep?.href || "/basic-information"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg py-6 shadow-lg">
                    {analytics.nextStep
                      ? `Continue: ${analytics.nextStep.name}`
                      : "Start Your Journey"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
