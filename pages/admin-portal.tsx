import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../src/components/ui/button";
import { Card, CardContent } from "../src/components/ui/card";
import {
  Home,
  BarChart3,
  Handshake,
  Building,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";

interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin-dashboard",
    label: "Dashboard",
    description: "Overview and quick access to all admin functions",
    icon: <Home className="w-5 h-5" />,
    color: "blue",
  },
  {
    href: "/partnership-analytics",
    label: "Partnership Analytics",
    description: "Detailed analytics and performance metrics",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "purple",
  },
  {
    href: "/partnership-management",
    label: "Partnership Management",
    description: "Manage university partnerships and agreements",
    icon: <Handshake className="w-5 h-5" />,
    color: "green",
  },
  {
    href: "/admin-destinations",
    label: "Destinations",
    description: "Manage Erasmus destinations and locations",
    icon: <Building className="w-5 h-5" />,
    color: "orange",
  },
  {
    href: "/admin-dashboard", // TODO: Create dedicated submissions page
    label: "Student Submissions",
    description: "Review and approve student experiences",
    icon: <Users className="w-5 h-5" />,
    color: "cyan",
  },
];

export default function AdminNavigationPage() {
  const router = useRouter();

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800",
      purple:
        "border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800",
      green: "border-green-200 bg-green-50 hover:bg-green-100 text-green-800",
      orange:
        "border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800",
      cyan: "border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-800",
    };
    return (
      colorMap[color as keyof typeof colorMap] ||
      "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive admin interface for managing the Erasmus Journey
            platform. Access analytics, partnerships, destinations, and student
            data.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {adminNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getColorClasses(item.color)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <h3 className="text-lg font-semibold">{item.label}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </div>
                  <p className="text-sm opacity-80">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Active Destinations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">University Partnerships</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">847</p>
                <p className="text-sm text-gray-600">Student Submissions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">23</p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  New partnership with University of Vienna added
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  2 hours ago
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Barcelona destination data updated
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  4 hours ago
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  15 new student submissions received
                </span>
                <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
