"use client";
import React from "react";

export default function AuthRolePicker({ value, onChange }: { value: "worker" | "business"; onChange: (v: "worker" | "business") => void; }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => onChange("worker")}
        className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
          value === "worker" 
            ? "border-[#124E66] bg-[#124E66]/5 shadow-lg scale-105" 
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <svg className={`w-10 h-10 sm:w-12 sm:h-12 transition-all ${
              value === "worker" ? "text-[#124E66] scale-110" : "text-gray-400"
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-sm sm:text-base font-bold text-gray-900 mb-1">Worker</div>
          <div className="text-xs text-gray-600">Find shifts</div>
        </div>
        {value === "worker" && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-[#124E66] rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
      <button
        type="button"
        onClick={() => onChange("business")}
        className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
          value === "business" 
            ? "border-[#124E66] bg-[#124E66]/5 shadow-lg scale-105" 
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <svg className={`w-10 h-10 sm:w-12 sm:h-12 transition-all ${
              value === "business" ? "text-[#124E66] scale-110" : "text-gray-400"
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-sm sm:text-base font-bold text-gray-900 mb-1">Business</div>
          <div className="text-xs text-gray-600">Post jobs</div>
        </div>
        {value === "business" && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-[#124E66] rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}
