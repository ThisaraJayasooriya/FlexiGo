// lib/validators/jobSchemas.ts
import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3),
  date: z.string(), // ISO date
  time: z.string(), // HH:mm
  venue: z.string().min(3),
  payRate: z.number().min(0),
  requiredSkills: z.array(z.string()).optional(),
  workerCount: z.number().min(1),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
