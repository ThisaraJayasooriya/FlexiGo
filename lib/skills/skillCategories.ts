// lib/skills/skillCategories.ts

export interface Skill {
  name: string;
  category: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Event & Hospitality Skills",
    skills: [
      "Event Setup & Breakdown",
      "Guest Assistance",
      "Crowd Management",
      "Ushering",
      "Stage Assistance",
      "Catering Support",
      "Food Serving",
      "Basic Bar Service",
      "Ticket Handling",
    ],
  },
  {
    name: "Customer Service & Sales",
    skills: [
      "Customer Support",
      "Cash Handling",
      "Point of Sale (POS) Operation",
      "Product Promotion",
      "Brand Ambassador",
      "Retail Sales Assistance",
      "Complaint Handling",
    ],
  },
  {
    name: "Logistics & Delivery",
    skills: [
      "Package Delivery",
      "Route Navigation",
      "Time Management",
      "Vehicle Handling (Bike/Car)",
      "Loading & Unloading",
      "Inventory Assistance",
    ],
  },
  {
    name: "Technical & Digital Support",
    skills: [
      "Audio/Visual Setup",
      "Basic IT Support",
      "Photography Assistance",
      "Videography Assistance",
      "Live Streaming Support",
      "Social Media Content Support",
    ],
  },
  {
    name: "Operations & General Support",
    skills: [
      "Cleaning & Maintenance",
      "Office Assistance",
      "Data Entry",
      "Administrative Support",
      "Queue Management",
      "Stock Arrangement",
    ],
  },
  {
    name: "Soft Skills",
    skills: [
      "Communication Skills",
      "Teamwork",
      "Problem Solving",
      "Punctuality",
      "Adaptability",
      "Leadership (Basic)",
    ],
  },
];

// Flatten all skills for validation
export const ALL_VALID_SKILLS: string[] = SKILL_CATEGORIES.flatMap(
  (category) => category.skills
);

/** Maximum number of skills a worker may select. */
export const MAX_SKILLS = 10;

/** Returns the category name for a skill, or null if the skill is not in the catalog. */
export function getCategoryForSkill(skillName: string): string | null {
  for (const category of SKILL_CATEGORIES) {
    if (category.skills.includes(skillName)) {
      return category.name;
    }
  }
  return null;
}

/**
 * Validates a skills array against the predefined catalog.
 * Checks count limits, duplicates, and unknown skill names.
 */
export function validateSkills(skills: string[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(skills)) {
    errors.push("Skills must be an array");
    return { isValid: false, errors };
  }

  if (skills.length === 0) {
    errors.push("At least one skill is required");
  }

  if (skills.length > MAX_SKILLS) {
    errors.push(`Maximum ${MAX_SKILLS} skills allowed`);
  }

  // Check for duplicates
  const uniqueSkills = new Set(skills);
  if (uniqueSkills.size !== skills.length) {
    errors.push("Duplicate skills are not allowed");
  }

  // Validate each skill against predefined list
  const invalidSkills = skills.filter((skill) => !ALL_VALID_SKILLS.includes(skill));
  if (invalidSkills.length > 0) {
    errors.push(`Invalid skills: ${invalidSkills.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/** Maps skill names to `{ name, category }` objects for storage/display. */
export function enrichSkillsWithCategories(skills: string[]): Skill[] {
  return skills.map((skillName) => ({
    name: skillName,
    category: getCategoryForSkill(skillName) || "Unknown",
  }));
}
