import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";
import { 
  ChevronRight,
  CheckCircle, 
  Clock,
  BookOpen,
  Users,
  Home,
  Euro,
  ArrowRight,
  Lightbulb,
  X,
  Target,
  Map,
  Compass
} from "lucide-react";

// Journey Steps Configuration
const JOURNEY_STEPS = [
  {
    id: 'basic-info',
    title: 'Personal Information',
    description: 'Academic background and mobility details',
    href: '/basic-information',
    icon: BookOpen,
    estimatedTime: '10 min'
  },
  {
    id: 'course-matching',
    title: 'Course Matching', 
    description: 'Select courses and universities',
    href: '/course-matching',
    icon: BookOpen,
    estimatedTime: '15 min'
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    description: 'Housing preferences and budget',
    href: '/accommodation',
    icon: Home,
    estimatedTime: '10 min'
  },
  {
    id: 'living-expenses',
    title: 'Living Expenses',
    description: 'Budget planning and costs',
    href: '/living-expenses', 
    icon: Euro,
    estimatedTime: '5 min'
  }
];

// User Journey Progress Tracker
interface JourneyProgressProps {
  currentStep?: string;
  completedSteps?: string[];
  variant?: 'horizontal' | 'vertical' | 'minimal';
  className?: string;
}

export function JourneyProgress({ 
  currentStep, 
  completedSteps = [], 
  variant = 'horizontal',
  className 
}: JourneyProgressProps) {
  const totalSteps = JOURNEY_STEPS.length;
  const progressPercentage = (completedSteps.length / totalSteps) * 100;
  
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-gray-600", className)}>
        <div className="flex items-center gap-1">
          <Progress value={progressPercentage} className="w-20 h-2" />
          <span className="font-medium">{completedSteps.length}/{totalSteps}</span>
        </div>
        <span>Application Progress</span>
      </div>
    );
  }
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Application Journey</CardTitle>
          <Badge variant="outline">
            {completedSteps.length}/{totalSteps} Complete
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "gap-4",
          variant === 'horizontal' ? "grid grid-cols-2 lg:grid-cols-4" : "space-y-3"
        )}>
          {JOURNEY_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isNext = !isCompleted && !isCurrent && 
              (index === 0 || completedSteps.includes(JOURNEY_STEPS[index - 1].id));
            
            const StepIcon = step.icon;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all",
                  isCompleted && "border-green-200 bg-green-50",
                  isCurrent && "border-blue-200 bg-blue-50",
                  isNext && "border-yellow-200 bg-yellow-50",
                  !isCompleted && !isCurrent && !isNext && "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    isCompleted && "bg-green-600 text-white",
                    isCurrent && "bg-blue-600 text-white", 
                    isNext && "bg-yellow-500 text-white",
                    !isCompleted && !isCurrent && !isNext && "bg-gray-400 text-white"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    {(isCurrent || isNext) && (
                      <div className="mt-2">
                        <Link href={step.href}>
                          <Button size="sm" variant={isCurrent ? "default" : "outline"}>
                            {isCurrent ? "Continue" : "Start"}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                    {step.estimatedTime && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {step.estimatedTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Contextual Tips Component
interface ContextualTipProps {
  title: string;
  content: string;
  actions?: Array<{
    text: string;
    href: string;
    variant?: 'default' | 'outline';
  }>;
  type?: 'tip' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
  className?: string;
}

export function ContextualTip({ 
  title, 
  content, 
  actions,
  type = 'tip',
  dismissible = true,
  className 
}: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  const typeStyles = {
    tip: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900", 
    info: "bg-gray-50 border-gray-200 text-gray-900",
    success: "bg-green-50 border-green-200 text-green-900"
  };
  
  const typeIcons = {
    tip: Lightbulb,
    warning: Target,
    info: Compass, 
    success: CheckCircle
  };
  
  const TypeIcon = typeIcons[type];
  
  return (
    <div className={cn(
      "border rounded-lg p-4",
      typeStyles[type],
      className
    )}>
      <div className="flex items-start gap-3">
        <TypeIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium mb-2">{title}</h4>
          <p className="text-sm mb-3">{content}</p>
          
          {actions && actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button 
                    size="sm" 
                    variant={action.variant || 'default'}
                    className="text-xs"
                  >
                    {action.text}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {dismissible && (
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Quick Start Guide
interface QuickStartGuideProps {
  userType?: 'new' | 'returning' | 'explorer';
  className?: string;
}

export function QuickStartGuide({ userType = 'new', className }: QuickStartGuideProps) {
  const guides = {
    new: {
      title: "New to Erasmus? Start Here",
      steps: [
        { text: "Explore destinations", href: "/destinations", icon: Map },
        { text: "Read student stories", href: "/student-stories", icon: Users },
        { text: "Check university partnerships", href: "/university-exchanges", icon: BookOpen },
        { text: "Start your application", href: "/basic-information", icon: Target }
      ]
    },
    returning: {
      title: "Welcome Back! Continue Your Journey", 
      steps: [
        { text: "Complete your application", href: "/basic-information", icon: Target },
        { text: "Find accommodation", href: "/student-accommodations", icon: Home },
        { text: "Connect with mentors", href: "/community", icon: Users },
        { text: "Join our community", href: "/community", icon: Users }
      ]
    },
    explorer: {
      title: "Exploring Your Options?",
      steps: [
        { text: "Browse 500+ destinations", href: "/destinations", icon: Map },
        { text: "Compare universities", href: "/university-exchanges", icon: BookOpen },
        { text: "Read real experiences", href: "/student-stories", icon: Users },
        { text: "Calculate costs", href: "/student-accommodations", icon: Euro }
      ]
    }
  };
  
  const guide = guides[userType];
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Compass className="h-5 w-5 text-blue-600" />
          {guide.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guide.steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Link key={index} href={step.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                  <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200">
                    <StepIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-900">
                    {step.text}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 ml-auto" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Page Context Breadcrumb
interface PageContextProps {
  currentPage: string;
  parentPages?: Array<{ name: string; href: string }>;
  className?: string;
}

export function PageContext({ currentPage, parentPages = [], className }: PageContextProps) {
  return (
    <nav className={cn("flex items-center gap-2 text-sm text-gray-600 mb-6", className)}>
      <Link href="/" className="hover:text-blue-600">
        Home
      </Link>
      {parentPages.map((page, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          <Link href={page.href} className="hover:text-blue-600">
            {page.name}
          </Link>
        </React.Fragment>
      ))}
      <ChevronRight className="h-4 w-4" />
      <span className="text-gray-900 font-medium">{currentPage}</span>
    </nav>
  );
}

// Smart Banner for contextual guidance
interface SmartBannerProps {
  message: string;
  action?: {
    text: string;
    href: string;
  };
  type?: 'info' | 'success' | 'warning';
  className?: string;
}

export function SmartBanner({ message, action, type = 'info', className }: SmartBannerProps) {
  const typeStyles = {
    info: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-500 text-black"
  };
  
  return (
    <div className={cn(
      "px-4 py-3 text-center text-sm font-medium",
      typeStyles[type],
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <span>{message}</span>
        {action && (
          <Link href={action.href}>
            <Button 
              size="sm" 
              variant={type === 'warning' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {action.text}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
