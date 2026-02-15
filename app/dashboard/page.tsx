"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Toast from "../components/ui/Toast";
import BottomNav, { NavItem } from "../components/BottomNav";
import { apiClient } from "@/lib/api-client";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Fetch user role
    apiClient.get("/api/check")
      .then((data) => {
        setUserRole(data.role);
        setUserName(data.email?.split("@")[0] || "User");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    // Clear cookie
    document.cookie = "access_token=; path=/; max-age=0";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-slate-900 mb-3"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole === "business") {
    return <BusinessDashboard userName={userName} onLogout={handleLogout} />;
  }

  if (userRole === "worker") {
    return <WorkerDashboard userName={userName} onLogout={handleLogout} />;
  }

  return null;
}

// Business Dashboard Component
function BusinessDashboard({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const json = await apiClient.get("/api/businesses/profile");
        if (json.profile) {
          setProfileName(json.profile.company_name || userName);
          setProfileImage(json.profile.logo_url || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [userName]);

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

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24 font-sans antialiased">
      <Header 
        title="FlexiGo" 
        subtitle="Business Portal" 
        userName={profileName || userName}
        userImage={profileImage}
        onProfileClick={() => router.push("/profile")}
        onLogout={onLogout} 
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Welcome, {profileName?.split(' ')[0] || userName}! 👋</h2>
              <p className="text-sm sm:text-base text-white/80 font-medium">Manage your events and find talented workers</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/jobs/create")}
            className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="w-12 h-12 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">Post Job</h3>
            <p className="text-xs text-gray-600">Create listing</p>
          </button>

          <button
            onClick={() => router.push("/jobs/business")}
            className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="w-12 h-12 bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">My Jobs</h3>
            <p className="text-xs text-gray-600">View postings</p>
          </button>

          <button 
            onClick={() => router.push("/applications/business")}
            className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="w-12 h-12 bg-linear-to-br from-[#3F72AF]/20 to-[#DBE2EF] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">Applications</h3>
            <p className="text-xs text-gray-600">Review applicants</p>
          </button>

          <button className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-linear-to-br from-[#112D4E] to-[#3F72AF] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">Analytics</h3>
            <p className="text-xs text-gray-600">View stats</p>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Active Jobs</span>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#3F72AF] to-[#112D4E]">0</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Applications</span>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#3F72AF] to-[#112D4E]">0</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Completed</span>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#3F72AF] to-[#112D4E]">0</p>
          </div>
        </div>
      </main>

      <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// Worker Dashboard Component
interface Schedule {
  id: string;
  job_id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  pay_rate: number;
  working_hours: number;
  required_skills: string[];
  number_of_workers: number;
  description: string;
  business_name: string;
  business_logo: string | null;
  applied_at: string;
}

function WorkerDashboard({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Schedule | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    thisWeek: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const json = await apiClient.get("/api/workers/profile");
        if (json.profile) {
          setProfileName(json.profile.name || userName);
          setProfileImage(""); // Worker profiles don't have profile pictures yet
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [userName]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const json = await apiClient.get("/api/schedule/worker");
        if (json.schedules) {
          setSchedules(json.schedules);
          
          // Calculate stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcoming = json.schedules.filter((s: Schedule) => 
            new Date(s.date) >= today
          ).length;
          
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          
          const thisWeek = json.schedules.filter((s: Schedule) => {
            const scheduleDate = new Date(s.date);
            return scheduleDate >= today && scheduleDate <= weekFromNow;
          }).length;
          
          setStats({
            total: json.schedules.length,
            upcoming,
            thisWeek
          });
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

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

  const [highlightToday, setHighlightToday] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success" | "info"; message: string } | null>(null);

  const handleViewToday = () => {
    // Check if there are tasks for today first
    const today = new Date();
    const todayTasks = schedules.filter(s => {
      const sDate = new Date(s.date);
      return sDate.toDateString() === today.toDateString();
    });

    if (todayTasks.length === 0) {
      setToast({ type: "info", message: "No tasks scheduled for today!" });
      return;
    }

    // Sort today's tasks by time/date if needed, but assuming schedules is somewhat ordered
    // We want to scroll to the FIRST task of today
    const firstTodayTask = todayTasks[0];
    const taskElement = document.getElementById(`schedule-card-${firstTodayTask.id}`);
    
    if (taskElement) {
      // Scroll smoothly to the center of the viewport to ensure visibility
      // Or 'start' to bring to top as requested, with some offset if possible via scroll-margin
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightToday(true);
      setTimeout(() => setHighlightToday(false), 3000);
    } else {
        // Fallback to section scroll if card not found for some reason
        const scheduleSection = document.getElementById('schedule-section');
        if (scheduleSection) {
            scheduleSection.scrollIntoView({ behavior: 'smooth' });
             setHighlightToday(true);
            setTimeout(() => setHighlightToday(false), 3000);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type === "info" ? "success" : toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <Header 
        title="FlexiGo" 
        subtitle="Worker Portal" 
        userName={profileName || userName}
        userImage={profileImage}
        onProfileClick={() => router.push("/profile")}
        onLogout={onLogout} 
      />

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 py-6 space-y-8">
        {/* Welcome Section - Premium Dark Design */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[35px] p-8 shadow-2xl shadow-slate-900/30 isolate group">
          {/* Animated Background Mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3F72AF] rounded-full mix-blend-screen filter blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#112D4E] rounded-full mix-blend-screen filter blur-[60px] opacity-40 group-hover:opacity-50 transition-opacity duration-700 -ml-20 -mb-20"></div>
          
          {/* Floating Subtle Particles (simulated with standard classes for performance) */}
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-blue-100 rounded-full opacity-30 animate-pulse delay-700"></div>

          <div className="relative z-10 flex flex-col items-start">
             <div className="flex items-center gap-2 mb-3">
               <span className="px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md text-[10px] font-bold text-blue-100 uppercase tracking-widest leading-none">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
               </span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
             </div>

            <h2 className="text-4xl font-light text-white tracking-tight leading-tight mb-1">
              {new Date().getHours() < 12 ? "Good" : new Date().getHours() < 18 ? "Good" : "Good"} <span className="font-bold">{new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}</span>,
            </h2>
            <p className="text-xl text-blue-200 font-medium mb-6">
              {(profileName || userName).split(' ')[0]}
            </p>

            <button 
              onClick={handleViewToday}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors shadow-lg shadow-white/10 active:scale-95"
            >
              <span>View Today's Tasks</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-800 leading-none mb-1">{stats.total}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Jobs</span>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-800 leading-none mb-1">{stats.upcoming}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Upcoming</span>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-800 leading-none mb-1">{stats.thisWeek}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">This Week</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/jobs/worker")}
            className="group relative bg-white overflow-hidden rounded-2xl p-5 shadow-sm border border-slate-100 transition-all active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 -mr-3 -mt-3 w-16 h-16 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex flex-col items-start">
              <div className="w-10 h-10 bg-blue-100 text-[#112D4E] rounded-xl flex items-center justify-center mb-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Find Jobs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Browse available shifts</p>
            </div>
          </button>

          <button 
            onClick={() => router.push("/applications/worker")}
            className="group relative bg-white overflow-hidden rounded-2xl p-5 shadow-sm border border-slate-100 transition-all active:scale-[0.98]"
          >
             <div className="absolute top-0 right-0 -mr-3 -mt-3 w-16 h-16 bg-purple-50 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex flex-col items-start">
               <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">My Applications</h3>
              <p className="text-xs text-slate-500 mt-0.5">Check status updates</p>
            </div>
          </button>
        </div>

        {/* My Schedule */}
        <div id="schedule-section" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-900">My Schedule</h3>
             <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
              {schedules.length} Upcoming
            </span>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-400 font-medium">Loading your schedule...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-800 mb-1">No shifts yet</h4>
              <p className="text-sm text-slate-500 mb-6">Apply for jobs to fill your schedule.</p>
              <button
                onClick={() => router.push("/jobs/worker")}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const scheduleDate = new Date(schedule.date);
                const today = new Date();
                
                // Robust date string comparison
                const isToday = scheduleDate.toDateString() === today.toDateString();
                
                // For upcoming, reset time to midnight to encompass "today" as upcoming too if needed
                // But generally "upcoming" means future dates or today
                const checkDate = new Date(scheduleDate);
                checkDate.setHours(0,0,0,0);
                const todayCheck = new Date();
                todayCheck.setHours(0,0,0,0);
                const isUpcoming = checkDate >= todayCheck;
                
                return (
                  <button
                    key={schedule.id}
                    id={`schedule-card-${schedule.id}`}
                    onClick={() => setSelectedJob(schedule)}
                    className={`w-full text-left bg-white rounded-2xl p-4 border transition-all duration-500 active:scale-[0.99] scroll-mt-24 ${
                      highlightToday && isToday 
                        ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-2 ring-blue-500 scale-[1.02] z-10 relative bg-blue-50' 
                        : isUpcoming 
                          ? 'border-slate-100 shadow-sm hover:shadow-md' 
                          : 'border-slate-100 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Block */}
                       <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-colors ${
                        highlightToday && isToday
                           ? 'bg-blue-600 border-blue-600 text-white'
                           : isUpcoming 
                             ? 'bg-blue-50 border-blue-100 text-blue-700' 
                             : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                         <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">
                          {scheduleDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold leading-none">
                          {scheduleDate.getDate()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{schedule.title}</h4>
                          <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                             LKR {schedule.pay_rate}/hr
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                          <span className="font-medium text-slate-700 truncate">{schedule.business_name}</span>
                        </div>

                         <div className="flex items-center gap-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{schedule.time}</span>
                          </div>
                           <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate max-w-[80px] sm:max-w-none">{schedule.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Improved Job Detail Modal */}
      {selectedJob && (
        <div 
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedJob(null)}
          ></div>

          {/* Modal Card */}
          <div 
            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image/Color */}
            <div className="relative h-24 bg-gradient-to-r from-[#3F72AF] to-[#112D4E] shrink-0">
               <button
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/30 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>

            {/* Content Container - Negative margin to pull up over header */}
            <div className="flex-1 overflow-y-auto -mt-6 rounded-t-3xl bg-white px-6 pt-8 pb-10 relative z-10">
              
              {/* Title Section */}
              <div className="mb-6">
                <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Confirmed Job
                </span>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{selectedJob.title}</h3>
                <p className="text-slate-500 font-medium">{selectedJob.business_name}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(selectedJob.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                 </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Time</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedJob.time}</p>
                 </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedJob.working_hours} hrs</p>
                 </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pay</p>
                    <p className="text-sm font-semibold text-emerald-600">LKR {selectedJob.pay_rate}/hr</p>
                 </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                 <h4 className="text-sm font-bold text-slate-900 mb-2">Location</h4>
                 <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedJob.venue}</span>
                 </div>
              </div>

               {/* Description */}
               {selectedJob.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {/* Required Skills */}
              {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                    {selectedJob.required_skills.map((skill, index) => (
                        <span 
                        key={index}
                        className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200"
                        >
                        {skill}
                        </span>
                    ))}
                    </div>
                </div>
              )}

              {/* Team Size */}
              <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Team Size</h4>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{selectedJob.number_of_workers} worker{selectedJob.number_of_workers > 1 ? 's' : ''} needed</span>
                  </div>
              </div>

              {/* Footer Button */}
               <button
                  onClick={() => setSelectedJob(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
                >
                  Close Details
                </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
