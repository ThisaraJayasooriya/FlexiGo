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
    // If email confirmation is enabled, notify user to check email and redirect to login page.
    router.push("/login");
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
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#124E66] mb-4">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Join FlexiGo</h2>
            <p className="text-sm sm:text-base text-gray-600">Create your account and get started</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
            <AuthRolePicker value={role} onChange={setRole} />
          </div>

          {/* Form */}
          <AuthForm mode="register" role={role} onSuccess={handleSuccess} />

          {/* Links */}
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-gray-600">
              Already have an account? <span className="text-[#124E66] font-medium hover:underline">Sign in</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </main>
  );
}
