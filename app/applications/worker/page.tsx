"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/app/components/ui/Toast";
import LoadingWave from "@/app/components/ui/LoadingWave"; // Added import
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import { apiClient } from "@/lib/api-client";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  job: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    pay_rate: number;
    working_hours: string;
    required_skills: string[];
    number_of_workers: number;
    business_name: string;
    business_logo: string | null;
  } | null;
}

export default function WorkerApplicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected" | "withdrawn">("all");
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

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
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      const json = await apiClient.get("/api/applications/worker");
      setApplications(json.applications || []);
      setFilteredApplications(json.applications || []);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to load applications",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === statusFilter)
      );
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      await apiClient.patch("/api/applications/withdraw", {
        applicationId,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "withdrawn" } : app
        )
      );

      setToast({
        type: "success",
        message: "Application withdrawn successfully",
      });
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to withdraw application",
      });
    } finally {
      setWithdrawingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Pending Review"
      },
      accepted: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Accepted"
      },
      rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: "Not Selected"
      },
      withdrawn: {
        bg: "bg-slate-50",
        text: "text-slate-500",
        border: "border-slate-200",
        label: "Withdrawn"
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20 font-sans antialiased">
        <div className="text-center flex flex-col items-center">
          <LoadingWave />
          <p className="text-sm text-slate-500 font-medium mt-4">Loading applications...</p>
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
          <div className="flex items-center gap-3 mb-6">
             <button
               onClick={() => router.push('/dashboard')}
               className="w-10 h-10 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
               </svg>
             </button>
             <div>
                <h1 className="text-2xl font-bold text-white leading-none">My Applications</h1>
                <p className="text-xs text-blue-100 font-medium mt-1">Track your status</p>
             </div>
          </div>

           {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", count: applications.length, bg: "bg-white/10", text: "text-white" },
              { label: "Pending", count: applications.filter((a) => a.status === "pending").length, bg: "bg-amber-500/20", text: "text-amber-100" },
              { label: "Active", count: applications.filter((a) => a.status === "accepted").length, bg: "bg-emerald-500/20", text: "text-emerald-100" },
              { label: "Rejected", count: applications.filter((a) => a.status === "rejected").length, bg: "bg-red-500/20", text: "text-red-100" },
            ].map((stat, i) => (
              <div key={i} className={`rounded-xl p-2.5 backdrop-blur-sm border border-white/5 ${stat.bg}`}>
                <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${stat.text} opacity-80`}>{stat.label}</p>
                <p className={`text-lg font-bold ${stat.text}`}>{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Filter Tabs */}
        <div className="flex bg-white/60 p-1.5 rounded-xl overflow-x-auto no-scrollbar gap-1 border border-slate-200/60 sticky top-[152px] z-20 backdrop-blur-md shadow-sm">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "accepted", label: "Accepted" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {statusFilter === "all" ? "No applications yet" : `No ${statusFilter} applications`}
            </h3>
            <p className="text-sm text-slate-500 max-w-[240px] mb-6">
               {statusFilter === "all" ? "Start applying to jobs to track them here." : "Try checking other categories."}
            </p>
            {statusFilter === "all" && (
              <Link
                href="/jobs/worker"
                className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
              >
                Find Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              if (!application.job) return null;
              const statusConfig = getStatusConfig(application.status);

              return (
                <div
                  key={application.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="p-5">
                    {/* Header: Status and Date */}
                    <div className="flex items-center justify-between mb-4">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          {statusConfig.label}
                       </span>
                       <span className="text-[10px] font-semibold text-slate-400">
                         Applied {formatDate(application.applied_at)}
                       </span>
                    </div>

                    {/* Job Info */}
                    <div className="mb-4">
                       <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{application.job.title}</h3>
                       <p className="text-xs font-semibold text-slate-500">{application.job.business_name}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                       <div className="p-2.5 rounded-xl bg-slate-50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pay Rate</p>
                          <p className="text-sm font-bold text-[#3F72AF]">LKR {application.job.pay_rate}</p>
                       </div>
                       <div className="p-2.5 rounded-xl bg-slate-50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                          <p className="text-sm font-bold text-slate-700">{formatDate(application.job.date)}</p>
                       </div>
                    </div>

                    {/* Actions */}
                    <div>
                      {application.status === "pending" ? (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          disabled={withdrawingId === application.id}
                          className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {withdrawingId === application.id ? "Processing..." : "Withdraw Application"}
                        </button>
                      ) : application.status === "accepted" ? (
                         <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-center text-sm font-bold border border-emerald-100">
                            Check Dashboard for Schedule
                         </div>
                      ) : null}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
