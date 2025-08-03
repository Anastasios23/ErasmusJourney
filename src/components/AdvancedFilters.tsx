import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Checkbox } from "./ui/checkbox";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  MapPin,
  GraduationCap,
  Calendar,
  Users,
} from "lucide-react";

export interface FilterState {
  searchTerm: string;
  countries: string[];
  universities: string[];
  departments: string[];
  helpTopics: string[];
  exchangeDuration: string;
  levelOfStudy: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: "relevance" | "newest" | "oldest" | "popular";
}

interface AdvancedFiltersProps {
  stories: any[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const DURATION_OPTIONS = [
  { value: "all", label: "Any Duration" },
  { value: "semester", label: "One Semester" },
  { value: "year", label: "Full Year" },
  { value: "summer", label: "Summer Program" },
  { value: "short", label: "Short Term (< 3 months)" },
];

const STUDY_LEVELS = [
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "exchange", label: "Exchange Program" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
];

export default function AdvancedFilters({
  stories,
  filters,
  onFiltersChange,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values from stories for filter options
  const filterOptions = useMemo(() => {
    const countries = new Set<string>();
    const universities = new Set<string>();
    const departments = new Set<string>();
    const helpTopics = new Set<string>();

    stories.forEach((story) => {
      if (story.country) countries.add(story.country);
      if (story.university) universities.add(story.university);
      if (story.department) departments.add(story.department);
      if (story.helpTopics) {
        story.helpTopics.forEach((topic: string) => helpTopics.add(topic));
      }
    });

    return {
      countries: Array.from(countries).sort(),
      universities: Array.from(universities).sort(),
      departments: Array.from(departments).sort(),
      helpTopics: Array.from(helpTopics).sort(),
    };
  }, [stories]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateFilter(key, newValues);
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm ||
      filters.countries.length > 0 ||
      filters.universities.length > 0 ||
      filters.departments.length > 0 ||
      filters.helpTopics.length > 0 ||
      filters.exchangeDuration !== "all" ||
      filters.levelOfStudy.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.sortBy !== "relevance"
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  Advanced
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Basic Search */}
        <div className="mb-4">
          <Label htmlFor="main-search" className="sr-only">
            Search stories
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="main-search"
              placeholder="Search by title, content, city, university..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-4">
          <Label htmlFor="sort-select">Sort by</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6 pt-4 border-t">
            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Countries
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                  {filterOptions.countries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={filters.countries.includes(country)}
                        onCheckedChange={() =>
                          toggleArrayFilter("countries", country)
                        }
                      />
                      <Label
                        htmlFor={`country-${country}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4" />
                  Universities
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                  {filterOptions.universities.map((university) => (
                    <div
                      key={university}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`university-${university}`}
                        checked={filters.universities.includes(university)}
                        onCheckedChange={() =>
                          toggleArrayFilter("universities", university)
                        }
                      />
                      <Label
                        htmlFor={`university-${university}`}
                        className="text-sm font-normal cursor-pointer truncate"
                      >
                        {university}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Level of Study</Label>
                <div className="space-y-2 mt-2">
                  {STUDY_LEVELS.map((level) => (
                    <div
                      key={level.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`level-${level.value}`}
                        checked={filters.levelOfStudy.includes(level.value)}
                        onCheckedChange={() =>
                          toggleArrayFilter("levelOfStudy", level.value)
                        }
                      />
                      <Label
                        htmlFor={`level-${level.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="duration-select">Exchange Duration</Label>
                <Select
                  value={filters.exchangeDuration}
                  onValueChange={(value) =>
                    updateFilter("exchangeDuration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Help Topics */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Help Topics
              </Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.helpTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant={
                      filters.helpTopics.includes(topic) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => toggleArrayFilter("helpTopics", topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date-start" className="text-sm">
                    From
                  </Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      updateFilter("dateRange", {
                        ...filters.dateRange,
                        start: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="date-end" className="text-sm">
                    To
                  </Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      updateFilter("dateRange", {
                        ...filters.dateRange,
                        end: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.countries.map((country) => (
                <Badge key={`country-${country}`} variant="secondary">
                  📍 {country}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => toggleArrayFilter("countries", country)}
                  />
                </Badge>
              ))}
              {filters.universities.map((university) => (
                <Badge key={`uni-${university}`} variant="secondary">
                  🎓 {university}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      toggleArrayFilter("universities", university)
                    }
                  />
                </Badge>
              ))}
              {filters.helpTopics.map((topic) => (
                <Badge key={`topic-${topic}`} variant="secondary">
                  💡 {topic}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => toggleArrayFilter("helpTopics", topic)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
