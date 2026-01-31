"use client";
import { useEffect, useState } from "react";

interface InactivityWarningProps {
  show: boolean;
  onStayLoggedIn: () => void;
}

export default function InactivityWarning({ show, onStayLoggedIn }: InactivityWarningProps) {
  const [countdown, setCountdown] = useState(5 * 60); // 5 minutes in seconds

  useEffect(() => {
    if (!show) {
      setCountdown(5 * 60);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Are you still there?
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          You'll be logged out in <span className="font-bold text-yellow-600">{minutes}:{seconds.toString().padStart(2, '0')}</span> due to inactivity for security reasons.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onStayLoggedIn}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#3F72AF] to-[#112D4E] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            Yes, I'm here - Stay Logged In
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              document.cookie = 'access_token=; path=/; max-age=0';
              window.location.href = '/login';
            }}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            Logout Now
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          This helps protect your account when you step away
        </p>
      </div>
    </div>
  );
}
