import {
  pgTable,
  uuid,
  text,
  boolean,
  real,
  integer,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// user_roles
// Stores the role (worker | business) and onboarding state for each user.
// user_id references auth.users (Supabase-managed, no FK needed here).
// ---------------------------------------------------------------------------
export const userRoles = pgTable("user_roles", {
  user_id: uuid("user_id").primaryKey(),
  role: text("role").notNull(),                          // "worker" | "business"
  first_login_complete: boolean("first_login_complete").notNull().default(false),
});

// ---------------------------------------------------------------------------
// worker_profiles
// ---------------------------------------------------------------------------
export const workerProfiles = pgTable("worker_profiles", {
  user_id:           uuid("user_id").primaryKey(),
  name:              text("name"),
  phone:             text("phone"),
  skills:            text("skills").array(),
  availability:      text("availability"),               // "flexible" | "weekdays" | "weekends"
  city:              text("city"),
  district:          text("district"),
  latitude:          real("latitude"),
  longitude:         real("longitude"),
  formatted_address: text("formatted_address"),
});

// ---------------------------------------------------------------------------
// business_profiles
// ---------------------------------------------------------------------------
export const businessProfiles = pgTable("business_profiles", {
  user_id:          uuid("user_id").primaryKey(),
  company_name:     text("company_name"),
  description:      text("description"),
  logo_url:         text("logo_url"),
  business_type:    text("business_type"),
  location:         text("location"),
  phone:            text("phone"),
  website:          text("website"),
  years_experience: integer("years_experience"),
  social_links:     jsonb("social_links").default([]),
});

// ---------------------------------------------------------------------------
// jobs
// ---------------------------------------------------------------------------
export const jobs = pgTable("jobs", {
  id:               uuid("id").primaryKey().defaultRandom(),
  business_id:      uuid("business_id").notNull(),
  title:            text("title").notNull(),
  date:             text("date").notNull(),              // stored as YYYY-MM-DD string
  time:             text("time"),
  working_hours:    real("working_hours"),
  venue:            text("venue"),
  venue_address:    text("venue_address"),
  venue_city:       text("venue_city"),
  venue_district:   text("venue_district"),
  venue_latitude:   real("venue_latitude"),
  venue_longitude:  real("venue_longitude"),
  pay_rate:         real("pay_rate"),
  required_skills:  text("required_skills").array(),
  number_of_workers: integer("number_of_workers").notNull().default(1),
  status:           text("status").notNull().default("open"), // "open"|"closed"|"cancelled"|"filled"
  created_at:       timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------------------------------------------------------------------------
// applications
// Unique on (job_id, worker_id) prevents duplicate applications.
// ---------------------------------------------------------------------------
export const applications = pgTable(
  "applications",
  {
    id:        uuid("id").primaryKey().defaultRandom(),
    job_id:    uuid("job_id").notNull(),
    worker_id: uuid("worker_id").notNull(),
    status:    text("status").notNull().default("pending"), // "pending"|"accepted"|"rejected"|"withdrawn"
    applied_at: timestamp("applied_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.job_id, t.worker_id)]
);

// TypeScript types inferred from schema
export type UserRole         = typeof userRoles.$inferSelect;
export type WorkerProfile    = typeof workerProfiles.$inferSelect;
export type BusinessProfile  = typeof businessProfiles.$inferSelect;
export type Job              = typeof jobs.$inferSelect;
export type Application      = typeof applications.$inferSelect;
