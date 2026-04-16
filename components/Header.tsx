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
import { Icon } from "@iconify/react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { analytics } = useSmartNavigation();

  // Track scroll position for header background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/destinations" },
    { name: "Courses", href: "/course-matching-experiences" },
    { name: "Share", href: "/share-experience" },
  ];

  const userNavigation = session
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
        },
        ...((session.user as any)?.role === "ADMIN"
          ? [
              {
                name: "Moderation",
                href: "/admin/review-submissions",
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

  const primaryAction =
    status === "authenticated" && analytics.nextStep
      ? {
          href: analytics.nextStep.href,
          label: `Continue: ${analytics.nextStep.name}`,
        }
      : {
          href: "/destinations",
          label: "Explore destinations",
        };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-gray-200"
          : "bg-white/85 border-gray-100",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <BackButton className="hidden md:block" />
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Icon
                  icon="solar:square-academic-cap-bold-duotone"
                  className="w-5 h-5 text-white"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-gray-900">
                  Erasmus Journey
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isCurrentPath(item.href)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-md"
            >
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>

            {status === "loading" ? (
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
            ) : status === "authenticated" && session ? (
              <>
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 rounded-full p-0"
                    >
                      <span className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate text-gray-900">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {userNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href}>{item.name}</Link>
                      </DropdownMenuItem>
                    ))}
                    {userNavigation.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-md">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 rounded-md"
              aria-label="Toggle navigation menu"
            >
              <Icon
                icon={
                  isMobileMenuOpen
                    ? "solar:close-circle-linear"
                    : "solar:hamburger-menu-linear"
                }
                className="w-5 h-5"
              />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "lg:hidden border-t border-gray-100 overflow-hidden transition-all duration-200",
            isMobileMenuOpen ? "max-h-[520px] py-3" : "max-h-0 py-0 border-t-0",
          )}
        >
          <div className="space-y-1 pb-2">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/destinations"
              className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore destinations
            </Link>
            <Link
              href="/course-matching-experiences"
              className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Course examples
            </Link>
            <Link
              href="/share-experience"
              className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Share experience
            </Link>

            {status === "authenticated" && session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {(session.user as any)?.role === "ADMIN" ? (
                  <Link
                    href="/admin/review-submissions"
                    className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Moderation
                  </Link>
                ) : null}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    void handleSignOut();
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}

            <div className="pt-2">
              <Button
                asChild
                className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-md"
              >
                <Link
                  href={primaryAction.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {primaryAction.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
