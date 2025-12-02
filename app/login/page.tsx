"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/app/components/AuthForm";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (json: any) => {
    // Example: backend returns { session: { access_token, refresh_token, user } }
    // Save token (for now) and redirect to dashboard.
    if (json?.session?.access_token) {
      // Minimal approach — store in localStorage (later use httpOnly cookies)
      localStorage.setItem("access_token", json.session.access_token);
      router.push("/dashboard");
    } else {
      // some setups return user directly — adjust accordingly
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#D3D9D2] flex items-center justify-center p-4 sm:p-6">
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
