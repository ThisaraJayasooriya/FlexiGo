"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initInactivityTracker, resetInactivityTimer } from "@/lib/activity-tracker";
import InactivityWarning from "./InactivityWarning";
import Toast from "./ui/Toast";

export default function AuthInitializer() {
  const pathname = usePathname();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Public paths - no tracking needed
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
    if (publicPaths.includes(pathname)) {
      return;
    }

    // Check if logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    // Initialize inactivity tracking
    const cleanup = initInactivityTracker({
      onWarning: () => {
        setShowWarning(true);
      },
      onLogout: () => {
        setShowWarning(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        sessionStorage.setItem('logout_message', 'You have been logged out due to inactivity.');
        router.push('/login');
      }
    });

    return cleanup;
  }, [pathname, router, mounted]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    resetInactivityTimer();
    setToast({ type: "success", message: "Session extended!" });
  };

  // Don't render anything on server side
  if (!mounted) return null;

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <InactivityWarning
        show={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
      />
    </>
  );
}
