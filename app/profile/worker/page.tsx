"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import Toast from "@/app/components/ui/Toast";
import { getInitials } from "@/lib/utils";

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
  const [skillInput, setSkillInput] = useState("");
  const [availability, setAvailability] = useState("");

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/workers/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch profile");

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

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          skills,
          availability
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update profile");

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3F72AF] border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <Header 
        title="FlexiGo" 
        subtitle="Worker Portal"
        userName={profile?.name}
        onProfileClick={() => router.push("/profile")}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Profile Header with Cover */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 sm:mb-8">
          {/* Cover Image/Gradient */}
          <div className="h-24 sm:h-32 bg-linear-to-r from-[#3F72AF] via-[#5586be] to-[#112D4E] relative">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          </div>
          
          {/* Profile Content */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 mb-4 sm:mb-6">
              {/* Profile Image - Circular */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-[#3F72AF] to-[#112D4E] flex items-center justify-center shadow-2xl ring-4 ring-white">
                  <span className="text-white font-extrabold text-2xl sm:text-4xl">{getInitials(profile?.name || "")}</span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-2 sm:pt-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#112D4E] mb-1">{profile?.name}</h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">{email}</p>
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="self-start sm:self-auto px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white text-sm sm:text-base font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    {editing ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
                
                {/* Quick Info Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile?.availability && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {profile.availability}
                    </span>
                  )}
                  {profile?.skills && profile.skills.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#3F72AF] rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {profile.skills.length} Skills
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          /* Edit Mode */
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-[#112D4E]">Edit Profile</h2>
                <p className="text-sm text-gray-600 mt-1">Update your worker information</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Skills
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-6 py-3.5 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="group inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-[#DBE2EF] to-[#3F72AF]/20 rounded-xl text-sm font-semibold text-[#112D4E] hover:shadow-md transition-all"
                    >
                      <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                >
                  <option value="">Select your availability</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="weekends">Weekends Only</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-8 py-4 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100">
            {/* Skills Section */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#112D4E] mb-3 sm:mb-4">
                  <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {profile.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r from-[#DBE2EF] to-[#3F72AF]/20 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-[#112D4E] shadow-sm"
                    >
                      <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Section */}
            {profile?.availability && (
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#112D4E] mb-3 sm:mb-4">
                  <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Availability
                </h3>
                <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-50 text-green-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {profile.availability.split("-").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav items={workerNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
