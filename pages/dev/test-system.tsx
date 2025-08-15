import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Database,
  Users,
  MapPin,
  Home,
  BookOpen,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function TestSystem() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<TestResult | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const generateTestData = async () => {
    setIsGenerating(true);
    setGenerationResult(null);
    
    try {
      const response = await fetch('/api/test/generate-comprehensive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGenerationResult({
          success: true,
          message: data.message,
          details: data
        });
      } else {
        setGenerationResult({
          success: false,
          message: data.error || 'Failed to generate test data'
        });
      }
    } catch (error) {
      setGenerationResult({
        success: false,
        message: 'Network error while generating test data'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testEndpoint = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [name]: {
          success: response.ok,
          message: response.ok ? 'API working correctly' : data.error || 'API error',
          details: data
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          message: 'Network error'
        }
      }));
    }
  };

  const testSteps = [
    {
      id: 'destinations',
      title: 'Destination Pages',
      description: 'Check that destination pages show aggregated student data',
      links: [
        { title: 'Paris, France', url: '/destinations/paris-france' },
        { title: 'Barcelona, Spain', url: '/destinations/barcelona-spain' }
      ],
      api: '/api/destinations/Paris/averages?country=France'
    },
    {
      id: 'accommodations',
      title: 'Student Accommodations',
      description: 'Verify accommodation experiences from test students',
      links: [
        { title: 'All Accommodations', url: '/student-accommodations' },
        { title: 'Filter: Paris', url: '/student-accommodations?city=Paris' },
        { title: 'Filter: Barcelona', url: '/student-accommodations?city=Barcelona' }
      ],
      api: '/api/accommodation/experiences'
    },
    {
      id: 'course-matching',
      title: 'Course Matching',
      description: 'Test course matching experiences and insights',
      links: [
        { title: 'Course Experiences', url: '/course-matching-experiences' },
        { title: 'Paris Course Data', url: '/course-matching-experiences?destination=Paris, France' }
      ],
      api: '/api/course-matching/experiences'
    },
    {
      id: 'stories',
      title: 'Student Stories',
      description: 'Check that student stories are accessible and filterable',
      links: [
        { title: 'All Stories', url: '/student-stories' },
        { title: 'Filter: France', url: '/student-stories?country=France' },
        { title: 'Filter: Spain', url: '/student-stories?country=Spain' }
      ],
      api: '/api/stories'
    },
    {
      id: 'universities',
      title: 'University Pages',
      description: 'Verify course matching insights on university pages',
      links: [
        { title: 'Sorbonne University', url: '/university-exchanges/sorbonne-university' },
        { title: 'ESADE Business School', url: '/university-exchanges/esade-business-school' }
      ],
      api: '/api/destinations/Paris/course-matching?country=France'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>System Testing - Erasmus Journey Platform</title>
        <meta name="description" content="Test and verify the Erasmus Journey Platform functionality" />
      </Head>

      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            System Testing & Verification
          </h1>
          <p className="text-lg text-gray-600">
            Generate test data and verify that all system components are working correctly.
          </p>
        </div>

        {/* Test Data Generation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 1: Generate Test Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                This will create comprehensive test submissions for two students:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Petros Alexandrou</h4>
                  <p className="text-blue-800 text-sm">Computer Science → Sorbonne University, Paris</p>
                  <p className="text-blue-700 text-xs mt-1">€1500/month, Cité Universitaire accommodation</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Maria Georgiou</h4>
                  <p className="text-green-800 text-sm">Business → ESADE Business School, Barcelona</p>
                  <p className="text-green-700 text-xs mt-1">€1600/month, Shared apartment in Gràcia</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={generateTestData} 
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Test Data'}
                </Button>
              </div>

              {generationResult && (
                <Alert className={generationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center gap-2">
                    {generationResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={generationResult.success ? "text-green-800" : "text-red-800"}>
                      {generationResult.message}
                    </AlertDescription>
                  </div>
                  {generationResult.success && generationResult.details && (
                    <div className="mt-2 text-sm text-green-700">
                      Created {generationResult.details.submissionsCreated} submissions for {generationResult.details.studentsCreated} students
                    </div>
                  )}
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step 2: Verify System Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {testSteps.map((step) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testEndpoint(step.id, step.api)}
                      className="flex items-center gap-2"
                    >
                      Test API
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {step.links.map((link, index) => (
                      <Link key={index} href={link.url}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          {link.title}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {testResults[step.id] && (
                    <Alert className={testResults[step.id].success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <div className="flex items-center gap-2">
                        {testResults[step.id].success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={testResults[step.id].success ? "text-green-800" : "text-red-800"}>
                          {testResults[step.id].message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Manual Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">✅ Destination Pages</h4>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>• Average costs reflect Petros/Maria data</li>
                  <li>• Student submission count shows correctly</li>
                  <li>• Recent experiences are clickable</li>
                  <li>• Course matching insights appear</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">✅ Student Accommodations</h4>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>• Real student experiences appear</li>
                  <li>• Filtering by city works (Paris/Barcelona)</li>
                  <li>• Accommodation details are accurate</li>
                  <li>• Student names are anonymized</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">✅ Course Matching</h4>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>• Course matching experiences show</li>
                  <li>• Filtering by destination works</li>
                  <li>• Course details and advice display</li>
                  <li>• University pages show insights</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">✅ Student Stories</h4>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>• Stories appear in listings</li>
                  <li>• Filtering by country works</li>
                  <li>• Individual story pages load</li>
                  <li>• Academic tips include course advice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
