"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/app/components/ui/Toast";
import Header from "@/app/components/Header";
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
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
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
      href: "/profile"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; path=/; max-age=0";
    router.push("/");
  };

  useEffect(() => {
    fetchApplications();
    fetchProfile();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchProfile = async () => {
    try {
      const json = await apiClient.get("/api/workers/profile");
      if (json.profile) {
        setProfileName(json.profile.name || "");
        setProfileImage("");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        iconColor: "text-amber-600",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      accepted: {
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        iconColor: "text-green-600",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      rejected: {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        iconColor: "text-red-600",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      withdrawn: {
        bgColor: "bg-gray-50",
        borderColor: "border-gray-300",
        textColor: "text-gray-700",
        iconColor: "text-gray-600",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.415m-1.414-1.415L3 3" />
          </svg>
        ),
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24 font-sans antialiased">
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
            <p className="text-sm text-slate-600 font-medium">Loading applications...</p>
          </div>
        </div>
        <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <Header
        title="FlexiGo"
        subtitle="Worker Portal"
        userName={profileName}
        userImage={profileImage}
        onProfileClick={() => router.push("/profile")}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <header className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-gray-600 hover:text-[#124E66] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Applications</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {applications.filter((a) => a.status === "pending").length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {applications.filter((a) => a.status === "accepted").length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {applications.filter((a) => a.status === "rejected").length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All", count: applications.length },
              { id: "pending", label: "Pending", count: applications.filter((a) => a.status === "pending").length },
              { id: "accepted", label: "Accepted", count: applications.filter((a) => a.status === "accepted").length },
              { id: "rejected", label: "Rejected", count: applications.filter((a) => a.status === "rejected").length },
              { id: "withdrawn", label: "Withdrawn", count: applications.filter((a) => a.status === "withdrawn").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-[#124E66] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} {tab.count > 0 && <span className={statusFilter === tab.id ? "text-blue-200" : "text-gray-400"}>({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === "all" ? "No applications yet" : `No ${statusFilter} applications`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === "all" ? "Start applying to jobs to see them here" : "Try selecting a different filter"}
            </p>
            {statusFilter === "all" && (
              <Link
                href="/jobs/worker"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#124E66] text-white rounded-lg hover:bg-[#0d3a4d] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => {
              if (!application.job) return null;
              const statusConfig = getStatusConfig(application.status);

              return (
                <div
                  key={application.id}
                  className={`bg-white border-2 ${statusConfig.borderColor} rounded-xl overflow-hidden hover:shadow-lg transition-all`}
                >
                  {/* Status Banner */}
                  <div className={`${statusConfig.bgColor} border-b ${statusConfig.borderColor} px-4 py-2.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className={statusConfig.iconColor}>
                        {statusConfig.icon}
                      </div>
                      <span className={`${statusConfig.textColor} text-sm font-bold uppercase tracking-wide`}>
                        {application.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Applied {new Date(application.applied_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="p-4">
                    {/* Title and Company */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{application.job.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{application.job.business_name}</span>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{formatDate(application.job.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="shrink-0 w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{application.job.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="shrink-0 w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Venue</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{application.job.venue}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="shrink-0 w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Pay Rate</p>
                          <p className="text-sm font-semibold text-gray-900">LKR {application.job.pay_rate}/hr</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {application.job.required_skills && application.job.required_skills.length > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {application.job.required_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs rounded-md font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {application.status === "pending" && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          disabled={withdrawingId === application.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          {withdrawingId === application.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Withdrawing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Withdraw Application
                            </>
                          )}
                        </button>
                      )}
                      {application.status === "accepted" && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-center">
                          <p className="text-sm font-semibold text-green-700">
                            🎉 Congratulations! You've been selected for this job
                          </p>
                        </div>
                      )}
                      {application.status === "rejected" && (
                        <div className="flex-1 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                          <p className="text-sm font-medium text-red-700">
                            Unfortunately, this application was not successful
                          </p>
                        </div>
                      )}
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
