// lib/validators/workerSchemas.ts
import { z } from "zod";
import { ALL_VALID_SKILLS, MAX_SKILLS } from "@/lib/skills/skillCategories";

// Worker profile creation schema with separate location fields
export const createWorkerProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name must contain only letters, spaces, hyphens, and apostrophes"),
  
  skills: z
    .array(z.string())
    .min(1, "At least one skill is required")
    .max(MAX_SKILLS, `Maximum ${MAX_SKILLS} skills allowed`)
    .refine(
      (skills) => {
        // Check for duplicates
        const uniqueSkills = new Set(skills);
        return uniqueSkills.size === skills.length;
      },
      { message: "Duplicate skills are not allowed" }
    )
    .refine(
      (skills) => {
        // Validate each skill against predefined list
        return skills.every((skill) => ALL_VALID_SKILLS.includes(skill));
      },
      { message: "One or more skills are not valid. Please select from the predefined list." }
    ),
  
  availability: z.enum(["Weekdays", "Weekends", "Full-time", "Flexible"], {
    message: "Please select a valid availability option",
  }),

  // Separate location fields for better query performance
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  formattedAddress: z.string().optional(),
});

// Worker profile update schema (allows partial updates)
export const updateWorkerProfileSchema = createWorkerProfileSchema.partial();

// Export types
export type CreateWorkerProfileInput = z.infer<typeof createWorkerProfileSchema>;
export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>;
