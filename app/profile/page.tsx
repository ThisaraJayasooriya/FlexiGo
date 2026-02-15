"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingWave from "@/app/components/ui/LoadingWave"; // Added import
import { apiClient } from "@/lib/api-client";

export default function ProfileRouter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const json = await apiClient.get("/api/check");

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
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F7]">
      <div className="text-center flex flex-col items-center">
        <LoadingWave />
        <p className="text-[#3F72AF] font-medium mt-4 animate-pulse">Redirecting...</p>
      </div>
    </div>
  );
}
