import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7] relative overflow-hidden font-sans antialiased">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#DBE2EF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#DBE2EF]/10 to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Navigation */}
        <header className="w-full px-5 sm:px-6 lg:px-8 py-5 sm:py-6 backdrop-blur-sm bg-white/40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/50">
                <img src="/icons/flexigo_logo.jpg" alt="FlexiGo Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#112D4E] tracking-tight">FlexiGo</span>
            </div>
            <Link 
              href="/login" 
              className="px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-[#112D4E] hover:text-[#3F72AF] transition-all duration-200 hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8 sm:space-y-10">
              <div className="space-y-5">
                <div className="inline-block px-4 py-2 bg-[#DBE2EF]/50 backdrop-blur-sm rounded-full mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-[#3F72AF] tracking-wide uppercase">Your Event Workforce Platform</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#112D4E] leading-[1.1] tracking-tight">
                  Connect with
                  <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#3F72AF] to-[#112D4E] mt-2">Talent Instantly</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                  Bridge event businesses with skilled part-time workers. Fast, reliable, and local connections for your event needs.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/register" 
                  className="group relative overflow-hidden px-8 py-4 sm:py-5 bg-linear-to-r from-[#3F72AF] to-[#112D4E] text-white text-base sm:text-lg font-bold rounded-2xl shadow-2xl hover:shadow-[#3F72AF]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
                <Link 
                  href="#features" 
                  className="px-8 py-4 sm:py-5 bg-white/80 backdrop-blur-sm text-[#112D4E] text-base sm:text-lg font-bold rounded-2xl border-2 border-[#112D4E]/20 hover:bg-[#112D4E] hover:text-white hover:border-[#112D4E] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 sm:gap-8 justify-center lg:justify-start pt-6">
                <div className="text-center lg:text-left transform hover:scale-110 transition-transform">
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-[#3F72AF] to-[#112D4E]">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wider mt-1">Available</div>
                </div>
                <div className="w-px bg-gray-300 hidden sm:block"></div>
                <div className="text-center lg:text-left transform hover:scale-110 transition-transform">
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-[#3F72AF] to-[#112D4E]">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wider mt-1">Secure</div>
                </div>
                <div className="w-px bg-gray-300 hidden sm:block"></div>
                <div className="text-center lg:text-left transform hover:scale-110 transition-transform">
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-[#3F72AF] to-[#112D4E]">Fast</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wider mt-1">Matching</div>
                </div>
              </div>
            </div>

            {/* Right Column - Features Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-4xl shadow-2xl p-6 sm:p-10 space-y-8 border border-white/20">
              <div className="space-y-3">
                <div className="inline-block px-3 py-1.5 bg-linear-to-r from-[#3F72AF]/10 to-[#112D4E]/10 rounded-full">
                  <span className="text-xs font-bold text-[#3F72AF] uppercase tracking-widest">Features</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#112D4E] text-center lg:text-left leading-tight tracking-tight">
                  Why Choose FlexiGo?
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-[#DBE2EF]/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#112D4E] mb-2 text-lg">Lightning Fast</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Connect with workers in seconds, not hours</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-[#DBE2EF]/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#DBE2EF] to-[#3F72AF]/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-[#112D4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#112D4E] mb-2 text-lg">Verified Professionals</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">All workers are vetted and rated by the community</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-[#DBE2EF]/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#112D4E] to-[#3F72AF] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#112D4E] mb-2 text-lg">Mobile First</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Progressive web app works seamlessly on any device</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-[#DBE2EF]/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <div className="shrink-0 w-14 h-14 bg-linear-to-br from-[#3F72AF] to-[#112D4E] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#112D4E] mb-2 text-lg">Fair Pricing</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Transparent rates with no hidden fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-5 sm:px-6 lg:px-8 py-8 border-t border-gray-200/50 backdrop-blur-sm bg-white/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-semibold text-gray-700">
                © 2025 <span className="text-[#3F72AF]">FlexiGo</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1.5 bg-linear-to-r from-[#DBE2EF]/50 to-[#3F72AF]/20 backdrop-blur-sm rounded-lg text-xs font-bold text-[#112D4E] border border-white/40">PWA</span>
                <span className="px-3 py-1.5 bg-linear-to-r from-[#DBE2EF]/50 to-[#3F72AF]/20 backdrop-blur-sm rounded-lg text-xs font-bold text-[#112D4E] border border-white/40">Mobile-First</span>
                <span className="px-3 py-1.5 bg-linear-to-r from-[#DBE2EF]/50 to-[#3F72AF]/20 backdrop-blur-sm rounded-lg text-xs font-bold text-[#112D4E] border border-white/40">Secure</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
