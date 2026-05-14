import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { jobs } from "@/db/schema";
import { createJobSchema } from "@/lib/validators/jobSchemas";
import type { ZodIssue } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((err: ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = userData.user.id;
    const d = parsed.data;

    await db.insert(jobs).values({
      business_id: user_id,
      title: d.title,
      date: d.date,
      time: d.time,
      working_hours: d.workingHours ? parseFloat(d.workingHours) : null,
      venue: d.venue,
      venue_address: d.venueAddress,
      venue_city: d.venueCity,
      venue_district: d.venueDistrict,
      venue_latitude: d.venueLatitude,
      venue_longitude: d.venueLongitude,
      pay_rate: d.payRate,
      required_skills: d.requiredSkills || [],
      number_of_workers: d.workerCount,
      status: "open",
    });

    return NextResponse.json({ message: "Job created successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
