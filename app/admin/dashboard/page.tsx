"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import LoadingWave from "../../components/ui/LoadingWave";
import Toast from "../../components/ui/Toast";

import { useRouter } from "next/navigation";

interface AdminStats {
  pending_verifications: number;
  approved_businesses: number;
  rejected_verifications: number;
  total_workers: number;
  total_jobs: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.get("/api/admin/stats");
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingWave />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Welcome Section - Premium Dark Design */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[35px] p-8 md:p-12 shadow-2xl shadow-slate-900/30 isolate group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3F72AF] rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#112D4E] rounded-full mix-blend-screen filter blur-[80px] opacity-40 group-hover:opacity-50 transition-opacity duration-700 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/5 backdrop-blur-md text-xs font-bold text-blue-100 uppercase tracking-widest leading-none">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight mb-2">
              System <span className="font-bold">Overview</span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-200 font-medium md:mb-0">
              Administrator
            </p>
          </div>
          
          <button 
             onClick={() => router.push("/admin/verifications")}
             className="flex items-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-xl shadow-black/20 active:scale-95"
          >
             <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             <span>{stats?.pending_verifications || 0} Pending Reviews</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Approved Businesses */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-slate-800 leading-none mb-1">{stats?.approved_businesses || 0}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Businesses</span>
          </div>
        </div>

        {/* Total Workers */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-slate-800 leading-none mb-1">{stats?.total_workers || 0}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Workers</span>
          </div>
        </div>

        {/* Total Jobs */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left col-span-2 md:col-span-1 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-slate-800 leading-none mb-1">{stats?.total_jobs || 0}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jobs Posted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
