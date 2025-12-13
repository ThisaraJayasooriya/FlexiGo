import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#D3D9D2] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Logo & Branding */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
            <img src="/icons/flexigo_logo.jpg" alt="FlexiGo Logo" className="w-full h-full object-contain rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#124E66] mb-3">
            FlexiGo
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4 leading-relaxed">
            Connect event businesses with reliable part-time workers — quick, fair, and local.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link 
              href="/register" 
              className="group relative overflow-hidden w-full rounded-xl px-6 py-4 bg-[#124E66] text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#0d3a4d] active:scale-98"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
            <Link 
              href="/login" 
              className="w-full rounded-xl px-6 py-4 bg-white border-2 border-[#124E66] text-[#124E66] text-sm sm:text-base font-semibold hover:bg-[#124E66] hover:text-white transition-all duration-300 active:scale-98"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-md">
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Fast</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-md">
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Fair</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-md">
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#124E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Mobile</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-gray-500">
          PWA • Mobile-first • Powered by Next.js & Supabase
        </p>
      </div>
    </main>
  );
}
