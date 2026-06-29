"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import Header from "../components/Header";
import Toast from "../components/ui/Toast";
import LoadingWave from "../components/ui/LoadingWave";

export default function VerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Form State
  const [regType, setRegType] = useState("pvt_ltd");
  const [brNumber, setBrNumber] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [ownerNic, setOwnerNic] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);
  const [additionalDoc, setAdditionalDoc] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await apiClient.get("/api/verification/status");
        setStatus(data.verification_status || "unverified");
        if (data.verification_status === "rejected" && data.latest_submission) {
          setAdminNote(data.latest_submission.admin_note);
        }
      } catch (error) {
        console.error("Failed to fetch status", error);
        setToast({ type: "error", message: "Failed to load verification status" });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificate) {
      setToast({ type: "error", message: "Please upload your business registration certificate" });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("business_reg_type", regType);
      formData.append("br_number", brNumber);
      formData.append("registered_name", registeredName);
      if (registeredAddress) formData.append("registered_address", registeredAddress);
      if (ownerNic) formData.append("owner_nic", ownerNic);
      formData.append("certificate", certificate);
      if (additionalDoc) formData.append("additional_doc", additionalDoc);

      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit verification");

      setStatus("pending");
      setToast({ type: "success", message: "Verification submitted successfully!" });
    } catch (error: any) {
      setToast({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingWave />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <Header 
        title="Verification" 
        subtitle="Business Details" 
        rightContent={
          <button onClick={() => router.push("/dashboard")} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Cancel
          </button>
        }
      />

      <main className="max-w-md mx-auto px-5 py-6 space-y-6">
        
        {/* Status Views */}
        {status === "pending" && (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm mt-8">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Under Review</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your business documents have been received and are currently being reviewed by our team. This usually takes 1-2 business days.
            </p>
            <button onClick={() => router.push("/dashboard")} className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              Return to Dashboard
            </button>
          </div>
        )}

        {status === "approved" && (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm mt-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verified Business</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your business has been verified. You now have full access to post jobs and hire workers.
            </p>
            <button onClick={() => router.push("/jobs/create")} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              Post a Job Now
            </button>
          </div>
        )}

        {/* Form View (Unverified or Rejected) */}
        {(status === "unverified" || status === "rejected") && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {status === "rejected" && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Verification Rejected
                </div>
                <p className="text-sm text-red-700 bg-white/50 p-3 rounded-lg">
                  <span className="font-semibold">Reason:</span> {adminNote || "Your documents did not meet our requirements."}
                </p>
                <p className="text-xs text-red-600 mt-2 font-medium">Please review the feedback and submit your details again.</p>
              </div>
            )}

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Business Details</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Business Type *</label>
                <select 
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="pvt_ltd">Private Limited Company</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Registration Number *</label>
                <input 
                  type="text"
                  value={brNumber}
                  onChange={(e) => setBrNumber(e.target.value)}
                  placeholder="e.g., PV00234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Registered Name *</label>
                <input 
                  type="text"
                  value={registeredName}
                  onChange={(e) => setRegisteredName(e.target.value)}
                  placeholder="Exact name on certificate"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Registered Address</label>
                <textarea 
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Address on certificate (optional)"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Owner NIC</label>
                <input 
                  type="text"
                  value={ownerNic}
                  onChange={(e) => setOwnerNic(e.target.value)}
                  placeholder="Owner's National ID (optional)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Documents</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">BR Certificate *</label>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">Please upload a clear image or PDF of your Business Registration Certificate.</p>
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer">
                  <input 
                    type="file" 
                    onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  {certificate ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-full px-2">{certificate.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <span className="text-sm font-medium text-slate-600">Tap to upload file</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Additional Document</label>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">Any supporting document (optional).</p>
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer">
                  <input 
                    type="file" 
                    onChange={(e) => setAdditionalDoc(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {additionalDoc ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-full px-2">{additionalDoc.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      <span className="text-sm font-medium text-slate-600">Tap to add file</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Verification"
              )}
            </button>
            
          </form>
        )}

      </main>
    </div>
  );
}
