"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] relative overflow-hidden font-sans antialiased scroll-smooth">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#DBE2EF]/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#3F72AF]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Navigation - Enhanced */}
        <header className="w-full px-5 sm:px-6 lg:px-8 py-5 sm:py-6 backdrop-blur-md bg-white/50 border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/50 group-hover:ring-[#3F72AF]/50 transition-all duration-300 group-hover:scale-105">
                <img src="/icons/flexigo_logo.jpg" alt="FlexiGo Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-linear-to-rrom-[#112D4E] to-[#3F72AF] bg-clip-text text-transparent tracking-tight">FlexiGo</span>
            </div>
            <Link 
              href="/login" 
              className="group/btn relative px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-[#112D4E] bg-white/80 backdrop-blur-sm rounded-lg border border-[#112D4E]/20 hover:border-[#3F72AF] hover:text-[#3F72AF] transition-all duration-300 shadow-md hover:shadow-lg overflow-hidden"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-linear-to-r from-[#3F72AF]/5 to-[#112D4E]/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </header>

        {/* Hero Section - Enhanced */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8 sm:space-y-10">
              <div className="space-y-6">
                <div className="inline-block px-5 py-2.5 bg-linear-to-r from-[#DBE2EF]/60 to-[#3F72AF]/20 backdrop-blur-sm rounded-full mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/40">
                  <span className="text-xs sm:text-sm font-bold text-[#3F72AF] tracking-wide uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#3F72AF] rounded-full"></span>
                    Flexible Workforce Platform
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#112D4E] leading-[1.1] tracking-tight">
                  Connect with
                  <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#3F72AF] via-[#3F72AF] to-[#112D4E] mt-2">Talent Instantly</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Bridge businesses with skilled part-time workers for any project. Fast, reliable, and local talent connections.
                </p>
              </div>

              {/* CTA Buttons - Enhanced */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/register" 
                  className="group relative overflow-hidden px-8 py-4 sm:py-5 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white text-base sm:text-lg font-bold rounded-2xl shadow-2xl hover:shadow-[#3F72AF]/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                <Link 
                  href="/install" 
                  className="px-8 py-4 sm:py-5 bg-white/90 backdrop-blur-sm text-[#112D4E] text-base sm:text-lg font-bold rounded-2xl border-2 border-[#112D4E]/20 hover:bg-[#3F72AF] hover:text-white hover:border-[#3F72AF] transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install App
                </Link>
              </div>

              {/* Stats - Refined */}
              <div className="inline-flex flex-wrap items-center gap-4 sm:gap-6 justify-center lg:justify-start pt-6 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/40 shadow-md">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#3F72AF]/10 to-[#112D4E]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#112D4E]">24/7</div>
                    <div className="text-xs text-gray-500">Available</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#3F72AF]/10 to-[#112D4E]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#112D4E]">Verified</div>
                    <div className="text-xs text-gray-500">Profiles</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#3F72AF]/10 to-[#112D4E]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-[#3F72AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#112D4E]">Instant</div>
                    <div className="text-xs text-gray-500">Matching</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Features Card - Enhanced */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-[#3F72AF] to-[#112D4E] rounded-4xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-4xl shadow-2xl p-8 sm:p-10 space-y-8 border border-white/40 hover:shadow-[#3F72AF]/20 transition-all duration-500">
                <div className="space-y-4">
                  <div className="inline-block px-4 py-2 bg-linear-to-r from-[#3F72AF]/10 to-[#112D4E]/10 rounded-full">
                    <span className="text-xs font-bold text-[#3F72AF] uppercase tracking-widest">Features</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] leading-tight tracking-tight">
                    Why Choose FlexiGo?
                  </h2>
                </div>
                
                <div className="space-y-5">
                  {/* Feature 1 */}
                  <div className="group/item flex items-start gap-5 p-5 rounded-2xl bg-linear-to-br from-[#DBE2EF]/20 to-transparent hover:from-[#DBE2EF]/40 hover:to-[#3F72AF]/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer border border-transparent hover:border-[#3F72AF]/20">
                    <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#112D4E] mb-1 text-base group-hover/item:text-[#3F72AF] transition-colors">Quick Connections</h3>
                      <p className="text-sm text-gray-600">Match in seconds</p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="group/item flex items-start gap-5 p-5 rounded-2xl bg-linear-to-br from-[#DBE2EF]/20 to-transparent hover:from-[#DBE2EF]/40 hover:to-[#3F72AF]/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer border border-transparent hover:border-[#3F72AF]/20">
                    <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/40 rounded-2xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#112D4E] mb-1 text-base group-hover/item:text-[#3F72AF] transition-colors">Trusted Workers</h3>
                      <p className="text-sm text-gray-600">Vetted & community-rated</p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="group/item flex items-start gap-5 p-5 rounded-2xl bg-linear-to-br from-[#DBE2EF]/20 to-transparent hover:from-[#DBE2EF]/40 hover:to-[#3F72AF]/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer border border-transparent hover:border-[#3F72AF]/20">
                    <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#112D4E] to-[#3F72AF] rounded-2xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#112D4E] mb-1 text-base group-hover/item:text-[#3F72AF] transition-colors">Work Anywhere</h3>
                      <p className="text-sm text-gray-600">Mobile-optimized platform</p>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="group/item flex items-start gap-5 p-5 rounded-2xl bg-linear-to-br from-[#DBE2EF]/20 to-transparent hover:from-[#DBE2EF]/40 hover:to-[#3F72AF]/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer border border-transparent hover:border-[#3F72AF]/20">
                    <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#112D4E] mb-1 text-base group-hover/item:text-[#3F72AF] transition-colors">Clear Pricing</h3>
                      <p className="text-sm text-gray-600">No hidden costs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - New */}
        <section id="features" className="w-full px-5 sm:px-6 lg:px-8 py-16 sm:py-24 bg-linear-to-b from-transparent via-white/50 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-block px-4 py-2 bg-linear-to-r from-[#DBE2EF]/60 to-[#3F72AF]/20 backdrop-blur-sm rounded-full shadow-lg border border-white/40">
                <span className="text-xs font-bold text-[#3F72AF] uppercase tracking-wider">How It Works</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
                Get Started in 3 Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="group relative text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="mt-8 mb-6 w-16 h-16 mx-auto bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#112D4E] mb-2">Create Profile</h3>
                <p className="text-sm text-gray-600">Quick 2-minute setup</p>
              </div>

              {/* Step 2 */}
              <div className="group relative text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" style={{ transitionDelay: '100ms' }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="mt-8 mb-6 w-16 h-16 mx-auto bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#112D4E] mb-2">Find Matches</h3>
                <p className="text-sm text-gray-600">Browse & match instantly</p>
              </div>

              {/* Step 3 */}
              <div className="group relative text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" style={{ transitionDelay: '200ms' }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="mt-8 mb-6 w-16 h-16 mx-auto bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#112D4E] mb-2">Start Working</h3>
                <p className="text-sm text-gray-600">Connect & collaborate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Enhanced */}
        <footer className="w-full px-5 sm:px-6 lg:px-8 py-10 border-t border-gray-200/50 backdrop-blur-md bg-white/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/50">
                  <img src="/icons/flexigo_logo.jpg" alt="FlexiGo Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    © 2025 <span className="bg-linear-to-r from-[#3F72AF] to-[#112D4E] bg-clip-text text-transparent">FlexiGo</span>
                  </p>
                  <p className="text-xs text-gray-600">All rights reserved.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="group px-4 py-2 bg-linear-to-r from-[#DBE2EF]/60 to-[#3F72AF]/20 backdrop-blur-sm rounded-xl text-xs font-bold text-[#112D4E] border border-white/40 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    PWA
                  </span>
                </span>
                <span className="px-4 py-2 bg-linear-to-r from-[#DBE2EF]/60 to-[#3F72AF]/20 backdrop-blur-sm rounded-xl text-xs font-bold text-[#112D4E] border border-white/40 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">Mobile-First</span>
                <span className="px-4 py-2 bg-linear-to-r from-[#DBE2EF]/60 to-[#3F72AF]/20 backdrop-blur-sm rounded-xl text-xs font-bold text-[#112D4E] border border-white/40 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md">Secure</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
