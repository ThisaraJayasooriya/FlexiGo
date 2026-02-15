"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import Toast from "@/app/components/ui/Toast";
import LoadingWave from "@/app/components/ui/LoadingWave";
import { apiClient } from "@/lib/api-client";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  jobs: {
    id: string;
    title: string;
    date: string;
    venue: string;
    pay_rate: number;
    business_id: string;
  };
  worker_profiles: {
    user_id: string;
    name: string;
    skills: string[];
    availability: string;
  };
}

interface AcceptanceStatus {
  jobId: string;
  requiredWorkers: number;
  acceptedCount: number;
  canAcceptMore: boolean;
  remainingSlots: number;
  isFullyStaffed: boolean;
}

export default function BusinessApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applications"); // Note: NavItem ID for applications might be different, let's check
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [acceptanceStatus, setAcceptanceStatus] = useState<AcceptanceStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Business Nav Items - adjusted to match the business dashboard structure
  // In the real app, these might be centralized, but here we define them locally as per previous patterns
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
      href: "/jobs/create",
      elevated: true
    },
    {
      id: "profile",
      label: "Profile",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      href: "/profile"
    }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const json = await apiClient.get("/api/applications/business");
      setApplications(json.applications || []);
      setLoading(false);
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedApplication(null);
    setAcceptanceStatus(null);
  };

  const fetchAcceptanceStatus = async (jobId: string) => {
    setLoadingStatus(true);
    try {
      const json = await apiClient.get(`/api/jobs/${jobId}/acceptance-status`);
      setAcceptanceStatus(json);
    } catch (error: any) {
      console.error("Failed to fetch acceptance status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: "accepted" | "rejected") => {
    if (status === "accepted" && acceptanceStatus && !acceptanceStatus.canAcceptMore) {
      setToast({ 
        type: "error", 
        message: `Job is full. Accepted ${acceptanceStatus.acceptedCount}/${acceptanceStatus.requiredWorkers} workers.` 
      });
      return;
    }

    setProcessing(applicationId);
    try {
      const json = await apiClient.patch("/api/applications/update", { applicationId, status });
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status } : app
      ));
      
      // Update acceptance status after accepting
      if (status === "accepted" && selectedApplication) {
        await fetchAcceptanceStatus(selectedApplication.jobs.id);
        if (json.staffingInfo) {
          setAcceptanceStatus({
            jobId: selectedApplication.jobs.id,
            requiredWorkers: json.staffingInfo.requiredWorkers,
            acceptedCount: json.staffingInfo.acceptedCount,
            canAcceptMore: !json.staffingInfo.isFullyStaffed,
            remainingSlots: json.staffingInfo.remainingSlots,
            isFullyStaffed: json.staffingInfo.isFullyStaffed
          });
        }
      }
      
      setToast({ type: "success", message: `Application ${status} successfully!` });
      // Don't close modal immediately so user can see the result, or close if you prefer
      if (status === "rejected") closeModal();
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      app.worker_profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
     return (
       <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased">
          {/* Header Skeleton */}
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
             <p className="text-sm text-slate-500 font-medium mt-4">Loading applications...</p>
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
                   <h1 className="text-2xl font-bold text-white leading-none">Applications</h1>
                   <p className="text-xs text-blue-100 font-medium mt-1">{applications.length} total received</p>
                </div>
             </div>
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
              placeholder="Search candidate or job..."
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
        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {["all", "pending", "accepted", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  filterStatus === status
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} <span className="opacity-70 ml-1">({applications.filter(a => status === "all" || a.status === status).length})</span>
              </button>
            ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
            <p className="text-sm text-slate-500 max-w-[200px] mx-auto leading-relaxed">
              {filterStatus === "all" 
                ? "Wait for workers to apply to your jobs." 
                : `No applications with status "${filterStatus}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div 
                key={app.id}
                onClick={() => {
                  setSelectedApplication(app);
                  fetchAcceptanceStatus(app.jobs.id);
                }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group relative"
              >
                <div className="p-5">
                  {/* Card Header: Worker Name & Status */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shrink-0">
                           {app.worker_profiles.name.charAt(0)}
                        </div>
                        <div>
                           <h3 className="text-base font-bold text-slate-900 leading-tight">{app.worker_profiles.name}</h3>
                           <p className="text-xs text-slate-500 font-medium mt-0.5">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {app.status}
                      </span>
                  </div>

                  {/* Job Info */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applied For</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">LKR {app.jobs.pay_rate}/hr</span>
                     </div>
                     <p className="text-sm font-bold text-slate-700 truncate">{app.jobs.title}</p>
                     <p className="text-xs text-slate-500 truncate">{app.jobs.venue}</p>
                  </div>

                  {/* Skills Tag Cloud */}
                  {app.worker_profiles.skills.length > 0 && (
                     <div className="flex flex-wrap gap-1.5">
                        {app.worker_profiles.skills.slice(0, 3).map((skill, i) => (
                           <span key={i} className="px-2 py-0.5 bg-white text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                             {skill}
                           </span>
                        ))}
                        {app.worker_profiles.skills.length > 3 && (
                           <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                             +{app.worker_profiles.skills.length - 3}
                           </span>
                        )}
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
             onClick={closeModal}
           ></div>

           {/* Modal Card */}
           <div 
             className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slideUp"
             onClick={(e) => e.stopPropagation()}
           >
             {/* Modal Header */}
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                      {selectedApplication.worker_profiles.name.charAt(0)}
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedApplication.worker_profiles.name}</h2>
                      <p className="text-xs text-slate-500 font-medium">Candidate Profile</p>
                   </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Details Sections */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Applying For</p>
                      <p className="text-sm font-bold text-slate-900">{selectedApplication.jobs.title}</p>
                   </div>
                   <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Availability</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">{selectedApplication.worker_profiles.availability.replace("-", " ")}</p>
                   </div>
                </div>

                {/* Skills */}
                <div>
                   <h4 className="text-sm font-bold text-slate-900 mb-3">Skills & Expertise</h4>
                   <div className="flex flex-wrap gap-2">
                      {selectedApplication.worker_profiles.skills.map(skill => (
                         <span key={skill} className="px-3 py-1 bg-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs">
                             {skill}
                         </span>
                      ))}
                   </div>
                </div>

                {/* Status Info */}
                {acceptanceStatus && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 mb-2">Staffing Status</h4>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-blue-700">Positions Filled:</span>
                       <span className="font-bold text-blue-900">{acceptanceStatus.acceptedCount} / {acceptanceStatus.requiredWorkers}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                       <div 
                         className="bg-blue-600 h-1.5 rounded-full transition-all"
                         style={{ width: `${Math.min(100, (acceptanceStatus.acceptedCount / acceptanceStatus.requiredWorkers) * 100)}%` }}
                       ></div>
                    </div>
                    {acceptanceStatus.isFullyStaffed && (
                       <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          Fully Staffed
                       </p>
                    )}
                  </div>
                )}

                {/* Info Text */}
                <div className="text-center">
                    <p className="text-xs text-slate-400">
                       Application received on {new Date(selectedApplication.applied_at).toLocaleDateString()} at {new Date(selectedApplication.applied_at).toLocaleTimeString()}
                    </p>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-5 border-t border-slate-100 bg-white">
                {selectedApplication.status === "pending" ? (
                   <div className="flex gap-3">
                      <button
                         onClick={() => handleStatusUpdate(selectedApplication.id, "rejected")}
                         disabled={!!processing}
                         className="flex-1 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-all"
                      >
                         Reject
                      </button>
                      <button
                         onClick={() => handleStatusUpdate(selectedApplication.id, "accepted")}
                         disabled={!!processing || acceptanceStatus?.isFullyStaffed}
                         className={`flex-1 py-3.5 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all ${
                             acceptanceStatus?.isFullyStaffed ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"
                         }`}
                      >
                         {processing === selectedApplication.id ? "Processing..." : "Accept Candidate"}
                      </button>
                   </div>
                ) : (
                   <div className={`w-full py-3.5 rounded-xl text-center font-bold border ${
                      selectedApplication.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                      selectedApplication.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-slate-100 text-slate-500'
                   }`}>
                      Is {selectedApplication.status}
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
