import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🛡️ Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage form submissions and review content for all pages
        </p>
      </div>

      {/* Quick Access Testing */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🧪 Quick Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Create test form submissions and start testing the admin systems
          </p>
          <Link href="/test-admin">
            <Button className="bg-blue-600 hover:bg-blue-700">
              🧪 Go to Testing Page
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Admin Systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Destinations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                📍 Destinations
              </CardTitle>
              <Badge variant="secondary">basic-information</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Review student destination experiences and create public
              destination guides
            </p>

            <div className="space-y-2 mb-4">
              <div className="text-xs">
                <span className="font-medium">Data Sources:</span>
                <ul className="mt-1 text-gray-500">
                  <li>• Student destination experiences</li>
                  <li>• Cultural highlights & challenges</li>
                  <li>• Cost of living information</li>
                  <li>• Weather & transport details</li>
                </ul>
              </div>
            </div>

            <Link href="/admin/destinations">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                📍 Manage Destinations
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* University Exchanges */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                🏛️ Universities
              </CardTitle>
              <Badge variant="secondary">course-matching</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Review course matching data and create university exchange
              programs
            </p>

            <div className="space-y-2 mb-4">
              <div className="text-xs">
                <span className="font-medium">Data Sources:</span>
                <ul className="mt-1 text-gray-500">
                  <li>• Course details & ECTS credits</li>
                  <li>• Difficulty levels & exam types</li>
                  <li>• Academic requirements</li>
                  <li>• Partnership information</li>
                </ul>
              </div>
            </div>

            <Link href="/admin/university-exchanges">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                🏛️ Manage Universities
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Student Accommodations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                🏠 Accommodations
              </CardTitle>
              <Badge variant="secondary">accommodation</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Review accommodation submissions and create verified housing
              listings
            </p>

            <div className="space-y-2 mb-4">
              <div className="text-xs">
                <span className="font-medium">Data Sources:</span>
                <ul className="mt-1 text-gray-500">
                  <li>• Housing costs & room details</li>
                  <li>• Student ratings & reviews</li>
                  <li>• Amenities & location info</li>
                  <li>• Admin photos & verification</li>
                </ul>
              </div>
            </div>

            <Link href="/admin/student-accommodations">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                🏠 Manage Accommodations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🎯 How It Works</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    1
                  </span>
                  <span>
                    Students fill forms (Basic Information, Course Matching,
                    Accommodation)
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    2
                  </span>
                  <span>
                    Submissions appear in admin panels with status "SUBMITTED"
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    3
                  </span>
                  <span>
                    Admins review student data and add professional content
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    4
                  </span>
                  <span>
                    Approved submissions become public content on
                    destination/university/accommodation pages
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">✅ Key Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  • <strong>Data-driven content:</strong> All public pages fed
                  by student experiences
                </li>
                <li>
                  • <strong>Quality control:</strong> Admin review before
                  publishing
                </li>
                <li>
                  • <strong>Professional presentation:</strong> Admin-added
                  photos and descriptions
                </li>
                <li>
                  • <strong>Verified information:</strong> Admin-checked
                  contacts and details
                </li>
                <li>
                  • <strong>Student authenticity:</strong> Real experiences and
                  ratings
                </li>
                <li>
                  • <strong>Simplified workflow:</strong> No unnecessary fields
                  or processes
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">🔧 Recent Improvements</h4>
            <p className="text-sm text-gray-600">
              Based on your feedback, we've simplified the accommodation system
              by removing study level tracking, application process details, and
              student photo submissions. Only admins can now add photos,
              ensuring professional quality control while maintaining student
              authenticity in experiences and ratings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
