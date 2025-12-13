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
      
      // Set cookie for middleware
      document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;

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
    <main className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] flex items-center justify-center p-5 sm:p-6 font-sans antialiased relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="max-w-md w-full relative z-10">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#112D4E] hover:text-[#3F72AF] mb-6 transition-all duration-200 hover:gap-2 gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-4xl shadow-2xl border border-white/20">
          {/* Header - Centered */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#3F72AF] to-[#112D4E] mb-5 shadow-lg ring-2 ring-white/50">
              <img src="/icons/flexigo_logo.jpg" alt="FlexiGo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] mb-3 tracking-tight">Welcome back</h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <AuthForm mode="login" onSuccess={handleLoginSuccess} />
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          {/* Links - Better aligned */}
          <div className="space-y-4 text-center">
            <Link href="/forgot-password" className="block text-sm text-[#3F72AF] hover:text-[#112D4E] font-semibold transition-colors">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600 font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#3F72AF] font-bold hover:text-[#112D4E] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 font-semibold mt-6">
          By signing in, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </main>
  );
}
