"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function ProfileRouter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const res = await apiClient.get("/api/check");
      const json = await res.json();
      
      if (!res.ok) throw new Error(json?.error || "Failed to check user role");

      // Route to appropriate profile page
      if (json.role === "business") {
        router.replace("/profile/business");
      } else if (json.role === "worker") {
        router.replace("/profile/worker");
      }
    } catch (error) {
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F9F7F7] via-[#DBE2EF]/20 to-[#F9F7F7]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3F72AF] border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading...</p>
      </div>
    </div>
  );
}
