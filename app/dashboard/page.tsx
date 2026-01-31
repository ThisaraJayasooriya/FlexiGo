"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
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
      .then((res) => res.json())
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3F72AF] border-t-transparent mb-4"></div>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Welcome, {userName}! 👋</h2>
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
function WorkerDashboard({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");

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
      id: "schedule",
      label: "Schedule",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      href: "/schedule"
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
        subtitle="Worker Portal" 
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
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Hey {userName}! 🚀</h2>
              <p className="text-sm sm:text-base text-white/80 font-medium">Find your next opportunity today</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/jobs/worker")}
            className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="w-12 h-12 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">Find Jobs</h3>
            <p className="text-xs text-gray-600">Browse shifts</p>
          </button>

          <button className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">My Jobs</h3>
            <p className="text-xs text-gray-600">Applications</p>
          </button>

          <button className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-linear-to-br from-[#3F72AF]/20 to-[#DBE2EF] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">Schedule</h3>
            <p className="text-xs text-gray-600">My shifts</p>
          </button>

          <button className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-linear-to-br from-[#112D4E] to-[#3F72AF] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#112D4E] text-sm mb-1">Earnings</h3>
            <p className="text-xs text-gray-600">View income</p>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Applied</span>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#3F72AF] to-[#112D4E]">0</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Scheduled</span>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

      <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
