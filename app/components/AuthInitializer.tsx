"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initializeAuthManager, cleanupAuthManager } from "@/lib/auth-manager";
import InactivityWarning from "./InactivityWarning";
import Toast from "./ui/Toast";

export default function AuthInitializer() {
  const pathname = usePathname();
  const router = useRouter();
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    // Only initialize on authenticated pages
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
    const isPublicPath = publicPaths.includes(pathname);
    
    if (isPublicPath) {
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
      return; // Not logged in, nothing to initialize
    }

    // Initialize auth manager
    initializeAuthManager({
      onInactivityWarning: () => {
        setShowInactivityWarning(true);
      },
      onInactivityLogout: () => {
        setShowInactivityWarning(false);
        setToast({
          type: "info",
          message: "You have been logged out due to inactivity for security."
        });
        
        setTimeout(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; path=/; max-age=0';
          sessionStorage.setItem('logout_message', 'You have been logged out due to inactivity.');
          router.push('/login');
        }, 2000);
      },
      onTokenRefreshFailed: () => {
        setToast({
          type: "error",
          message: "Session expired. Please login again."
        });
        
        setTimeout(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; path=/; max-age=0';
          router.push('/login');
        }, 2000);
      }
    });

    // Cleanup on unmount
    return () => {
      cleanupAuthManager();
    };
  }, [pathname, router]);

  const handleStayLoggedIn = () => {
    setShowInactivityWarning(false);
    // Activity will be automatically tracked by moving the mouse/clicking
    setToast({
      type: "success",
      message: "You're still logged in. Session extended."
    });
  };

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
        show={showInactivityWarning}
        onStayLoggedIn={handleStayLoggedIn}
      />
    </>
  );
}
