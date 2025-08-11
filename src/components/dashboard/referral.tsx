"use client";

import { useReferral } from "@/lib/query-helper";
import { useSubmitReferral } from "@/lib/mutation-helper";
import { useState } from "react";
import GlareButton from "@/components/ui/glare-button";

export default function Referral() {
  const [referralCode, setReferralCode] = useState("");
  const referralQuery = useReferral();
  const submitMutation = useSubmitReferral();

  const handleSubmit = () => {
    submitMutation.mutate(referralCode, {
      onSuccess: () => {
        alert("Referral registered!");
        setReferralCode("");
      },
    });
  };

  if (referralQuery.isLoading) {
    return (
      <div className="animate-pulse mt-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <>
      {referralQuery.data && (
        <div className="mt-4">
          <h2 className="font-semibold">👥 Referral</h2>
          <p>Your Code: {referralQuery.data.referralCode}</p>
          <p>Invited: {referralQuery.data.referredUsers.length}</p>
        </div>
      )}

      <div className="mt-4">
        <input
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="border p-1"
        />
        <GlareButton
          onClick={handleSubmit}
          background="#2563EB"
          borderRadius="6px"
          borderColor="transparent"
          glareColor="#ffffff"
          glareOpacity={0.3}
          className="ml-2 text-white px-3 py-1"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? "Submitting..." : "Submit"}
        </GlareButton>
      </div>
    </>
  );
}