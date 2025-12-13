"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Toast from "@/app/components/ui/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success" | "warning"; message: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Get access token from URL hash (Supabase redirect format)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get("access_token");
    
    if (token) {
      setAccessToken(token);
    } else {
      setToast({
        type: "error",
        message: "Invalid or expired reset link",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Validation
    if (password.length < 6) {
      setToast({
        type: "warning",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    if (password !== confirmPassword) {
      setToast({
        type: "warning",
        message: "Passwords do not match",
      });
      return;
    }

    if (!accessToken) {
      setToast({
        type: "error",
        message: "Invalid reset link. Please request a new one.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          access_token: accessToken,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to reset password");

      setToast({
        type: "success",
        message: "Password updated successfully!",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Failed to reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] flex items-center justify-center p-5 sm:p-6 font-sans antialiased relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="max-w-md w-full relative z-10">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-white/20">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3F72AF] to-[#112D4E] mb-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] mb-2 tracking-tight">Reset Your Password</h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-[#112D4E] mb-2">
                <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-[#112D4E] mb-2">
                <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                Re-enter your new password
              </p>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="bg-gradient-to-br from-[#DBE2EF]/30 to-[#3F72AF]/10 border-2 border-[#DBE2EF] rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold text-[#112D4E]">Password Requirements</span>
                </div>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                    {password.length >= 6 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    At least 6 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${password === confirmPassword && password.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {password === confirmPassword && password.length > 0 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    Passwords match
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button type="submit" disabled={loading || !accessToken} fullWidth>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Password
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-gray-600 font-medium">
              Didn't receive the email? <span className="text-[#3F72AF] font-bold hover:text-[#112D4E] transition-colors">Resend</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 font-semibold mt-6">
          <Link href="/login" className="text-[#3F72AF] hover:text-[#112D4E] transition-colors">
            Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}
