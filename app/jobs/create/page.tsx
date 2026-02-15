"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Toast from "@/app/components/ui/Toast";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import SkillSelector from "@/app/components/SkillSelector";
import VenueLocationSelector, { VenueLocation } from "@/app/components/VenueLocationSelector";
import { apiClient } from "@/lib/api-client";

export default function CreateJobPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    workingHours: "",
    payRate: "",
    workerCount: "",
  });
  const [venueLocation, setVenueLocation] = useState<VenueLocation | null>(null);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillError, setSkillError] = useState<string>("");
  const [venueError, setVenueError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success" | "warning"; message: string } | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
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
    fetchProfile();
  }, []);

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
      label: "My Jobs",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      href: "/jobs/business"
    },
    {
      id: "create",
      label: "Post Job",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    setSkillError("");
    setVenueError("");

    // Validate venue location
    if (!venueLocation || !venueLocation.venueName) {
      setVenueError("Please select a venue location");
      setLoading(false);
      return;
    }

    if (!venueLocation.latitude || !venueLocation.longitude) {
      setVenueError("Please select a venue with valid coordinates");
      setLoading(false);
      return;
    }

    try {
      const json = await apiClient.post("/api/jobs/create", {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        workingHours: formData.workingHours,
        venue: venueLocation.venueName,
        venueAddress: venueLocation.address,
        venueCity: venueLocation.city,
        venueDistrict: venueLocation.district,
        venueLatitude: venueLocation.latitude,
        venueLongitude: venueLocation.longitude,
        payRate: parseFloat(formData.payRate),
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
        workerCount: parseInt(formData.workerCount),
      });

      setToast({
        type: "success",
        message: "Job created successfully!",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setToast({
        type: "error",
        message: (error as Error).message || "Failed to create job",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Sticky Gradient Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#3F72AF] to-[#112D4E] shadow-lg shadow-blue-900/10">
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                   <h1 className="text-2xl font-bold text-white leading-none">Create Job</h1>
                   <p className="text-xs text-blue-100 font-medium mt-1">Post a new opportunity</p>
                </div>
             </div>
             

          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1: BASIC DETAILS */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 md:p-8 mb-6 animate-slideUp">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Job Details
            </h2>
            
            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Job Position Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Event Setup Crew"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  minLength={3}
                  className="!bg-slate-50 !border-slate-200 focus:!border-[#3F72AF] focus:!ring-[#3F72AF]/20 !py-3 !text-base"
                />
              </div>

              {/* Workers & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Number of Workers
                  </label>
                   <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.workerCount}
                    onChange={(e) => setFormData({ ...formData, workerCount: e.target.value })}
                    required
                    min="1"
                    className="!bg-slate-50 !border-slate-200 focus:!border-[#3F72AF] focus:!ring-[#3F72AF]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                     Required Skills <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                  </label>
                  <SkillSelector
                    selectedSkills={requiredSkills}
                    onChange={(skills) => {
                      setRequiredSkills(skills);
                      setSkillError("");
                    }}
                    maxSkills={5}
                    error={skillError}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* SECTION 2: SCHEDULE & LOCATION */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Schedule & Location
            </h2>

            <div className="space-y-6">
               <div className="flex flex-col space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
                  <div className="flex gap-3 md:contents">
                    <div className="flex-1 min-w-0 md:w-auto">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="!bg-slate-50 !border-slate-200 focus:!border-purple-500 focus:!ring-purple-500/20 !px-3"
                      />
                    </div>
                    <div className="flex-1 min-w-0 md:w-auto">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                        className="!bg-slate-50 !border-slate-200 focus:!border-purple-500 focus:!ring-purple-500/20 !px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Duration (hours)</label>
                    <Input
                      type="text"
                      placeholder="e.g., 8"
                      value={formData.workingHours}
                      onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                      required
                      className="!bg-slate-50 !border-slate-200 focus:!border-purple-500 focus:!ring-purple-500/20"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Venue</label>
                  <VenueLocationSelector
                    location={venueLocation}
                    onChange={(loc) => {
                      setVenueLocation(loc);
                      setVenueError("");
                    }}
                    error={venueError}
                  />
               </div>
            </div>
          </div>


          {/* SECTION 3: COMPENSATION */}
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 md:p-8 mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Compensantion
            </h2>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Rate per Shift (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">LKR</span>
                  <Input
                    type="number"
                    placeholder="2500"
                    value={formData.payRate}
                    onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="!bg-green-50/50 !border-green-100 focus:!border-emerald-500 focus:!ring-emerald-500/20 !pl-14 !text-lg !font-bold !text-emerald-700 placeholder:!text-emerald-700/30"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Total payment for the specified duration.
                </p>
             </div>
          </div>


          {/* Info Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <div className="shrink-0 bg-blue-100 p-1.5 rounded-full h-8 w-8 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1 text-xs uppercase tracking-wide text-blue-700">Tips for Success</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs font-medium">
                    <li>Be specific about requirements</li>
                    <li>Competitive pay attracts better talent</li>
                    <li>List all necessary skills clearly</li>
                  </ul>
                </div>
              </div>
            </div>

          {/* Action Area */}
          <div className="flex flex-col gap-3 pb-6">
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="!bg-gradient-to-r !from-[#3F72AF] !to-[#112D4E] !rounded-xl !py-4 !text-base !shadow-xl !shadow-blue-900/20 active:!scale-[0.98] transition-all hover:!shadow-blue-900/40 hover:!translate-y-[-2px]"
            >
               {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing Job...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 font-bold text-white">
                    Post Opportunity
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                )}
            </Button>
            
            <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel and Go Back
            </Link>
          </div>

        </form>
      </main>

      <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
