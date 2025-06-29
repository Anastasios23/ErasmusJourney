import Link from "next/link";
import { Card } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  image: string;
  href: string;
  color: string;
}

const StepCard = ({
  step,
  title,
  description,
  image,
  href,
  color,
}: StepCardProps) => {
  return (
    <Link href={href} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="aspect-video relative">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className={`${color} text-white border-0`}
            >
              Step {step}
            </Badge>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
            Learn more
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default StepCard;
