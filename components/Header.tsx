"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  ChevronDown,
  ClipboardList,
  Globe,
  MapPin,
  School,
  Star,
  Plane,
  Sparkles,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useFormSubmissions } from "@/hooks/useFormSubmissions";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { submissions } = useFormSubmissions();
  const { shouldHighlightStep, analytics } = useSmartNavigation();

  // Track scroll position for header background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          color: "from-amber-500 to-orange-600",
        },
        {
          name: "Universities",
          href: "/university-exchanges",
          description: "Exchange programs & institutions",
          icon: School,
          color: "from-blue-500 to-indigo-600",
        },
        {
          name: "Reviews",
          href: "/student-accommodations",
          description: "Student housing ratings",
          icon: Star,
          color: "from-emerald-500 to-teal-600",
        },
      ],
    },
    {
      name: "Share Experience",
      href: "/dashboard",
      icon: Plane,
      description: "Share your Erasmus story",
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
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5"
          : "bg-transparent",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <BackButton className="hidden md:block" />
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Erasmus
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Journey
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.subItems ? (
                    <div className="relative">
                      <button
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                          isCurrentPath(item.href) ||
                            item.subItems.some((sub) => isCurrentPath(sub.href))
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            : isScrolled
                              ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              : "text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50",
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                        <ChevronDown className="h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                      </button>

                      {/* Mega Dropdown */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-200/50 dark:border-gray-700/50 p-3 transform origin-top scale-95 group-hover:scale-100 transition-transform duration-300">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group/item"
                            >
                              <div
                                className={cn(
                                  "p-2.5 rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-xl",
                                  subItem.color,
                                )}
                              >
                                <subItem.icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover/item:text-violet-600 dark:group-hover/item:text-violet-400 transition-colors">
                                  {subItem.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {subItem.description}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                        isCurrentPath(item.href)
                          ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                          : isScrolled
                            ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            : "text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50",
                      )}
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
                    "ml-4 relative group overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 rounded-full px-6 py-2.5 font-semibold",
                    analytics.nextStep &&
                      "ring-2 ring-violet-400/50 ring-offset-2 ring-offset-transparent",
                  )}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Sparkles className="w-4 h-4 mr-2" />
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
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-200 animate-pulse" />
            ) : status === "authenticated" && session ? (
              <div className="flex items-center space-x-3">
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-violet-300 dark:hover:ring-violet-700 transition-all duration-300"
                    >
                      <div className="h-full w-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-72 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl"
                    align="end"
                    forceMount
                  >
                    {/* User Info Card */}
                    <div className="flex items-center gap-4 p-3 mb-3 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl">
                      <div className="h-12 w-12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    {userNavigation.map((item) =>
                      item.disabled ? (
                        <div key={item.name} className="px-2 py-1">
                          <div className="border-t border-gray-200 dark:border-gray-700" />
                        </div>
                      ) : (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {item.name}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ),
                    )}

                    <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

                    <DropdownMenuItem
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 transition-colors"
                      onClick={handleSignOut}
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-full px-5 font-medium transition-all",
                      isScrolled
                        ? "hover:bg-gray-100 dark:hover:bg-gray-800"
                        : "hover:bg-white/50 dark:hover:bg-gray-800/50",
                    )}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold shadow-lg">
                    Sign Up
                  </Button>
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
              className={cn(
                "rounded-full",
                isScrolled ? "hover:bg-gray-100" : "hover:bg-white/50",
              )}
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
          <div className="md:hidden py-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-in slide-in-from-top-5 duration-300 -mx-4 px-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </div>
                      <div className="space-y-1 pl-4">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-lg bg-gradient-to-br",
                                subItem.color,
                              )}
                            >
                              <subItem.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {subItem.name}
                              </div>
                              <div className="text-xs text-gray-500">
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
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={analytics.nextStep?.href || "/basic-information"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white text-lg py-6 shadow-xl shadow-violet-500/30 font-semibold">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {analytics.nextStep
                      ? `Continue: ${analytics.nextStep.name}`
                      : "Start Your Journey"}
                  </Button>
                </Link>
              </div>

              {/* Mobile Auth */}
              {status === "authenticated" && session ? (
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl">
                    <div className="h-12 w-12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {session.user.name?.[0] || session.user.email?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  {userNavigation
                    .filter((i) => !i.disabled)
                    .map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-full py-6 font-semibold"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full rounded-full py-6 bg-gray-900 text-white font-semibold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
