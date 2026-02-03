// lib/validators/jobSchemas.ts
import { z } from "zod";
import { ALL_VALID_SKILLS } from "@/lib/skills/skillCategories";

export const createJobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  date: z.string(), // ISO date
  time: z.string(), // HH:mm
  venue: z.string().min(3, "Venue must be at least 3 characters"),
  venueAddress: z.string(),
  venueCity: z.string(),
  venueDistrict: z.string(),
  venueLatitude: z.number().min(-90).max(90, "Invalid latitude"),
  venueLongitude: z.number().min(-180).max(180, "Invalid longitude"),
  payRate: z.number().min(0, "Pay rate must be a positive number"),
  requiredSkills: z
    .array(z.string())
    .max(10, "Maximum 10 skills allowed")
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
    )
    .optional(),
  workerCount: z.number().min(1, "At least 1 worker is required"),
  workingHours: z.string().min(1, "Working hours are required"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
