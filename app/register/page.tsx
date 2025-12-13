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
    <main className="min-h-screen bg-gradient-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] flex items-center justify-center p-5 sm:p-6 font-sans antialiased relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#112D4E] hover:text-[#3F72AF] mb-6 transition-all duration-200 hover:gap-2 gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-white/20">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3F72AF] to-[#112D4E] mb-4 shadow-lg ring-2 ring-white/50">
              <img src="/icons/flexigo_logo.jpg" alt="FlexiGo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] mb-2 tracking-tight">Join FlexiGo</h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Create your account and get started</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#112D4E] mb-3 tracking-wide">I am a...</label>
            <AuthRolePicker value={role} onChange={setRole} />
          </div>

          {/* Form */}
          <AuthForm mode="register" role={role} onSuccess={handleSuccess} />

          {/* Links */}
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-gray-600 font-medium">
              Already have an account? <span className="text-[#3F72AF] font-bold hover:text-[#112D4E] transition-colors">Sign in</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 font-semibold mt-6">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </main>
  );
}
