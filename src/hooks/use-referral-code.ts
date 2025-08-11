"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export function useReferralCode() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setReferralCode(refParam);
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_referral", refParam);
      }
    } else if (typeof window !== "undefined") {
      const pendingRef = localStorage.getItem("pending_referral");
      if (pendingRef) {
        setReferralCode(pendingRef);
      }
    }
  }, [searchParams]);

  const submitReferral = async (refCode: string) => {
    if (isSubmitted) return;

    try {
      await axios.post(`${API_BASE_URL}/referrals`, { referralCode: refCode });
      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("pending_referral");
      }
    } catch (error) {
      console.error("Failed to register referral:", error);
    }
  };

  return { referralCode, submitReferral, isSubmitted };
}
