"use client";
import React from "react";

export default function AuthRolePicker({ value, onChange }: { value: "worker" | "business"; onChange: (v: "worker" | "business") => void; }) {
  return (
    <div className="inline-flex items-center gap-2 p-1.5 bg-gradient-to-r from-[#DBE2EF]/30 to-[#F9F7F7] rounded-2xl border border-[#DBE2EF]/50 shadow-inner mx-auto">
      <button
        type="button"
        onClick={() => onChange("worker")}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
          value === "worker" 
            ? "bg-gradient-to-r from-[#3F72AF] to-[#112D4E] text-white shadow-lg" 
            : "bg-transparent text-gray-600 hover:text-[#3F72AF]"
        }`}
      >
        <svg className={`w-5 h-5 transition-all ${
          value === "worker" ? "scale-110" : ""
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Worker</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("business")}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
          value === "business" 
            ? "bg-gradient-to-r from-[#3F72AF] to-[#112D4E] text-white shadow-lg" 
            : "bg-transparent text-gray-600 hover:text-[#3F72AF]"
        }`}
      >
        <svg className={`w-5 h-5 transition-all ${
          value === "business" ? "scale-110" : ""
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span>Business</span>
      </button>
    </div>
  );
}
