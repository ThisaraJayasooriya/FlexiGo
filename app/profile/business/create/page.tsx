"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/app/components/ui/Toast";

export default function CreateBusinessProfile() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("description", description);
      if (logo) formData.append("logo", logo);

      const res = await fetch("/api/businesses/profile/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create profile");

      setToast({
        type: "success",
        message: "Profile created successfully!"
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to create profile"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] flex items-center justify-center p-5 sm:p-6 font-sans antialiased relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-2xl w-full relative z-10">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-[#112D4E] hover:text-[#3F72AF] mb-6 transition-all duration-200 hover:gap-2 gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-4xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header - Centered */}
          <div className="text-center px-8 sm:px-12 pt-10 pb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#3F72AF] to-[#112D4E] mb-5 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] mb-3 tracking-tight">Complete Your Profile</h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Tell us about your business to start posting opportunities</p>
          </div>

          {/* Form */}
          <div className="px-8 sm:px-12 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Acme Events"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-[#3F72AF] focus:ring-4 focus:ring-[#3F72AF]/10 transition-all duration-200 text-[#112D4E] placeholder-gray-400 font-medium text-sm outline-none"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Company Logo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-upload"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-40 px-5 py-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-white hover:bg-gray-50 hover:border-[#3F72AF] transition-all duration-200"
                  >
                    {logoPreview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={logoPreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-xl transition-all duration-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/20 flex items-center justify-center mb-3">
                          <svg className="w-7 h-7 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-[#112D4E] mb-1">Click to upload logo</p>
                        <p className="text-xs text-gray-500">PNG or JPG (max 2MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Business Description
                </label>
                <textarea
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-[#3F72AF] focus:ring-4 focus:ring-[#3F72AF]/10 transition-all duration-200 text-[#112D4E] placeholder-gray-400 font-medium text-sm outline-none resize-none"
                  rows={5}
                  placeholder="Tell workers about your business, your values, and what makes you unique..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Minimum 50 characters</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full px-8 py-4 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white text-base font-bold rounded-2xl shadow-2xl hover:shadow-[#3F72AF]/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
