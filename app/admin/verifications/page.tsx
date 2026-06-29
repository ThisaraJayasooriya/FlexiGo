"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import LoadingWave from "../../components/ui/LoadingWave";
import Toast from "../../components/ui/Toast";

interface VerificationItem {
  id: string;
  business_id: string;
  business_reg_type: string;
  br_number: string;
  registered_name: string;
  registered_address: string | null;
  owner_nic: string | null;
  certificate_url: string;
  additional_doc_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  submitted_at: string;
  company_name: string | null;
  logo_url: string | null;
}

export default function AdminVerificationsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVerifications = async (status: string) => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/api/admin/verifications?status=${status}`);
      setVerifications(data.verifications || []);
    } catch (err: any) {
      setError(err.message || "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications(activeTab);
  }, [activeTab]);

  const handleReviewSubmit = async (decision: "approved" | "rejected") => {
    if (!selectedVerification) return;
    if (decision === "rejected" && !reviewNote.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/admin/verifications/review", {
        verification_id: selectedVerification.id,
        decision,
        admin_note: reviewNote.trim() || undefined
      });
      
      // Close modal, reset note, refresh list
      setSelectedVerification(null);
      setReviewNote("");
      fetchVerifications(activeTab);
    } catch (err: any) {
      setError(err.message || `Failed to ${decision} verification`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError(null)} />}

      {/* Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-xl w-full">
        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
              activeTab === tab 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingWave />
          </div>
        ) : verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-medium">No {activeTab} reviews found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {verifications.map(v => (
              <div key={v.id} className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all group bg-white shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-start mb-5">
                  <div className="pr-4">
                    <h3 className="font-extrabold text-slate-900 text-xl leading-tight mb-1 truncate">{v.registered_name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{v.business_reg_type === "pvt_ltd" ? "Pvt Ltd" : "Sole Proprietor"} • {v.br_number}</p>
                  </div>
                  {v.status === "pending" && (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0">
                      Pending
                    </span>
                  )}
                  {v.status === "approved" && (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0">
                      Approved
                    </span>
                  )}
                  {v.status === "rejected" && (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6 flex-1 bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-600"><span className="font-bold text-slate-800">Submitted:</span> {new Date(v.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  {v.owner_nic && <p className="text-sm text-slate-600"><span className="font-bold text-slate-800">NIC:</span> {v.owner_nic}</p>}
                </div>

                <button 
                  onClick={() => setSelectedVerification(v)}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-auto"
                >
                  Review Application
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedVerification(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Review Verification</h3>
              <button onClick={() => setSelectedVerification(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Business Info</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Registered Name</p>
                      <p className="font-semibold text-slate-900">{selectedVerification.registered_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">BR Number</p>
                      <p className="font-semibold text-slate-900">{selectedVerification.br_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="font-semibold text-slate-900">{selectedVerification.business_reg_type}</p>
                    </div>
                    {selectedVerification.registered_address && (
                      <div>
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="font-semibold text-slate-900">{selectedVerification.registered_address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documents</h4>
                  <div className="space-y-3">
                    <a 
                      href={selectedVerification.certificate_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate">BR Certificate</p>
                        <p className="text-xs text-blue-500 group-hover:text-blue-600 font-medium">Click to view</p>
                      </div>
                    </a>

                    {selectedVerification.additional_doc_url && (
                      <a 
                        href={selectedVerification.additional_doc_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-sm truncate">Additional Doc</p>
                          <p className="text-xs text-slate-500 font-medium">Click to view</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Area (Only if pending) */}
              {selectedVerification.status === "pending" && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Admin Decision</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Note (Required for Rejection)</label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Add a reason for rejection or a note for approval..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReviewSubmit("rejected")}
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-colors active:scale-[0.98] disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReviewSubmit("approved")}
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Note (If already reviewed) */}
              {selectedVerification.status !== "pending" && (
                <div className="pt-6 border-t border-slate-100">
                  <div className={`p-4 rounded-xl border ${
                    selectedVerification.status === "approved" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                  }`}>
                    <p className="font-bold mb-1 capitalize">{selectedVerification.status}</p>
                    {selectedVerification.admin_note && (
                      <p className="text-sm opacity-90"><span className="font-semibold">Note:</span> {selectedVerification.admin_note}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
