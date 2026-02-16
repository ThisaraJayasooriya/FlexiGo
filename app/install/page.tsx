"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallGuide() {
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3F72AF] to-[#112D4E] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-[#3F72AF] transition-colors">Back to Home</span>
          </Link>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Install Guide</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Install <span className="text-[#3F72AF]">FlexiGo</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Add FlexiGo to your home screen for the best experience. It's fast, secure, and works offline.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex relative">
            <button
              onClick={() => setActiveTab("android")}
              className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "android" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className={`w-5 h-5 ${activeTab === 'android' ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 9.48l1.83-3.18a.49.49 0 0 0-.21-.68.49.49 0 0 0-.68.21l-1.85 3.19a9.14 9.14 0 0 0-4.69-1.3c-1.74 0-3.35.48-4.69 1.3L5.47 5.82a.49.49 0 0 0-.68-.21.49.49 0 0 0-.21.68l1.83 3.18C3.76 11.23 2 14.28 2 17.76h20c0-3.48-1.76-6.53-4.4-8.28ZM7.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/>
              </svg>
              Android (Chrome)
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "ios" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className={`w-5 h-5 ${activeTab === 'ios' ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor">
                 <path d="M17.3333 13.1333C17.3333 10.7333 19.3333 9.53333 19.4667 9.46667C18.3333 7.8 16.6 7.53333 16 7.46667C14.5333 7.33333 13.1333 8.33333 12.4 8.33333C11.6667 8.33333 10.4667 7.46667 9.26667 7.46667C7.66667 7.46667 6.2 8.4 5.4 9.8C3.73333 12.6667 5 16.8667 6.6 19.2C7.4 20.3333 8.33333 21.6 9.6 21.5333C10.8 21.5333 11.2667 20.8 12.8 20.8C14.2667 20.8 14.7333 21.5333 16.0667 21.5333C17.4 21.5333 18.2 20.4 19 19.2C19.5333 18.4 20.2667 17.2 20.6667 16.2C20.6 16.2 17.3333 14.9333 17.3333 13.1333ZM12.9333 5.6C13.6 4.8 14.0667 3.66667 13.9333 2.53333C12.9333 2.6 11.7333 3.2 11 4.06667C10.4 4.8 9.86667 5.93333 10.0667 7.06667C11.1333 7.13333 12.2667 6.46667 12.9333 5.6Z"/>
              </svg>
              iOS (Safari)
            </button>
            <div
              className={`absolute top-1.5 bottom-1.5 w-[50%] bg-[#3F72AF] rounded-xl transition-all duration-300 shadow-sm ${
                activeTab === "android" ? "left-1.5" : "left-[48.5%]"
              }`}
            ></div>
          </div>
        </div>

        {/* Instructions Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[32px] p-8 sm:p-10 shadow-xl border border-slate-100"
          >
            {activeTab === "android" ? (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                   <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                     <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M17.6 9.48l1.83-3.18a.49.49 0 0 0-.21-.68.49.49 0 0 0-.68.21l-1.85 3.19a9.14 9.14 0 0 0-4.69-1.3c-1.74 0-3.35.48-4.69 1.3L5.47 5.82a.49.49 0 0 0-.68-.21.49.49 0 0 0-.21.68l1.83 3.18C3.76 11.23 2 14.28 2 17.76h20c0-3.48-1.76-6.53-4.4-8.28ZM7.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/>
                     </svg>
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-slate-800">Chrome on Android</h2>
                     <p className="text-slate-500 text-sm">Follow these 3 simple steps</p>
                   </div>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div>
                            <p className="font-bold text-slate-800">Open Menu</p>
                            <p className="text-sm text-slate-600 mt-1">Tap the <span className="font-bold">three dots (⋮)</span> icon in the top right corner of your browser.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div>
                            <p className="font-bold text-slate-800">Select Install</p>
                            <p className="text-sm text-slate-600 mt-1">Look for and tap <span className="font-bold">"Install app"</span> or <span className="font-bold">"Add to Home Screen"</span>.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div>
                            <p className="font-bold text-slate-800">Confirm</p>
                            <p className="text-sm text-slate-600 mt-1">Tap <span className="font-bold">Install</span> when prompted. The app iconic will appear on your home screen.</p>
                        </div>
                    </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                   <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                     <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17.3333 13.1333C17.3333 10.7333 19.3333 9.53333 19.4667 9.46667C18.3333 7.8 16.6 7.53333 16 7.46667C14.5333 7.33333 13.1333 8.33333 12.4 8.33333C11.6667 8.33333 10.4667 7.46667 9.26667 7.46667C7.66667 7.46667 6.2 8.4 5.4 9.8C3.73333 12.6667 5 16.8667 6.6 19.2C7.4 20.3333 8.33333 21.6 9.6 21.5333C10.8 21.5333 11.2667 20.8 12.8 20.8C14.2667 20.8 14.7333 21.5333 16.0667 21.5333C17.4 21.5333 18.2 20.4 19 19.2C19.5333 18.4 20.2667 17.2 20.6667 16.2C20.6 16.2 17.3333 14.9333 17.3333 13.1333ZM12.9333 5.6C13.6 4.8 14.0667 3.66667 13.9333 2.53333C12.9333 2.6 11.7333 3.2 11 4.06667C10.4 4.8 9.86667 5.93333 10.0667 7.06667C11.1333 7.13333 12.2667 6.46667 12.9333 5.6Z"/></svg>
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-slate-800">Safari on iOS</h2>
                     <p className="text-slate-500 text-sm">Follow these 3 simple steps</p>
                   </div>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div>
                            <p className="font-bold text-slate-800">Tap Share</p>
                            <p className="text-sm text-slate-600 mt-1">Tap the <span className="font-bold">Share icon</span> (square with arrow) in the bottom menu bar.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div>
                            <p className="font-bold text-slate-800">Find 'Add to Home Screen'</p>
                            <p className="text-sm text-slate-600 mt-1">Scroll down the list of options and tap <span className="font-bold">"Add to Home Screen"</span>.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div>
                            <p className="font-bold text-slate-800">Confirm</p>
                            <p className="text-sm text-slate-600 mt-1">Tap <span className="font-bold">Add</span> in the top right corner. The app will appear on your home screen.</p>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center pt-8">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#3F72AF] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#112D4E] transition-all"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
        </div>
      </main>
    </div>
  );
}
