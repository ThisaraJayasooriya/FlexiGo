"use client";
import React, { useState } from "react";
import Link from "next/link";
import AuthRolePicker from "@/app/components/AuthRolePicker";
import AuthForm from "@/app/components/AuthForm";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [role, setRole] = useState<"worker" | "business">("worker");
  const router = useRouter();

  const handleSuccess = (res: any) => {
    // Backend on register may send user object or session depending on your implementation.
    // After registration, redirect to login page
    // User will need to login and then complete their profile
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] relative overflow-hidden font-sans antialiased flex items-center justify-center p-5 sm:p-6">
      {/* Decorative Background Elements - Matching Login Page */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#DBE2EF]/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#3F72AF]/5 rounded-full blur-2xl"></div>
      </div>

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
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">Join FlexiGo</h2>
                <p className="text-sm sm:text-base text-gray-600 font-medium">Create your account to get started</p>
              </div>
            </div>

            {/* Role Selection - Compact Design */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Select Account Type</label>
              <div className="flex justify-center">
                <AuthRolePicker value={role} onChange={setRole} />
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <AuthForm mode="register" role={role} onSuccess={handleSuccess} />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            {/* Links - Better styled */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-[#3F72AF] font-bold hover:text-[#112D4E] transition-colors duration-200 hover:underline decoration-2 underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 font-medium mt-6">
          By signing up, you agree to our{" "}
          <span className="text-[#3F72AF] hover:text-[#112D4E] cursor-pointer transition-colors">Terms</span>
          {" & "}
          <span className="text-[#3F72AF] hover:text-[#112D4E] cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}
