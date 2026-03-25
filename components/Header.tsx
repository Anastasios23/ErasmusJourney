"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import { Icon } from "@iconify/react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useFormSubmissions } from "@/hooks/useFormSubmissions";
import { buildSmartNavigation } from "@/hooks/useSmartNavigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLElement>(null);

  const { submissions } = useFormSubmissions();
  const { shouldHighlightStep, analytics } = useMemo(
    () =>
      buildSmartNavigation({
        pathname: router.pathname,
        step: router.query.step,
        submissions,
      }),
    [router.pathname, router.query.step, submissions],
  );

  // Track scroll position for header background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track mouse position for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // MVP Streamlined navigation
  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: "solar:home-2-bold-duotone",
      description: "Back to homepage",
    },
    {
      name: "Explore",
      href: "/destinations",
      icon: "solar:compass-bold-duotone",
      description: "Discover your perfect destination",
      subItems: [
        {
          name: "Destinations",
          href: "/destinations",
          description: "Browse cities with real student insights",
          icon: "solar:map-point-bold-duotone",
          color: "from-amber-500 to-orange-600",
          stats: "Cities",
        },
        {
          name: "Courses",
          href: "/destinations?focus=courses",
          description: "Browse destination course examples",
          icon: "solar:notebook-bold-duotone",
          color: "from-blue-500 to-indigo-600",
          stats: "Courses",
        },
        {
          name: "Accommodation",
          href: "/destinations?focus=accommodation",
          description: "Browse destination housing insights",
          icon: "solar:home-2-bold-duotone",
          color: "from-emerald-500 to-teal-600",
          stats: "Housing",
        },
      ],
    },
    {
      name: "Share",
      href: "/share-experience",
      icon: "solar:pen-new-square-bold-duotone",
      description: "Share your Erasmus story",
    },
  ];

  const userNavigation = session
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: "solar:widget-2-bold-duotone",
        },
        ...((session.user as any)?.role === "ADMIN"
          ? [
              {
                name: "─────────",
                href: "#",
                icon: "solar:widget-2-bold-duotone",
                disabled: true,
              },
              {
                name: "Content Moderation",
                href: "/admin/review-submissions",
                icon: "solar:checklist-bold-duotone",
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
      ref={headerRef}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-700",
        isScrolled ? "py-2" : "py-4",
      )}
    >
      {/* Glassmorphism background with animated gradient */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-700",
          isScrolled
            ? "bg-white/70 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-white/20 dark:border-gray-800/50 shadow-lg shadow-black/5"
            : "bg-transparent",
        )}
      />

      {/* Mouse-following gradient highlight */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none transition-opacity duration-500"
        style={{
          background: isScrolled
            ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.07), transparent 40%)`
            : "none",
        }}
      />

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with magnetic effect */}
          <div className="flex items-center space-x-4">
            <BackButton className="hidden md:block" />
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 scale-150" />

                {/* Animated ring */}
                <div
                  className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"
                  style={{ animationDuration: "3s" }}
                />

                {/* Logo container */}
                <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-500">
                  <Icon
                    icon="solar:square-academic-cap-bold-duotone"
                    className="w-6 h-6 text-white drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Logo text with gradient animation */}
              <div className="hidden sm:flex items-baseline gap-0.5">
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient">
                  Erasmus
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Journey
                </span>
                <Icon
                  icon="solar:stars-bold-duotone"
                  className="w-3 h-3 text-amber-500 ml-1 animate-pulse"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Pill design */}
          <div className="hidden lg:block">
            <div
              className={cn(
                "flex items-center p-1.5 rounded-2xl transition-all duration-500",
                isScrolled
                  ? "bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm"
                  : "bg-white/10 backdrop-blur-sm",
              )}
            >
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.subItems ? (
                    <div className="relative">
                      <button
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                          isCurrentPath(item.href) ||
                            item.subItems.some((sub) => isCurrentPath(sub.href))
                            ? "bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow-md"
                            : "text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-900/80",
                        )}
                      >
                        <Icon
                          icon={item.icon}
                          className="w-4 h-4 transition-transform group-hover:scale-110"
                        />
                        {item.name}
                        <Icon
                          icon="solar:alt-arrow-down-linear"
                          className={cn(
                            "h-3.5 w-3.5 transition-all duration-300",
                            activeDropdown === item.name
                              ? "rotate-180 text-blue-600"
                              : "opacity-50",
                          )}
                        />
                      </button>

                      {/* Enhanced Mega Dropdown */}
                      <div
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all duration-300 z-50",
                          activeDropdown === item.name
                            ? "opacity-100 visible translate-y-0"
                            : "opacity-0 invisible -translate-y-2",
                        )}
                      >
                        <div className="relative">
                          {/* Dropdown arrow */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rotate-45 rounded-sm shadow-lg" />

                          {/* Dropdown content */}
                          <div className="relative w-80 bg-white dark:bg-gray-900 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-900/20 dark:shadow-black/40 border border-gray-200/50 dark:border-gray-700/50 p-2 overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />

                            {item.subItems.map((subItem, idx) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="relative flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 group/item"
                                style={{ animationDelay: `${idx * 50}ms` }}
                              >
                                <div
                                  className={cn(
                                    "relative p-3 rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-xl group-hover/item:-translate-y-0.5",
                                    subItem.color,
                                  )}
                                >
                                  <Icon
                                    icon={subItem.icon}
                                    className="w-5 h-5 text-white"
                                  />
                                  {/* Shine effect */}
                                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                      {subItem.name}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                                      {subItem.stats}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                    {subItem.description}
                                  </p>
                                </div>

                                <Icon
                                  icon="solar:arrow-right-linear"
                                  className="w-4 h-4 text-gray-400 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all"
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 group",
                        isCurrentPath(item.href)
                          ? "bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-900/80",
                      )}
                    >
                      <Icon
                        icon={item.icon}
                        className="w-4 h-4 transition-transform group-hover:scale-110"
                      />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Primary CTA with glow */}
            <Button
              asChild
              className={cn(
                "relative group overflow-hidden rounded-2xl px-6 py-2.5 font-semibold text-white transition-all duration-500",
                "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600",
                "hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]",
                "border border-white/20",
                analytics.nextStep &&
                  "ring-2 ring-violet-400/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-950",
              )}
            >
              <Link
                href={analytics.nextStep?.href || "/share-experience?step=1"}
              >
                {/* Animated shine */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Pulsing glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                <span className="relative flex items-center gap-2">
                  <Icon icon="solar:bolt-bold-duotone" className="w-4 h-4" />
                  {analytics.nextStep
                    ? `Continue: ${analytics.nextStep.name}`
                    : "Start Journey"}
                </span>
              </Link>
            </Button>

            {/* User section */}
            {status === "loading" ? (
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-200 to-indigo-200 animate-pulse" />
            ) : status === "authenticated" && session ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-11 w-11 rounded-2xl p-0 overflow-hidden ring-2 ring-transparent hover:ring-violet-400/50 transition-all duration-300 group"
                    >
                      {/* Animated border */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative h-full w-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm rounded-xl">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-72 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl shadow-gray-900/20"
                    align="end"
                    forceMount
                  >
                    {/* User Info Card */}
                    <div className="flex items-center gap-4 p-4 mb-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-2xl">
                      <div className="relative">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {session.user.name?.[0] || session.user.email?.[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
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
                            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                          >
                            <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <Icon
                                icon={item.icon}
                                className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                              />
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
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 transition-colors"
                      onClick={handleSignOut}
                    >
                      <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <Icon
                          icon="solar:logout-2-bold-duotone"
                          className="h-4 w-4"
                        />
                      </div>
                      <span className="font-medium">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-xl px-5 font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-xl px-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "rounded-xl h-11 w-11 transition-all duration-300",
                isMobileMenuOpen
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <div className="relative w-5 h-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 w-5 h-0.5 bg-current transition-all duration-300",
                    isMobileMenuOpen && "rotate-45 top-2",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-2 w-5 h-0.5 bg-current transition-all duration-300",
                    isMobileMenuOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-4 w-5 h-0.5 bg-current transition-all duration-300",
                    isMobileMenuOpen && "-rotate-45 top-2",
                  )}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Full screen overlay */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-[80px] bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl transition-all duration-500 overflow-y-auto",
            isMobileMenuOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-4 pointer-events-none",
          )}
        >
          <div className="p-6 space-y-4">
            {navigation.map((item, idx) => (
              <div
                key={item.name}
                className="animate-in slide-in-from-right-5 fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {item.subItems ? (
                  <div className="space-y-3">
                    <div className="px-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Icon icon={item.icon} className="w-4 h-4" />
                      {item.name}
                    </div>
                    <div className="grid gap-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                              subItem.color,
                            )}
                          >
                            <Icon
                              icon={subItem.icon}
                              className="w-5 h-5 text-white"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {subItem.name}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                {subItem.stats}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {subItem.description}
                            </p>
                          </div>
                          <Icon
                            icon="solar:arrow-right-linear"
                            className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                      isCurrentPath(item.href)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        isCurrentPath(item.href)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-800",
                      )}
                    >
                      <Icon icon={item.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile CTA */}
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                asChild
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg shadow-xl shadow-blue-500/30 font-semibold"
              >
                <Link
                  href={analytics.nextStep?.href || "/share-experience?step=1"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon
                    icon="solar:bolt-bold-duotone"
                    className="w-5 h-5 mr-2"
                  />
                  {analytics.nextStep
                    ? `Continue: ${analytics.nextStep.name}`
                    : "Start Your Journey"}
                </Link>
              </Button>
            </div>

            {/* Mobile Auth */}
            {status === "authenticated" && session ? (
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-2xl">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {session.user.name?.[0] || session.user.email?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
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
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-800">
                        <Icon
                          icon={item.icon}
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                    <Icon
                      icon="solar:logout-2-bold-duotone"
                      className="w-5 h-5"
                    />
                  </div>
                  <span className="font-semibold">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-semibold text-base"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold text-base">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
