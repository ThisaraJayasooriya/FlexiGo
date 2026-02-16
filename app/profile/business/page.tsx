"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingWave from "@/app/components/ui/LoadingWave";
import Toast from "@/app/components/ui/Toast";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import { getInitials } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function BusinessProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  
  // Edit form states
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

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
      href: "/jobs/create"
    },
    {
      id: "applications",
      label: "Applications",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      href: "/applications/business"
    },
    {
      id: "profile",
      label: "Profile",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      activeIcon: <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      href: "/profile/business"
    }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const json = await apiClient.get("/api/businesses/profile");

      // If no profile exists, redirect to profile creation
      if (!json.profile) {
        router.replace("/profile/business/create");
        return;
      }

      setProfile(json.profile);
      setEmail(json.email || "");
      
      // Set form values
      setCompanyName(json.profile.company_name || "");
      setDescription(json.profile.description || "");
      setBusinessType(json.profile.business_type || "");
      setLocation(json.profile.location || "");
      setPhone(json.profile.phone || "");
      setWebsite(json.profile.website || "");
      setYearsExperience(json.profile.years_experience?.toString() || "");
      setLogoPreview(json.profile.logo_url || "");
      
      // Parse social links
      if (json.profile.social_links && Array.isArray(json.profile.social_links)) {
        json.profile.social_links.forEach((link: any) => {
          if (link.platform === "linkedin") setLinkedin(link.url);
          if (link.platform === "facebook") setFacebook(link.url);
          if (link.platform === "instagram") setInstagram(link.url);
        });
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("description", description);
      
      if (businessType) formData.append("business_type", businessType);
      if (location) formData.append("location", location);
      if (phone) formData.append("phone", phone);
      if (website) formData.append("website", website);
      if (yearsExperience) formData.append("years_experience", yearsExperience);
      
      const socialLinks = [];
      if (linkedin) socialLinks.push({ platform: "linkedin", url: linkedin });
      if (facebook) socialLinks.push({ platform: "facebook", url: facebook });
      if (instagram) socialLinks.push({ platform: "instagram", url: instagram });
      if (socialLinks.length > 0) {
        formData.append("social_links", JSON.stringify(socialLinks));
      }
      
      if (logo) formData.append("logo", logo);

      // Use fetch for FormData, but handle 401 manually
      const res = await fetch("/api/businesses/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      // Check for token expiration
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; path=/; max-age=0";
        router.push("/login");
        return;
      }

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
               {/* Avatar Container */}
               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#DBE2EF] to-white p-[3px] shadow-2xl">
                 <div className="w-full h-full rounded-full bg-[#112D4E] flex items-center justify-center overflow-hidden relative">
                    {/* Image or Initials */}
                    {profile?.logo_url || logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={logoPreview || profile?.logo_url} 
                        alt={profile?.company_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3F72AF] to-[#112D4E]"></div>
                        <span className="relative text-white font-extrabold text-4xl">{getInitials(profile?.company_name || "")}</span>
                      </>
                    )}
                 </div>
               </div>
               
               {/* Edit FAB (Visible in View Mode, acts as toggle) */}
               {!editing && (
                 <button
                    onClick={() => setEditing(true)}
                    className="absolute bottom-1 right-1 w-9 h-9 bg-white text-[#3F72AF] rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                     </svg>
                  </button>
               )}
               {/* Camera FAB (Visible in Edit Mode) */}
               {editing && (
                  <label className="absolute bottom-1 right-1 w-9 h-9 bg-white text-[#3F72AF] rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
               )}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-1 shadow-sm">{profile?.company_name}</h1>
            <p className="text-blue-100 font-medium text-sm tracking-wide">{email}</p>

            {/* Quick Stats on Gradient */}
            {!editing && (
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                 {profile?.business_type && (
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                        <span className="text-white text-xs font-bold capitalize">{profile.business_type}</span>
                    </div>
                 )}
                 {profile?.location && (
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-xs font-bold">{profile.location}</span>
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
                 {/* Detail Inputs */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Business Details</h3>
                    
                    {/* Company Name */}
                    <div className="group relative">
                       <input
                         type="text"
                         value={companyName}
                         onChange={(e) => setCompanyName(e.target.value)}
                         className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                         placeholder="Company Name"
                       />
                       <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">COMPANY NAME</label>
                    </div>

                    {/* Description */}
                    <div className="group relative">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-700 placeholder-slate-400 resize-none"
                          placeholder="Describe your business..."
                        />
                         <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">DESCRIPTION</label>
                    </div>

                    {/* Type & Years */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="group relative">
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                             className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 appearance-none"
                          >
                            <option value="">Type</option>
                            <option value="events">Events</option>
                            <option value="hospitality">Hospitality</option>
                            <option value="retail">Retail</option>
                            <option value="construction">Construction</option>
                            <option value="technology">Tech</option>
                            <option value="other">Other</option>
                          </select>
                           <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">BUSINESS TYPE</label>
                       </div>
                       <div className="group relative">
                          <input
                            type="number"
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                            placeholder="Years Exp."
                             className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                          />
                           <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">YEARS EXP.</label>
                       </div>
                    </div>
                 </div>

                 {/* Contact Info */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1 mt-4">Contact Info</h3>
                     <div className="group relative">
                         <input
                             type="text"
                             value={location}
                             onChange={(e) => setLocation(e.target.value)}
                             placeholder="City, Country"
                             className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                         />
                         <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">LOCATION</label>
                     </div>
                     <div className="group relative">
                         <input
                             type="tel"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             placeholder="Phone Number"
                             className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                         />
                         <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">PHONE NUMBER</label>
                     </div>
                     <div className="group relative">
                         <input
                             type="url"
                             value={website}
                             onChange={(e) => setWebsite(e.target.value)}
                             placeholder="Website URL"
                             className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                         />
                         <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">WEBSITE URL</label>
                     </div>

                     <div className="pt-2 space-y-3">
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Social Media</p>
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </div>
                            <input
                                type="url"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                placeholder="LinkedIn URL"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                            />
                            <label className="absolute -top-2 left-12 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">LINKEDIN URL</label>
                        </div>
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </div>
                            <input
                                type="url"
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder="Facebook URL"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                            />
                            <label className="absolute -top-2 left-12 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">FACEBOOK URL</label>
                        </div>
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </div>
                            <input
                                type="url"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="Instagram URL"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-800 placeholder-slate-400"
                            />
                            <label className="absolute -top-2 left-12 bg-white px-1 text-[10px] font-bold text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all">INSTAGRAM URL</label>
                        </div>
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
           /* View Mode */
           <div className="space-y-8 pt-2">
              {/* About Section */}
              <div>
                 <h3 className="text-lg font-bold text-slate-900 mb-3">About</h3>
                 <p className="text-slate-600 leading-relaxed text-sm">
                    {profile?.description || "No description provided yet."}
                 </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Type</p>
                    <p className="font-bold text-slate-800 capitalize">{profile?.business_type || "N/A"}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Experience</p>
                    <p className="font-bold text-slate-800">{profile?.years_experience ? `${profile.years_experience} Years` : "N/A"}</p>
                 </div>
                 {profile?.phone && (
                    <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                          <p className="font-bold text-slate-800">{profile.phone}</p>
                       </div>
                    </div>
                 )}
                 {profile?.website && (
                    <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                       </div>
                       <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-400 uppercase">Website</p>
                          <a href={profile.website} target="_blank" className="font-bold text-blue-600 truncate block hover:underline">{profile.website}</a>
                       </div>
                    </div>
                 )}
              </div>

              {/* Socials */}
              {profile?.social_links && profile.social_links.length > 0 && (
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Socials</h3>
                    <div className="flex gap-3">
                       {profile.social_links.map((link: any, i: number) => {
                          let icon;
                          let colorClass = "text-slate-600 hover:text-slate-900";
                          
                          if (link.platform === "linkedin") {
                             colorClass = "text-[#0077b5] hover:bg-[#0077b5]/10";
                             icon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
                          } else if (link.platform === "facebook") {
                             colorClass = "text-[#1877F2] hover:bg-[#1877F2]/10";
                             icon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
                          } else if (link.platform === "instagram") {
                             colorClass = "text-[#E4405F] hover:bg-[#E4405F]/10";
                             icon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
                          }

                          return (
                             <a key={i} href={link.url} target="_blank" className={`p-3 bg-slate-100 rounded-full transition-all hover:scale-110 ${colorClass}`}>
                                {icon}
                             </a>
                          );
                       })}
                    </div>
                 </div>
              )}
           </div>
         )}
      </div>

      <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
