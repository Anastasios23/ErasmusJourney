import Link from "next/link";
import Image from "next/image";
import { Card } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { ArrowRight, CheckCircle } from "lucide-react";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  image: string;
  href: string;
  color: string;
  completed?: boolean;
  current?: boolean;
}

const StepCard = ({
  step,
  title,
  description,
  image,
  href,
  color,
  completed = false,
  current = false,
}: StepCardProps) => {
  const getStepLabel = () => {
    if (completed) return `Step ${step} - Completed`;
    if (current) return `Step ${step} - Current`;
    return `Step ${step}`;
  };

  return (
    <Link
      href={href}
      className="group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      aria-label={`${getStepLabel()}: ${title}`}
    >
      <Card
        className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
          current ? "ring-2 ring-blue-300 shadow-lg" : ""
        } ${completed ? "ring-2 ring-green-300" : ""}`}
        role="article"
      >
        <div className="aspect-video relative">
          <Image
            src={image}
            alt={`${title} - Visual guide for step ${step}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`${color} text-white border-0 flex items-center gap-1`}
            >
              {completed && (
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
              )}
              <span>Step {step}</span>
              {completed && <span className="sr-only">- Completed</span>}
              {current && <span className="sr-only">- Current step</span>}
            </Badge>
          </div>
          {current && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-600 text-white animate-pulse">
                Current
              </Badge>
            </div>
          )}
          {completed && (
            <div className="absolute inset-0 bg-green-600/10 flex items-center justify-center">
              <div className="bg-green-600 rounded-full p-2">
                <CheckCircle
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
            {current && <span className="sr-only"> (current step)</span>}
            {completed && <span className="sr-only"> (completed)</span>}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            {completed ? "Review" : current ? "Continue" : "Learn more"}
            <ArrowRight
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default StepCard;
