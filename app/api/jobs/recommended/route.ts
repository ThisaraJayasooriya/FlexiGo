import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { db } from "@/lib/db";
import { jobs, applications, workerProfiles, businessProfiles } from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { calculateDistance } from "@/lib/utils";

function isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const worker_id = userData.user.id;

    // Fetch worker profile
    const [worker] = await db
      .select({
        skills: workerProfiles.skills,
        latitude: workerProfiles.latitude,
        longitude: workerProfiles.longitude,
        availability: workerProfiles.availability,
      })
      .from(workerProfiles)
      .where(eq(workerProfiles.user_id, worker_id));

    if (!worker) {
      return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });
    }

    const workerLat = worker.latitude;
    const workerLon = worker.longitude;
    const workerSkills = worker.skills || [];
    const workerAvailability = (worker.availability || "").toLowerCase();

    // Fetch open future jobs
    const today = new Date().toISOString().split("T")[0];

    const jobRows = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        date: jobs.date,
        time: jobs.time,
        working_hours: jobs.working_hours,
        venue: jobs.venue,
        venue_latitude: jobs.venue_latitude,
        venue_longitude: jobs.venue_longitude,
        pay_rate: jobs.pay_rate,
        required_skills: jobs.required_skills,
        created_at: jobs.created_at,
        business_phone: businessProfiles.phone,
      })
      .from(jobs)
      .leftJoin(businessProfiles, eq(jobs.business_id, businessProfiles.user_id))
      .where(and(eq(jobs.status, "open"), gte(jobs.date, today)));

    // Fetch worker's existing applications
    const workerApps = await db
      .select({ job_id: applications.job_id })
      .from(applications)
      .where(eq(applications.worker_id, worker_id));

    const appliedJobIds = new Set(workerApps.map((a) => a.job_id));

    // Filter + score
    const recommendations = jobRows
      .filter((job) => {
        if (appliedJobIds.has(job.id)) return false;

        if (workerAvailability !== "flexible") {
          const jobIsWeekend = isWeekend(job.date);
          if (workerAvailability === "weekdays" && jobIsWeekend) return false;
          if (workerAvailability === "weekends" && !jobIsWeekend) return false;
        }

        if (!job.venue_latitude || !job.venue_longitude) return false;
        if (!workerLat || !workerLon) return false;

        const dist = calculateDistance(workerLat, workerLon, job.venue_latitude, job.venue_longitude);
        if (dist > 25) return false;
        (job as any).distance = dist;

        return true;
      })
      .map((job) => {
        let score = 0;
        const jobSkills = job.required_skills || [];
        if (jobSkills.length > 0) {
          const matches = jobSkills.filter((s) => workerSkills?.includes(s));
          score += (matches.length / jobSkills.length) * 70;
        } else {
          score += 35;
        }
        const distance = (job as any).distance;
        if (distance <= 5) score += 30;
        else if (distance <= 10) score += 20;
        else if (distance <= 20) score += 10;

        return { ...job, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json({ jobs: recommendations });
  } catch (err: any) {
    console.error("Recommendation Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
