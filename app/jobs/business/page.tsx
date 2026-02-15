"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/app/components/ui/Toast";

import BottomNav, { NavItem } from "@/app/components/BottomNav";
import LoadingWave from "@/app/components/ui/LoadingWave";
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
  created_at: string;
  application_count?: number;
  accepted_count?: number;
}

interface Applicant {
  application_id: string;
  status: string;
  applied_at: string;
  worker_id: string;
  worker: {
    user_id: string;
    name: string;
    skills: string[];
    availability: string;
  } | null;
}

export default function BusinessJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [selectedJobWorkersNeeded, setSelectedJobWorkersNeeded] = useState(0);
  const [selectedJobAcceptedCount, setSelectedJobAcceptedCount] = useState(0);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const businessNavItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      href: "/dashboard"
    },
    {
      id: "jobs",
      label: "My Jobs",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      href: "/jobs/business"
    },
    {
      id: "create",
      label: "Post Job",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>,
      href: "/jobs/create"
    },
    {
      id: "applications",
      label: "Applications",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      href: "/applications/business"
    },
    {
      id: "profile",
      label: "Profile",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      href: "/profile/business"
    }
  ];



  useEffect(() => {
    fetchJobs();
  }, []);



  const fetchJobs = async () => {
    try {
      const json = await apiClient.get("/api/jobs/business");
      setJobs(json.jobs || []);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to load jobs",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId: string, jobTitle: string) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setSelectedJobWorkersNeeded(job?.number_of_workers || 0);
    setSelectedJobAcceptedCount(job?.accepted_count || 0);
    setShowApplicantsModal(true);
    setLoadingApplicants(true);
    
    try {
      const json = await apiClient.get(`/api/jobs/${jobId}/applicants`);
      setApplicants(json.applicants || []);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to load applicants",
      });
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      await apiClient.patch("/api/applications/update", {
        applicationId,
        status,
      });

      // Update the applicants list locally
      setApplicants(prev => 
        prev.map(app => 
          app.application_id === applicationId 
            ? { ...app, status } 
            : app
        )
      );

      // Update the job's accepted count
      if (selectedJobId) {
        setJobs(prev => 
          prev.map(job => {
            if (job.id === selectedJobId) {
              const oldApplicant = applicants.find(a => a.application_id === applicationId);
              let acceptedCount = job.accepted_count || 0;
              
              // Adjust accepted count based on status change
              if (status === 'accepted' && oldApplicant?.status !== 'accepted') {
                acceptedCount++;
              } else if (status !== 'accepted' && oldApplicant?.status === 'accepted') {
                acceptedCount = Math.max(0, acceptedCount - 1);
              }
              
              // Update modal display if this is the selected job
              setSelectedJobAcceptedCount(acceptedCount);
              
              return {
                ...job,
                accepted_count: acceptedCount
              };
            }
            return job;
          })
        );
      }

      setToast({
        type: "success",
        message: `Application ${status} successfully`,
      });
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to update application",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased">
         {/* Custom Gradient Header Skeleton */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-[#3F72AF] to-[#112D4E] shadow-lg shadow-blue-900/10">
            <div className="max-w-md mx-auto px-5 pt-6 pb-6">
                 <div className="flex items-center justify-between mb-5">
                     <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse"></div>
                     <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse"></div>
                 </div>
                 <div className="h-12 bg-white/10 rounded-xl animate-pulse"></div>
            </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center flex flex-col items-center">
            <LoadingWave />
            <p className="text-sm text-slate-500 font-medium mt-4">Loading your jobs...</p>
          </div>
        </div>
        <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
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
                   <h1 className="text-2xl font-bold text-white leading-none">My Jobs</h1>
                   <p className="text-xs text-blue-100 font-medium mt-1">{filteredJobs.length} active listings</p>
                </div>
             </div>
             
             {/* Post Job Action */}
             <Link
                href="/jobs/create"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
             </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title or venue..."
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
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Removed Page Header since it's now in the sticky header */}

        {/* Stats Summary - Horizontal Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             </div>
             <span className="text-2xl font-bold text-slate-800 leading-none mb-1">{jobs.length}</span>
             <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Total Jobs</span>
           </div>

           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
             </div>
             <span className="text-2xl font-bold text-slate-800 leading-none mb-1">
               {jobs.reduce((sum, job) => sum + (job.accepted_count || 0), 0)}
             </span>
             <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Filled Roles</span>
           </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {searchTerm ? "No matches found" : "No jobs posted yet"}
            </h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[200px] mx-auto leading-relaxed">
              {searchTerm ? "Try adjusting your search terms" : "Create your first job posting to start finding workers."}
            </p>
            {!searchTerm && (
              <Link
                href="/jobs/create"
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
              >
                Create Your First Job
              </Link>
            )}
             {searchTerm && (
               <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
               >
                  Clear Search
               </button>
             )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
                {/* Header */}
                <div className="p-5 pb-4 border-b border-slate-50">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-slate-900 truncate pr-4">{job.title}</h3>
                      <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          (job.application_count ?? 0) > 0 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        {(job.application_count ?? 0) > 0 ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                {job.application_count} Applicants
                            </>
                        ) : 'No Applicants'}
                      </span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>Posted {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                   </div>
                </div>

                {/* Body */}
                <div className="p-5 pt-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4">
                    {/* Date */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Time</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{formatDate(job.date)}</p>
                        <p className="text-xs text-slate-500 font-medium">{job.time}</p>
                      </div>
                    </div>

                    {/* Pay/Workers */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Pay</p>
                        <p className="text-sm font-semibold text-emerald-600">LKR {job.pay_rate}</p>
                        <p className="text-xs text-slate-500 font-medium">{job.accepted_count || 0}/{job.number_of_workers} Staffed</p>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-start gap-2.5 col-span-2">
                       <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 shrink-0">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </div>
                       <div className="min-w-0">
                           <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Venue</p>
                           <p className="text-sm font-semibold text-slate-700 truncate">{job.venue}</p>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => fetchApplicants(job.id, job.title)}
                    className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Manage Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Applicants Modal - Premium */}
      {showApplicantsModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
             onClick={() => setShowApplicantsModal(false)}
           ></div>

           {/* Modal Card */}
           <div 
             className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slideUp"
             onClick={(e) => e.stopPropagation()}
           >
             {/* Header */}
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Applications</h2>
                   <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedJobTitle}</p>
                </div>
                <button
                  onClick={() => setShowApplicantsModal(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>

             {/* Tabs & Stats */}
             <div className="px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
                    {[
                      { id: "all", label: "All", count: applicants.length },
                      { id: "pending", label: "Pending", count: applicants.filter(a => a.status === "pending").length },
                      { id: "accepted", label: "Accepted", count: applicants.filter(a => a.status === "accepted").length },
                      { id: "rejected", label: "Rejected", count: applicants.filter(a => a.status === "rejected").length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                          statusFilter === tab.id
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                </div>
                
                {/* Staffing Progress */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                            <span>Staffing Progress</span>
                            <span>{selectedJobAcceptedCount} / {selectedJobWorkersNeeded} Hired</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-slate-900 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (selectedJobAcceptedCount / selectedJobWorkersNeeded) * 100)}%` }}
                           ></div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Applicant List */}
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
               {loadingApplicants ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <LoadingWave />
                   <p className="text-sm text-slate-500 font-medium mt-4">Loading candidates...</p>
                 </div>
               ) : applicants.length === 0 ? (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">No applications</h3>
                   <p className="text-sm text-slate-500 mt-1">Waiting for workers to apply.</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {(() => {
                      const filtered = statusFilter === "all" ? applicants : applicants.filter(a => a.status === statusFilter);
                      if (filtered.length === 0) return <p className="text-center text-sm text-slate-500 py-8">No {statusFilter} applicants found.</p>;
                      
                      return filtered.map(app => (
                        <div key={app.application_id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                           <div className="flex justify-between items-start mb-3">
                              <div>
                                 <h4 className="font-bold text-slate-900">{app.worker?.name || "Unknown"}</h4>
                                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                                 </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {app.status}
                              </span>
                           </div>
                           
                           {/* Skills */}
                           {app.worker?.skills && (
                             <div className="flex flex-wrap gap-1.5 mb-4">
                               {app.worker.skills.map(s => (
                                 <span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] font-bold border border-slate-100">
                                   {s}
                                 </span>
                               ))}
                             </div>
                           )}
                           
                           {/* Actions */}
                           {app.status === 'pending' && (
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => handleUpdateApplicationStatus(app.application_id, 'accepted')}
                                 className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
                               >
                                 Accept
                               </button>
                               <button 
                                 onClick={() => handleUpdateApplicationStatus(app.application_id, 'rejected')}
                                 className="flex-1 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50"
                               >
                                 Reject
                               </button>
                             </div>
                           )}
                        </div>
                      ));
                   })()}
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
