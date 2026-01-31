"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import BottomNav, { NavItem } from "@/app/components/BottomNav";
import Toast from "@/app/components/ui/Toast";
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
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; path=/; max-age=0";
    router.push("/");
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
        subtitle="Business Portal"
        userName={profile?.company_name}
        userImage={profile?.logo_url}
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
              {/* Profile Image/Initials - Circular */}
              <div className="relative">
                {profile?.logo_url || logoPreview ? (
                  <img 
                    src={logoPreview || profile?.logo_url} 
                    alt={profile?.company_name} 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl ring-4 ring-white bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-[#3F72AF] to-[#112D4E] flex items-center justify-center shadow-2xl ring-4 ring-white">
                    <span className="text-white font-extrabold text-2xl sm:text-4xl">{getInitials(profile?.company_name || "")}</span>
                  </div>
                )}
                {editing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#3F72AF] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#112D4E] transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Profile Info */}
              <div className="flex-1 pt-2 sm:pt-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#112D4E] mb-1">{profile?.company_name}</h1>
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
                  {profile?.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile?.business_type && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#3F72AF] rounded-full text-xs font-semibold capitalize">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.business_type}
                    </span>
                  )}
                  {profile?.years_experience && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {profile.years_experience}+ years
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
                <p className="text-sm text-gray-600 mt-1">Update your business information</p>
              </div>
            </div>
            
            <div className="space-y-6">

              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                  placeholder="Enter company name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none resize-none"
                  placeholder="Describe your business"
                />
              </div>

              {/* Business Type & Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="events">Events & Entertainment</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="retail">Retail</option>
                    <option value="construction">Construction</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="technology">Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Phone & Years Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Years in Business
                  </label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 text-[#112D4E] font-medium outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                  <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Social Media Links
                </label>
                <div className="grid gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0077B5] font-bold text-sm">in</span>
                    <input
                      type="url"
                      placeholder="LinkedIn Profile URL"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1877F2] font-bold text-sm">f</span>
                    <input
                      type="url"
                      placeholder="Facebook Page URL"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E4405F] font-bold text-sm">ig</span>
                    <input
                      type="url"
                      placeholder="Instagram Profile URL"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all duration-200 outline-none"
                    />
                  </div>
                </div>
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
            {/* About Section */}
            {profile?.description && (
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#112D4E] mb-3 sm:mb-4">
                  <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}

            {/* Contact Information Grid */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {profile?.phone && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 mb-2">
                    <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone
                  </label>
                  <p className="text-[#112D4E] font-semibold">{profile.phone}</p>
                </div>
              )}

              {profile?.website && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 mb-2">
                    <svg className="w-4 h-4 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </label>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#3F72AF] font-semibold hover:underline break-all">{profile.website}</a>
                </div>
              )}
            </div>

            {/* Social Links */}
            {profile?.social_links && profile.social_links.length > 0 && (
              <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#112D4E] mb-3 sm:mb-4">
                  <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Social Media
                </h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {profile.social_links.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 bg-gray-50 hover:bg-linear-to-r hover:from-[#3F72AF] hover:to-[#112D4E] rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-md"
                    >
                      {link.platform === "linkedin" && (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-[#0077B5] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">in</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">LinkedIn</span>
                        </>
                      )}
                      {link.platform === "facebook" && (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">f</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">Facebook</span>
                        </>
                      )}
                      {link.platform === "instagram" && (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-[#E4405F] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">ig</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">Instagram</span>
                        </>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav items={businessNavItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
