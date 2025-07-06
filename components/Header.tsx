import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../src/components/ui/button";
import BackButton from "./BackButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
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
} from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use actual session data for proper authentication

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Hub", href: "/hub" },
    { name: "Destinations", href: "/destinations" },
    { name: "Exchanges", href: "/university-exchanges" },
    { name: "Stories", href: "/student-stories" },
    { name: "Community", href: "/community" },
    { name: "Accommodations", href: "/student-accommodations" },
  ];

  const userNavigation = session
    ? [
        { name: "Dashboard", href: "/dashboard", icon: User },
        { name: "My Profile", href: "/profile", icon: User },
        {
          name: "Basic Information",
          href: "/basic-information",
          icon: FileText,
        },
        { name: "Course Matching", href: "/course-matching", icon: BookOpen },
        { name: "Accommodation", href: "/accommodation", icon: Home },
        { name: "Living Expenses", href: "/living-expenses", icon: Euro },
        { name: "Settings", href: "/settings", icon: Settings },
        // Add admin link for admin users
        ...((session.user as any)?.role === "ADMIN"
          ? [{ name: "Admin Panel", href: "/admin", icon: Settings }]
          : []),
      ]
    : [];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isCurrentPath = (path: string) => {
    return router.pathname === path;
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-4">
            <BackButton className="hidden md:block" />
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EJ</span>
              </div>
              <span className="font-bold text-xl text-gray-900">
                Erasmus Journey
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isCurrentPath(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
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
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {/* Mobile Back Button */}
              <div className="px-3 py-2">
                <BackButton className="w-full justify-center" />
              </div>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isCurrentPath(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Actions */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {session ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <div className="text-base font-medium text-gray-800">
                        Welcome,{" "}
                        {session.user.name?.split(" ")[0] ||
                          session.user.email?.split("@")[0]}
                        !
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.user.email}
                      </div>
                    </div>
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
