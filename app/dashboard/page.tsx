"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    // Set cookie for middleware
    document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    
    // Fetch user role
    fetch("/api/check", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserRole(data.role);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FA] to-[#D3D9D2]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#124E66] border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#D3D9D2]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src="/icons/flexigo_logo.jpg" alt="FlexiGo Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FlexiGo</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#124E66] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#124E66]/10 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back!</h2>
          </div>
          <p className="text-gray-600">Here's what's happening with your FlexiGo account today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <button 
            onClick={() => router.push(userRole === "worker" ? "/jobs/worker" : "/jobs/business")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{userRole === "worker" ? "Available Jobs" : "My Jobs"}</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </button>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userRole === "business" ? (
              <button 
                onClick={() => router.push("/jobs/create")}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#124E66] hover:bg-[#124E66]/5 transition-all text-left group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-[#124E66]/10 rounded-lg mb-3 group-hover:bg-[#124E66] transition-colors">
                  <svg className="w-6 h-6 text-[#124E66] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 mb-1">Create New Job</div>
                <div className="text-sm text-gray-600">Post a new opportunity</div>
              </button>
            ) : (
              <button 
                onClick={() => router.push("/jobs/worker")}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#124E66] hover:bg-[#124E66]/5 transition-all text-left group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-[#124E66]/10 rounded-lg mb-3 group-hover:bg-[#124E66] transition-colors">
                  <svg className="w-6 h-6 text-[#124E66] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 mb-1">Browse Jobs</div>
                <div className="text-sm text-gray-600">Find opportunities</div>
              </button>
            )}
            <button className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#124E66] hover:bg-[#124E66]/5 transition-all text-left group">
              <div className="flex items-center justify-center w-10 h-10 bg-[#124E66]/10 rounded-lg mb-3 group-hover:bg-[#124E66] transition-colors">
                <svg className="w-6 h-6 text-[#124E66] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Edit Profile</div>
              <div className="text-sm text-gray-600">Update your information</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
