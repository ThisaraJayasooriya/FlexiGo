"use client";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  onLogout?: () => void;
  rightContent?: React.ReactNode;
  userName?: string;
  userImage?: string;
  onProfileClick?: () => void;
}

export default function Header({ 
  title = "FlexiGo", 
  subtitle, 
  showLogo = true,
  onLogout,
  rightContent,
  userName,
  userImage,
  onProfileClick
}: HeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showLogo && (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                <img src="/icons/flexigo_logo.jpg" alt="FlexiGo" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#112D4E]">{title}</h1>
              {subtitle && (
                <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          
          {rightContent ? (
            rightContent
          ) : (
            <div className="flex items-center gap-3">
              {userName && (
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-3 hover:bg-gray-50/50 rounded-full px-4 py-2 transition-all duration-200 hover:shadow-md"
                >
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt={userName} 
                      className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#3F72AF] to-[#112D4E] flex items-center justify-center shadow-md ring-2 ring-white">
                      <span className="text-white font-bold text-sm">{getInitials(userName)}</span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-[#112D4E] truncate max-w-[150px]">{userName}</span>
                </button>
              )}
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-[#3F72AF] transition-colors"
                  aria-label="Logout"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
