// app/components/SkillSelector.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import type { SkillCategory } from "@/lib/skills/skillCategories";

interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  error?: string;
}

export default function SkillSelector({
  selectedSkills,
  onChange,
  maxSkills = 10,
  error,
}: SkillSelectorProps) {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch skill categories from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/skills");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Filter skills based on search and category
  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        skills: category.skills.filter((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(
        (category) =>
          (selectedCategory === "All" || category.name === selectedCategory) &&
          category.skills.length > 0
      );
  }, [categories, searchQuery, selectedCategory]);

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      // Remove skill
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      // Add skill if under limit
      if (selectedSkills.length < maxSkills) {
        onChange([...selectedSkills, skill]);
      }
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onChange(selectedSkills.filter((s) => s !== skill));
  };

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-[#124E66] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#124E66] text-white text-sm rounded-lg hover:bg-[#0d3a4d] transition-colors"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Skill Count & Limit */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {selectedSkills.length} / {maxSkills} skills selected
        </span>
        {selectedSkills.length >= maxSkills && (
          <span className="text-orange-600 font-medium">Maximum reached</span>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm sm:text-base focus:outline-none focus:border-[#124E66] focus:ring-4 focus:ring-[#124E66]/10 transition-all duration-200"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categoryNames.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? "bg-[#124E66] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Skills Selection Dropdown */}
      {isDropdownOpen && (
        <div className="relative">
          <div className="absolute z-10 w-full max-h-80 overflow-y-auto bg-white border-2 border-gray-200 rounded-xl shadow-xl">
            {filteredCategories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No skills found matching "{searchQuery}"
              </div>
            ) : (
              <div className="p-2">
                {filteredCategories.map((category) => (
                  <div key={category.name} className="mb-4 last:mb-0">
                    {selectedCategory === "All" && (
                      <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </h4>
                    )}
                    <div className="space-y-1">
                      {category.skills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        const isDisabled =
                          !isSelected && selectedSkills.length >= maxSkills;

                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            disabled={isDisabled}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                              isSelected
                                ? "bg-[#124E66] text-white font-medium"
                                : isDisabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{skill}</span>
                              {isSelected && (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-3">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show dropdown button when closed */}
      {!isDropdownOpen && (
        <button
          type="button"
          onClick={() => setIsDropdownOpen(true)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:border-[#124E66] hover:bg-gray-50 transition-all flex items-center justify-between"
        >
          <span>Click to select skills</span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
