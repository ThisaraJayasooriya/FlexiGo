import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateDistance } from "@/lib/utils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

// Helper to determine if a date is a weekend (Saturday or Sunday)
function isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

export async function GET(req: Request) {
  try {
    // 1. Authenticate User
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const worker_id = userData.user.id;

    // 2. Fetch Worker Profile
    const { data: worker, error: workerErr } = await supabaseAdmin
      .from("worker_profiles")
      .select("skills, latitude, longitude, availability")
      .eq("user_id", worker_id)
      .single();

    if (workerErr || !worker) {
      return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });
    }

    const workerLat = worker.latitude;
    const workerLon = worker.longitude;
    const workerSkills = worker.skills || [];
    // Normalize availability to lowercase for comparison
    const workerAvailability = (worker.availability || "").toLowerCase(); 

    // 3. Fetch Candidate Jobs (Open & Future Dates)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // We fetch ALL open jobs >= today and filter in memory for complex logic
    // This is acceptable for MVP scale. For scale, PostGIS is better.
    const { data: jobs, error: jobsErr } = await supabaseAdmin
      .from("jobs")
      .select(`
        id,
        title,
        date,
        time,
        working_hours,
        venue,
        venue_latitude,
        venue_longitude,
        pay_rate,
        required_skills,
        created_at,
        applications (worker_id)
      `)
      .eq("status", "open")
      .gte("date", today);

    if (jobsErr) {
      return NextResponse.json({ error: jobsErr.message }, { status: 500 });
    }

    // 4. Apply Hard Filters & Scoring
    const recommendations = jobs
      .filter((job: any) => {
        // --- HARD FILTER 1: Already Applied ---
        const hasApplied = job.applications?.some((app: any) => app.worker_id === worker_id);
        if (hasApplied) return false;

        // --- HARD FILTER 2: Availability ---
        // 'flexible' worker -> sees everything
        // 'weekdays' worker -> sees only Mon-Fri
        // 'weekends' worker -> sees only Sat-Sun
        if (workerAvailability !== "flexible") {
           const jobIsWeekend = isWeekend(job.date);
           if (workerAvailability === "weekdays" && jobIsWeekend) return false;
           if (workerAvailability === "weekends" && !jobIsWeekend) return false;
        }

        // --- HARD FILTER 3: Distance ---
        if (workerLat && workerLon && job.venue_latitude && job.venue_longitude) {
            const dist = calculateDistance(workerLat, workerLon, job.venue_latitude, job.venue_longitude);
            if (dist > 25) return false; // Max 25km radius
            (job as any).distance = dist; // Attach for scoring/sorting
        } else {
            // If location is missing on either side, we can arguably keep it or drop it.
            // For this strict recommendation engine, let's keep it but penalize distance score,
            // OR strictly drop if user required distance. 
            // The prompt said "Distance < 25km (max threshold)". 
            // If we don't know the distance, we can't verify it's < 25km.
            // However, rejecting jobs with missing coords might hide valid jobs if data is imperfect.
            // Let's being strict as requested:
            if (!job.venue_latitude || !job.venue_longitude) return false;
            // If worker has no location, they can't use this feature effectively, but let's assume they do.
             if (!workerLat || !workerLon) return false;
        }

        return true;
      })
      .map((job: any) => {
        // 5. Scoring
        let score = 0;

        // Skill Match (100 points max)
        const jobSkills = job.required_skills || [];
        if (jobSkills.length > 0) {
            const matches = jobSkills.filter((s: string) => workerSkills.includes(s));
            score += (matches.length / jobSkills.length) * 70;
        } else {
            // If job has no skill requirements, it's a general match -> medium score
            score += 35; 
        }

        // Distance Decay (Bonus points for being very close)
        // < 5km: +30, < 10km: +20, < 20km: +10
        if (job.distance <= 5) score += 30;
        else if (job.distance <= 10) score += 20;
        else if (job.distance <= 20) score += 10;

        return { ...job, score };
      })
      .sort((a: any, b: any) => b.score - a.score) // Descending score
      .slice(0, 5); // Top 5

    return NextResponse.json({ jobs: recommendations });

  } catch (err: any) {
    console.error("Recommendation Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
