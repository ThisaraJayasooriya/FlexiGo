"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import AuthForm from "@/app/components/AuthForm";
import Toast from "@/app/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const handleLoginSuccess = async (json: any) => {
    // Backend returns { session: { access_token, refresh_token, user } }
    if (json?.session?.access_token) {
      const token = json.session.access_token;
      localStorage.setItem("access_token", token);

      // Check if user needs to complete profile
      try {
        const checkRes = await fetch("/api/check", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (checkRes.ok) {
          const userData = await checkRes.json();
          
          // If first login not complete, redirect to profile creation
          if (!userData.first_login_complete) {
            if (userData.role === "worker") {
              router.push("/profile/worker/create");
            } else if (userData.role === "business") {
              router.push("/profile/business/create");
            } else {
              router.push("/dashboard");
            }
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Profile check error:", error);
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#D3D9D2] flex items-center justify-center p-4 sm:p-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-[#124E66] mb-6 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#124E66] mb-4">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm sm:text-base text-gray-600">Sign in to your FlexiGo account</p>
          </div>

          {/* Form */}
          <AuthForm mode="login" onSuccess={handleLoginSuccess} />

          {/* Links */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <Link href="/forgot-password" className="text-[#124E66] hover:underline font-medium">
              Forgot password?
            </Link>
            <Link href="/register" className="text-gray-600">
              Don't have an account? <span className="text-[#124E66] font-medium hover:underline">Sign up</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </main>
  );
}
