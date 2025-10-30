import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "../lib/utils";

interface University {
  id: string;
  code: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  type: string;
}

interface UniversitySearchProps {
  label: string;
  value: string;
  onSelect: (universityId: string, universityName: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: "cyprus" | "international" | "all";
  country?: string;
  disabled?: boolean;
}

export function UniversitySearch({
  label,
  value,
  onSelect,
  placeholder = "Search for a university...",
  required = false,
  error,
  type = "all",
  country,
  disabled = false,
}: UniversitySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for universities
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: searchQuery });
        if (type !== "all") params.append("type", type);
        if (country) params.append("country", country);

        const response = await fetch(
          `/api/universities/search?${params.toString()}`,
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Error searching universities:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, type, country]);

  const handleSelect = (university: University) => {
    setSelectedUniversity(university);
    setSearchQuery("");
    setShowDropdown(false);
    onSelect(university.id, university.name);
  };

  const handleClear = () => {
    setSelectedUniversity(null);
    setSearchQuery("");
    setResults([]);
    onSelect("", "");
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {selectedUniversity ? (
        // Show selected university
        <div
          className={cn(
            "flex items-center justify-between p-3 border rounded-md bg-white",
            error && "border-red-500",
          )}
        >
          <div className="flex-1">
            <div className="font-medium">{selectedUniversity.name}</div>
            <div className="text-sm text-gray-500">
              {selectedUniversity.city}, {selectedUniversity.country}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      ) : (
        // Show search input
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn("pl-10 pr-10", error && "border-red-500")}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Dropdown with results */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {results.map((university) => (
                <button
                  key={university.id}
                  type="button"
                  onClick={() => handleSelect(university)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="font-medium">{university.name}</div>
                  <div className="text-sm text-gray-500">
                    {university.city}, {university.country}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown &&
            searchQuery.length >= 2 &&
            !loading &&
            results.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500 text-sm">
                No universities found. Try a different search term.
              </div>
            )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
