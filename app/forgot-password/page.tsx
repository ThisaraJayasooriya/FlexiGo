"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Toast from "@/app/components/ui/Toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to send reset email");

      setToast({
        type: "success",
        message: "Password reset email sent! Check your inbox.",
      });
      setEmailSent(true);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to send reset email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#D3D9D2] flex items-center justify-center p-4 sm:p-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-[#124E66] mb-6 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          {!emailSent ? (
            <>
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#124E66] mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-5 h-5 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send password reset instructions to this email
                  </p>
                </div>

                <Button type="submit" disabled={loading} fullWidth>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>

              {/* Help Link */}
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-gray-600">
                  Remember your password? <span className="text-[#124E66] font-medium hover:underline">Sign in</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Check Your Email</h3>
                <p className="text-gray-600 mb-6">
                  We've sent password reset instructions to <span className="font-semibold text-gray-900">{email}</span>
                </p>
                
                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-left">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Next Steps</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Check your email inbox and spam folder</li>
                        <li>• Click the reset link in the email</li>
                        <li>• Create a new password</li>
                        <li>• Link expires in 1 hour</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="w-full text-sm text-[#124E66] font-medium hover:underline"
                  >
                    Use a different email
                  </button>
                  <Link
                    href="/login"
                    className="block w-full rounded-xl px-6 py-3 bg-[#124E66] text-white text-sm font-semibold hover:bg-[#0d3a4d] transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Having trouble? Contact our support team
        </p>
      </div>
    </main>
  );
}
