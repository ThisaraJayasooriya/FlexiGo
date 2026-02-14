"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/app/components/ui/Toast";
import Header from "@/app/components/Header";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import { apiClient } from "@/lib/api-client";

interface Job {
  id: string;
  title: string;
  date: string;
  time: string;
  working_hours: string;
  venue: string;
  pay_rate: number;
  required_skills: string[];
  number_of_workers: number;
  business_id: string;
  created_at: string;
  has_applied: boolean;
}

export default function WorkerJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const workerNavItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      href: "/dashboard"
    },
    {
      id: "jobs",
      label: "Jobs",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      href: "/jobs/worker"
    },
    {
      id: "applications",
      label: "Applications",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      href: "/applications/worker"
    },
    {
      id: "profile",
      label: "Profile",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      href: "/profile"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; path=/; max-age=0";
    router.push("/");
  };

  useEffect(() => {
    fetchJobs();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const json = await apiClient.get("/api/workers/profile");
      if (json.profile) {
        setProfileName(json.profile.name || "");
        // Workers don't have profile pictures in the database
        setProfileImage("");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  useEffect(() => {
    filterJobs();
  }, [searchTerm, selectedSkill, jobs]);

  const fetchJobs = async () => {
    try {
      const json = await apiClient.get("/api/jobs/list");
      setJobs(json.jobs || []);
      setFilteredJobs(json.jobs || []);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to load jobs",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by skill
    if (selectedSkill) {
      filtered = filtered.filter((job) =>
        job.required_skills?.includes(selectedSkill)
      );
    }

    setFilteredJobs(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAllSkills = () => {
    const skills = new Set<string>();
    jobs.forEach((job) => {
      job.required_skills?.forEach((skill) => skills.add(skill));
    });
    return Array.from(skills).sort();
  };

  const handleApply = async (jobId: string) => {
    try {
      const json = await apiClient.post("/api/applications/apply", { job_id: jobId });
      setToast({ type: "success", message: "Application submitted successfully!" });
      
      // Update the job in the local state to reflect the applied status
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? { ...job, has_applied: true } : job
        )
      );
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to apply for job"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 pb-20 font-['Inter',sans-serif]">
        <Header 
          title="FlexiGo" 
          subtitle="Worker Portal" 
          userName={profileName}
          userImage={profileImage}
          onProfileClick={() => router.push("/profile")}
          onLogout={handleLogout} 
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-slate-900 mb-3"></div>
            <p className="text-sm text-slate-600 font-medium">Loading jobs...</p>
          </div>
        </div>
        <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <Header 
        title="FlexiGo" 
        subtitle="Worker Portal"
        userName={profileName}
        userImage={profileImage}
        onProfileClick={() => router.push("/profile")}
        onLogout={handleLogout}
      />

      {/* Sticky Header with Search & Filter */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="px-5 py-4 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Find Jobs</h1>
              <p className="text-xs text-slate-500 font-medium">{filteredJobs.length} opportunities available</p>
            </div>
            {/* Filter Toggle or Badge could go here if needed, keeping it clean for now */}
          </div>
          
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by title or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 sm:text-sm transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Skill Filter */}
            <div className="relative">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="appearance-none block w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-shadow shadow-sm cursor-pointer"
              >
                <option value="">All Skills</option>
                {getAllSkills().map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(searchTerm || selectedSkill) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 animate-fadeIn">
              {selectedSkill && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-white shadow-sm">
                  {selectedSkill}
                  <button
                    onClick={() => setSelectedSkill("")}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none"
                  >
                    <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                  >
                     <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={() => { setSearchTerm(""); setSelectedSkill(""); }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium ml-1 underline decoration-slate-300 underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="px-5 py-6 max-w-lg mx-auto w-full">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 ring-4 ring-white shadow-sm">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {jobs.length === 0 ? "No jobs available yet" : "No matches found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-[260px] mx-auto mb-8 leading-relaxed">
              {jobs.length === 0 
                ? "We'll notify you when new opportunities arrive in your area." 
                : "Try adjusting your search terms or filters to find what you're looking for."}
            </p>
            {(searchTerm || selectedSkill) && (
              <button
                onClick={() => { setSearchTerm(""); setSelectedSkill(""); }}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200/50 active:scale-[0.98] transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  job.has_applied 
                    ? 'border-slate-100 opacity-75 grayscale-[0.5]' 
                    : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                }`}
              >
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <span>Posted {formatDate(job.created_at)}</span>
                        {job.has_applied && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wide">
                            Applied
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-lg font-bold text-emerald-600">
                        LKR {job.pay_rate}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Per Hour
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-50 mb-4" />

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Date & Time</p>
                        <p className="text-sm font-medium text-slate-700 truncate">{formatDate(job.date)}</p>
                        <p className="text-xs text-slate-500">{job.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Duration</p>
                        <p className="text-sm font-medium text-slate-700">{job.working_hours} Hours</p>
                        <p className="text-xs text-slate-500">Shift</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Location</p>
                        <p className="text-sm font-medium text-slate-700 truncate" title={job.venue}>{job.venue}</p>
                      </div>
                    </div>

                     <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Team</p>
                        <p className="text-sm font-medium text-slate-700">{job.number_of_workers} Needed</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Action Footer */}
                  <div className="flex flex-col gap-4">
                     {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={job.has_applied}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all transform active:scale-[0.99] ${
                        job.has_applied
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5"
                      }`}
                    >
                      {job.has_applied ? "Application Sent" : "Apply Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
