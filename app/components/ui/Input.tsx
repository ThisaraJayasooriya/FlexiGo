"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;
export default function Input(props: Props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm sm:text-base focus:outline-none focus:border-[#124E66] focus:ring-4 focus:ring-[#124E66]/10 transition-all duration-200 placeholder:text-gray-400"
    />
  );
}
