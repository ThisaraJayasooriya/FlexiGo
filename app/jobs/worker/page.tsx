"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/app/components/ui/Toast";
import LoadingWave from "@/app/components/ui/LoadingWave"; // Added import
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
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]); // New State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

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
      href: "/profile/worker"
    }
  ];

  useEffect(() => {
    fetchJobs();
    fetchRecommendedJobs(); // Fetch recommendations
  }, []);

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

  const fetchRecommendedJobs = async () => {
    try {
      const json = await apiClient.get("/api/jobs/recommended");
      setRecommendedJobs(json.jobs || []);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20 font-sans antialiased">
        <div className="text-center flex flex-col items-center">
          <LoadingWave />
          <p className="text-sm text-slate-500 font-medium mt-4">Loading opportunities...</p>
        </div>
        <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Custom Gradient Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#3F72AF] to-[#112D4E] shadow-lg shadow-blue-900/10">
        <div className="max-w-md mx-auto px-5 pt-6 pb-6">
          <div className="flex items-center justify-between mb-5">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                   <h1 className="text-2xl font-bold text-white leading-none">Find Jobs</h1>
                   <p className="text-xs text-blue-100 font-medium mt-1">{filteredJobs.length} opportunities available</p>
                </div>
             </div>
             
             {/* Optional: Profile Icon or Filter Icon could go here */}
             <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 rounded-xl border-none leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:text-sm shadow-lg shadow-black/5"
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
            
            <div className="relative w-1/3">
                 <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="appearance-none block w-full pl-3.5 pr-8 py-3 text-sm bg-white/95 backdrop-blur-sm border-none rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg shadow-black/5"
                >
                  <option value="">Filter</option>
                  {getAllSkills().map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {recommendedJobs.length > 0 && !searchTerm && !selectedSkill && (
        <section className="px-5 pt-4 pb-6 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
                Recommended For You
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top {recommendedJobs.length}</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-5 px-5">
              {recommendedJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="min-w-[280px] group relative bg-slate-900 rounded-[24px] p-5 text-white shadow-xl shadow-slate-900/20 snap-center overflow-hidden transition-transform active:scale-[0.98]"
                >
                    {/* Premium Animated Background */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#3F72AF] rounded-full mix-blend-screen filter blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#112D4E] rounded-full mix-blend-screen filter blur-[40px] opacity-40 group-hover:opacity-50 transition-opacity duration-700 -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex gap-2">
                             {job.has_applied ? (
                               <span className="inline-flex items-center gap-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                  Applied
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-100 uppercase tracking-wide">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                  {(job as any).score ? `${Math.round((job as any).score)}% Match` : 'Best Match'}
                               </span>
                             )}
                           </div>
                        </div>
                        
                        <h3 className="font-bold text-xl leading-tight mb-1 line-clamp-2">{job.title}</h3>
                        <p className="text-slate-400 text-xs font-medium mb-4 flex items-center gap-1.5">
                           <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           {job.venue}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                           <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Pay Rate</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-white">LKR {job.pay_rate}</span>
                                <span className="text-xs text-slate-400 font-medium">/hr</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleApply(job.id)}
                             disabled={job.has_applied}
                             className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${
                                job.has_applied 
                                  ? "bg-white/5 text-slate-400 cursor-not-allowed" 
                                  : "bg-white text-slate-900 hover:bg-blue-50 shadow-white/10"
                             }`}
                           >
                             {job.has_applied ? "View Status" : "Quick Apply"}
                           </button>
                        </div>
                    </div>
                </div>
              ))}
            </div>
        </section>
      )}

      {/* Main Content */}
      <main className="px-5 py-6 max-w-md mx-auto w-full space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
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
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
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
                className={`group relative bg-white rounded-2xl transition-all duration-200 overflow-hidden ${
                  job.has_applied 
                    ? 'border border-slate-100 opacity-75' 
                    : 'border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100'
                }`}
              >
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      {job.has_applied && (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide mb-1.5">
                            Applied
                          </span>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Posted {formatDate(job.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-lg font-extrabold text-[#3F72AF]">
                        LKR {job.pay_rate}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        / Hr
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-50 mb-4" />

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Date & Time</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{formatDate(job.date)}</p>
                        <p className="text-xs text-slate-500 font-medium">{job.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Shift</p>
                        <p className="text-sm font-semibold text-slate-700">{job.working_hours} Hours</p>
                        <p className="text-xs text-slate-500 font-medium">Duration</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 col-span-2">
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Location</p>
                        <p className="text-sm font-semibold text-slate-700 truncate" title={job.venue}>{job.venue}</p>
                      </div>
                    </div>
                  </div>

                   {/* Skills & Action Footer */}
                  <div className="space-y-4">
                     {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={job.has_applied}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all transform active:scale-[0.98] ${
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
