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
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

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
      const json = await apiClient.get("/api/businesses/profile");
      if (json.profile) {
        setProfileName(json.profile.company_name || "");
        setProfileImage(json.profile.logo_url || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

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
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24 font-sans antialiased">
        <Header 
          title="FlexiGo" 
          subtitle="Business Portal" 
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
        <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <Header 
        title="FlexiGo" 
        subtitle="Business Portal"
        userName={profileName}
        userImage={profileImage}
        onProfileClick={() => router.push("/profile")}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-600 hover:text-[#124E66] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Jobs</h1>
            </div>
            <Link
              href="/jobs/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#124E66] text-white rounded-lg hover:bg-[#0d3a4d] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Create Job</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positions Needed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + job.number_of_workers, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positions Filled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + (job.accepted_count || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Pay Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${jobs.length > 0 ? (jobs.reduce((sum, job) => sum + job.pay_rate, 0) / jobs.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first job posting</p>
            <Link
              href="/jobs/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#124E66] text-white rounded-lg hover:bg-[#0d3a4d] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 hover:border-[#124E66]/30 hover:shadow-md transition-all duration-200">
                {/* Compact Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-gray-900 truncate">{job.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Active
                    </span>
                    {(job.application_count ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#124E66] text-white text-xs font-semibold rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {job.application_count}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        No applicants
                      </span>
                    )}
                  </div>
                </div>

                {/* Compact Body */}
                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{formatDate(job.date)}</p>
                        <p className="text-xs text-gray-600">{job.time}</p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Venue</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{job.venue}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-semibold text-gray-900">{job.working_hours}h</p>
                      </div>
                    </div>

                    {/* Pay Rate */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Pay Rate</p>
                        <p className="text-sm font-semibold text-gray-900">LKR {job.pay_rate.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Workers */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-indigo-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Workers Needed</p>
                        <p className="text-sm font-semibold text-gray-900">{job.number_of_workers}</p>
                      </div>
                    </div>

                    {/* Staffing Status */}
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-teal-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Staffing Status</p>
                        <p className={`text-sm font-semibold ${
                          (job.accepted_count || 0) >= job.number_of_workers 
                            ? 'text-green-600' 
                            : (job.accepted_count || 0) > 0 
                            ? 'text-orange-600' 
                            : 'text-gray-900'
                        }`}>
                          {job.accepted_count || 0}/{job.number_of_workers} Filled
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Row */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-cyan-50 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Compact Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Created {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <button 
                    onClick={() => fetchApplicants(job.id, job.title)}
                    className="px-4 py-2 bg-[#124E66] text-white text-sm font-semibold rounded-md hover:bg-[#0d3a4d] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    View Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>

      {/* Applicants Modal */}
      {showApplicantsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-[#124E66] to-[#0d3a4d] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Applications</h2>
                  <p className="text-blue-100 text-sm mt-1">{selectedJobTitle}</p>
                </div>
                <button
                  onClick={() => setShowApplicantsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingApplicants ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-slate-900 mb-3"></div>
                    <p className="text-sm text-slate-600 font-medium">Loading applicants...</p>
                  </div>
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">This job hasn't received any applications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((applicant) => (
                    <div 
                      key={applicant.application_id} 
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Applicant Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {applicant.worker?.name || "Unknown Worker"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Applied {new Date(applicant.applied_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              applicant.status === "accepted" 
                                ? "bg-green-100 text-green-700"
                                : applicant.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                            </span>
                          </div>

                          {/* Skills */}
                          {applicant.worker?.skills && applicant.worker.skills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {applicant.worker.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Availability */}
                          {applicant.worker?.availability && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Available: {applicant.worker.availability}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {applicant.status === "pending" && (
                          <div className="flex sm:flex-col gap-2">
                            <button
                              onClick={() => handleUpdateApplicationStatus(applicant.application_id, "accepted")}
                              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(applicant.application_id, "rejected")}
                              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
