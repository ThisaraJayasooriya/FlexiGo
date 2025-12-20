"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import Toast from "@/app/components/ui/Toast";

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

export default function BusinessApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applications");
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

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
      label: "Jobs",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      href: "/jobs/business"
    },
    {
      id: "create",
      label: "Create",
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/businesses/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.profile) {
        setProfileName(json.profile.company_name || "");
        setProfileImage(json.profile.logo_url || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/applications/business", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch applications");

      setApplications(json.applications || []);
      setLoading(false);
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; path=/; max-age=0";
    router.push("/");
  };

  const handleStatusUpdate = async (applicationId: string, status: "accepted" | "rejected") => {
    setProcessing(applicationId);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/applications/update", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ applicationId, status })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update application");

      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status } : app
      ));
      setToast({ type: "success", message: `Application ${status} successfully!` });
      setExpandedId(null);
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredApplications = applications.filter(app =>
    filterStatus === "all" || app.status === filterStatus
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3F72AF] border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <Header
        title="FlexiGo"
        subtitle="Business Portal"
        userName={profileName}
        userImage={profileImage}
        onProfileClick={() => router.push("/profile")}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#112D4E] mb-2">Job Applications</h1>
          <p className="text-sm sm:text-base text-gray-600">Review and manage applications from workers</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "accepted", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterStatus === status
                    ? "bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({applications.filter(app => status === "all" || app.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {filterStatus === "all" 
                ? "You haven't received any applications yet." 
                : `No ${filterStatus} applications.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Application Summary */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#3F72AF] to-[#112D4E] flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-lg">
                            {application.worker_profiles.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-[#112D4E] truncate">
                            {application.worker_profiles.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            Applied for: <span className="font-semibold text-[#3F72AF]">{application.jobs.title}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(application.applied_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setExpandedId(expandedId === application.id ? null : application.id)}
                        className="px-4 py-2 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all"
                      >
                        {expandedId === application.id ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Venue</p>
                      <p className="text-sm font-semibold text-[#112D4E] truncate">{application.jobs.venue}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Pay Rate</p>
                      <p className="text-sm font-semibold text-green-600">${application.jobs.pay_rate}/hr</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 col-span-2 sm:col-span-1">
                      <p className="text-xs text-gray-600 mb-1">Availability</p>
                      <p className="text-sm font-semibold text-[#112D4E] capitalize">{application.worker_profiles.availability}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === application.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Job Details */}
                      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
                        <h4 className="text-lg font-bold text-[#112D4E] mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Job Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Title</p>
                            <p className="text-sm font-semibold text-[#112D4E]">{application.jobs.title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Date</p>
                            <p className="text-sm font-semibold text-[#112D4E]">
                              {new Date(application.jobs.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Venue</p>
                            <p className="text-sm font-semibold text-[#112D4E]">{application.jobs.venue}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Pay Rate</p>
                            <p className="text-sm font-semibold text-green-600">${application.jobs.pay_rate}/hour</p>
                          </div>
                        </div>
                      </div>

                      {/* Worker Details */}
                      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
                        <h4 className="text-lg font-bold text-[#112D4E] mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Worker Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Name</p>
                            <p className="text-sm font-semibold text-[#112D4E]">{application.worker_profiles.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Availability</p>
                            <p className="text-sm font-semibold text-[#112D4E] capitalize">
                              {application.worker_profiles.availability.split("-").join(" ")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {application.worker_profiles.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-linear-to-r from-[#DBE2EF] to-[#3F72AF]/20 text-[#112D4E] text-xs font-semibold rounded-lg"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {application.status === "pending" && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleStatusUpdate(application.id, "accepted")}
                          disabled={processing === application.id}
                          className="flex-1 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {processing === application.id ? "Processing..." : "Accept Application"}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, "rejected")}
                          disabled={processing === application.id}
                          className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {processing === application.id ? "Processing..." : "Reject Application"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
