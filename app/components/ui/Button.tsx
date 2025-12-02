"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
};
export default function Button({ children, variant = "primary", fullWidth = false, disabled, ...rest }: Props) {
  const base = "rounded-xl px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-300 active:scale-98";
  const primary = "bg-[#124E66] text-white hover:bg-[#0d3a4d] shadow-lg hover:shadow-xl";
  const ghost = "bg-white border-2 border-gray-200 text-[#124E66] hover:border-[#124E66] hover:bg-gray-50";
  const disabledStyles = "opacity-50 cursor-not-allowed";
  const widthClass = fullWidth ? "w-full" : "";
  
  const cls = `${base} ${variant === "primary" ? primary : ghost} ${widthClass} ${disabled ? disabledStyles : ""}`;
  
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
