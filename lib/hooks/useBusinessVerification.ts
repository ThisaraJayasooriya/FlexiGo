"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { isBusinessVerified } from "@/lib/businessVerification.shared";

interface UseBusinessVerificationOptions {
  redirectIfUnverified?: boolean;
}

export function useBusinessVerification(options: UseBusinessVerificationOptions = {}) {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/check")
      .then((data) => {
        const status = data.verification_status || "unverified";
        setVerificationStatus(status);

        if (options.redirectIfUnverified && !isBusinessVerified(status)) {
          router.replace("/verification");
        }
      })
      .catch(() => {
        if (options.redirectIfUnverified) {
          router.replace("/verification");
        }
      })
      .finally(() => setLoading(false));
  }, [router, options.redirectIfUnverified]);

  return {
    verificationStatus,
    loading,
    isVerified: isBusinessVerified(verificationStatus),
  };
}
