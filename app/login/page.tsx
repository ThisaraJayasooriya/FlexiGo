"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import AuthForm from "@/app/components/AuthForm";
import Toast from "@/app/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ type: "error" | "success" | "info"; message: string } | null>(null);

  // Check for logout message
  useEffect(() => {
    const logoutMessage = sessionStorage.getItem('logout_message');
    if (logoutMessage) {
      setToast({ type: "info", message: logoutMessage });
      sessionStorage.removeItem('logout_message');
    }
  }, []);

  const handleLoginSuccess = async (json: any) => {
    // Backend returns { session: { access_token, refresh_token, user } }
    if (json?.session?.access_token) {
      const token = json.session.access_token;
      const refreshToken = json.session.refresh_token;
      
      localStorage.setItem("access_token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      
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
    <main className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] relative overflow-hidden font-sans antialiased flex items-center justify-center p-5 sm:p-6">
      {/* Decorative Background Elements - Matching Home Page */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#DBE2EF]/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#3F72AF]/5 rounded-full blur-2xl"></div>
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

        {/* Main Card with Glow Effect */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-[#3F72AF] to-[#112D4E] rounded-4xl blur-lg opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-4xl shadow-2xl border border-white/40 p-8 sm:p-10 lg:p-12 space-y-8">
            {/* Header - Centered */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-[#3F72AF] to-[#112D4E] shadow-xl ring-4 ring-white/50 group-hover:scale-105 transition-transform duration-300">
                <img src="/icons/flexigo_logo.jpg" alt="FlexiGo" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Sign in to continue to your account
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <AuthForm mode="login" onSuccess={handleLoginSuccess} />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            {/* Links - Better styled */}
            <div className="space-y-3 text-center">
              <Link 
                href="/forgot-password" 
                className="group/link inline-flex items-center gap-1 text-sm text-[#3F72AF] hover:text-[#112D4E] font-semibold transition-all duration-200 hover:gap-2"
              >
                <span>Forgot your password?</span>
                <svg className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="text-sm text-gray-600 font-medium">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="text-[#3F72AF] font-bold hover:text-[#112D4E] transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 font-medium mt-6">
          By signing in, you agree to our{" "}
          <span className="text-[#3F72AF] hover:text-[#112D4E] cursor-pointer transition-colors">Terms</span>
          {" & "}
          <span className="text-[#3F72AF] hover:text-[#112D4E] cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}
