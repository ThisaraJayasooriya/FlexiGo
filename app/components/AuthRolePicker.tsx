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
          <div className={`text-3xl sm:text-4xl mb-2 transition-transform ${
            value === "worker" ? "scale-110" : ""
          }`}>👷</div>
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
          <div className={`text-3xl sm:text-4xl mb-2 transition-transform ${
            value === "business" ? "scale-110" : ""
          }`}>🏢</div>
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
