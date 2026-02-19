"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingWave from "@/app/components/ui/LoadingWave";
import Toast from "@/app/components/ui/Toast"; // Restored import
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import SkillSelector from "@/app/components/SkillSelector";
import LocationSelector from "@/app/components/LocationSelector";
import { getInitials } from "@/lib/utils";
import { getCategoryForSkill } from "@/lib/skills/skillCategories";
import type { WorkerLocation } from "@/types/location";
import { apiClient } from "@/lib/api-client";

export default function WorkerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  
  // Edit form states
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillError, setSkillError] = useState<string>("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState<WorkerLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const json = await apiClient.get("/api/workers/profile");

      // If no profile exists, redirect to profile creation
      if (!json.profile) {
        router.replace("/profile/worker/create");
        return;
      }

      setProfile(json.profile);
      setEmail(json.email || "");
      
      // Set form values
      setName(json.profile.name || "");
      setSkills(json.profile.skills || []);
      setAvailability(json.profile.availability || "");
      
      // Reconstruct location object from separate columns
      if (json.profile.latitude && json.profile.longitude) {
        setLocation({
          city: json.profile.city || "",
          district: json.profile.district || "",
          latitude: json.profile.latitude,
          longitude: json.profile.longitude,
          formattedAddress: json.profile.formatted_address || ""
        });
      } else {
        setLocation(null);
      }

      setLoading(false);
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("access_token");
      document.cookie = "access_token=; path=/; max-age=0";
      router.push("/");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    setSkillError("");
    setLocationError("");

    // Validate skills
    if (skills.length === 0) {
      setSkillError("Please select at least one skill");
      setSaving(false);
      return;
    }

    // Validate location
    if (!location || !location.city || !location.district) {
      setLocationError("Please provide your location");
      setSaving(false);
      return;
    }

    try {
      const json = await apiClient.put("/api/workers/profile", {
        name,
        skills,
        availability,
        city: location.city,
        district: location.district,
        latitude: location.latitude,
        longitude: location.longitude,
        formattedAddress: location.formattedAddress
      });

      setProfile(json.profile);
      setEditing(false);
      setToast({ type: "success", message: "Profile updated successfully!" });
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20 font-sans antialiased">
        <div className="text-center flex flex-col items-center">
          <LoadingWave />
          <p className="text-sm text-slate-500 font-medium mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Immersive Hero Section */}
      <div className="relative bg-gradient-to-br from-[#3F72AF] to-[#112D4E] pb-32 rounded-b-[40px] shadow-2xl overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white/5 blur-3xl"></div>

        {/* Transparent Navbar */}
        <div className="relative z-10 px-5 pt-6 pb-4 flex items-center justify-between">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg ring-1 ring-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

             <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-white/10 hover:bg-red-500/20 active:bg-red-500/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg ring-1 ring-white/20 group"
             >
                <svg className="w-5 h-5 group-hover:text-red-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
             </button>
        </div>

        {/* Profile Identity */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-2">
            <div className="relative mb-4">
               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#DBE2EF] to-white p-[3px] shadow-2xl">
                 <div className="w-full h-full rounded-full bg-[#112D4E] flex items-center justify-center overflow-hidden relative">
                    {/* Placeholder Avatar Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3F72AF] to-[#112D4E]"></div>
                    <span className="relative text-white font-extrabold text-4xl">{getInitials(profile?.name || "")}</span>
                 </div>
               </div>
               {/* Edit FAB */}
               <button
                  onClick={() => setEditing(!editing)}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-white text-[#3F72AF] rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     {editing ? (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                     ) : (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                     )}
                   </svg>
                </button>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-1 shadow-sm">{profile?.name}</h1>
            <p className="text-blue-100 font-medium text-sm tracking-wide">{email}</p>

            {/* Quick Stats on Gradient */}
            {!editing && (
              <div className="flex items-center gap-4 mt-6">
                 {profile?.availability && (
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-white text-xs font-bold capitalize">{profile.availability.replace("-", " ")}</span>
                    </div>
                 )}
                 {profile?.location && (
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-xs font-bold">{profile.location.city}</span>
                    </div>
                 )}
              </div>
            )}
        </div>
      </div>

      {/* Content Sheet */}
      <div className="relative z-20 -mt-16 mx-4 bg-white rounded-[32px] shadow-xl p-6 min-h-[400px]">
         {editing ? (
           <div className="space-y-8 pt-2 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                 <button 
                   onClick={() => setEditing(false)}
                   className="text-sm font-bold text-slate-400 hover:text-slate-600 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
                 >
                   Cancel
                 </button>
              </div>
              
              <div className="space-y-6">
                 {/* Personal Details Section */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Personal Details</h3>
                    
                    <div className="group relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                       </div>
                       <input
                         type="text"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                         placeholder="Full Name"
                       />
                       <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all transform scale-90 group-focus-within:scale-100">FULL NAME</label>
                    </div>

                    <div className="group relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                       </div>
                       <div className="relative">
                          <select
                           value={availability}
                           onChange={(e) => setAvailability(e.target.value)}
                           className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 appearance-none cursor-pointer"
                         >
                           <option value="">Select Availability</option>
                           <option value="Weekdays">Weekdays (Mon-Fri)</option>
                           <option value="Weekends">Weekends (Sat-Sun)</option>
                           <option value="Flexible">Flexible (Any Day)</option>
                         </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                           <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </div>
                       </div>
                       <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">AVAILABILITY</label>
                    </div>
                 </div>

                 {/* Professional Info Section */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1 mt-6">Professional Info</h3>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Skills & Expertise <span className="text-red-400">*</span>
                       </label>
                       <SkillSelector
                         selectedSkills={skills}
                         onChange={(newSkills) => {
                           setSkills(newSkills);
                           setSkillError("");
                         }}
                         maxSkills={10}
                         error={skillError}
                       />
                    </div>
                 </div>

                 {/* Location Section */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1 mt-6">Location</h3>
                    <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100">
                       <LocationSelector
                         location={location}
                         onChange={(newLocation) => {
                           setLocation(newLocation);
                           setLocationError("");
                         }}
                         error={locationError}
                       />
                    </div>
                 </div>
              </div>

               <div className="pt-8 pb-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-gradient-to-r from-[#3F72AF] to-[#112D4E] text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {saving ? (
                     <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        <span>Saving Changes...</span>
                     </>
                  ) : (
                     <>
                        <span>Save Changes</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                     </>
                  )}
                </button>
              </div>
           </div>
         ) : (
           /* View Mode - Details */
           <div className="space-y-8 pt-2">
              {/* Skills Area */}
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Expertise</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                       {profile?.skills?.length || 0} Skills
                    </span>
                 </div>
                 
                 {profile?.skills && profile.skills.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, index: number) => {
                         const category = getCategoryForSkill(skill);
                         return (
                           <span
                             key={index}
                             className="px-4 py-2.5 bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-100"
                           >
                              {skill}
                           </span>
                         );
                      })}
                   </div>
                 ) : (
                   <div className="text-center py-8 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No skills added yet. Tap edit to showcase your talent.
                   </div>
                 )}
              </div>

              {/* Activity Stats */}
              <div>
                 <h3 className="text-lg font-bold text-slate-900 mb-4">Performance</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FBFF] p-5 rounded-3xl border border-blue-50">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                           </svg>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">0</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Jobs Done</p>
                    </div>
                    
                    <div className="bg-[#FFFDF5] p-5 rounded-3xl border border-amber-50">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">0</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hours</p>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>

      <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
