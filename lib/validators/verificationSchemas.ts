// lib/validators/verificationSchemas.ts
//
// PURPOSE: Zod validation schemas for the business verification submission endpoint.
//   These validate the TEXT fields of the multipart form submission.
//   File validation (certificate upload) is handled separately in the route handler.

import { z } from "zod";

export const verificationSubmitSchema = z.object({
  // Which type of registration does this business have?
  business_reg_type: z.enum(["pvt_ltd", "sole_proprietorship"], {
    message: "Registration type must be 'pvt_ltd' or 'sole_proprietorship'",
  }),

  // The Business Registration Number printed on the certificate (e.g. PV00234567)
  br_number: z
    .string()
    .min(3, "Business Registration Number is required")
    .max(50, "BR Number must be 50 characters or fewer")
    .trim(),

  // Legal name of the business exactly as it appears on the certificate
  registered_name: z
    .string()
    .min(2, "Registered business name is required")
    .max(200, "Name must be 200 characters or fewer")
    .trim(),

  // Address on the certificate — optional but recommended
  registered_address: z.string().max(500).trim().optional(),

  // National Identity Card number of the owner — required for sole proprietorships,
  // optional (but useful) for Pvt Ltd submissions
  owner_nic: z.string().max(12).trim().optional(),
});

export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;
