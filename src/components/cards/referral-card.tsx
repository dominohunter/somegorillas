"use client";
import React, { useState } from "react";
import { GlareButton } from "../ui/glare-button";
import { Copy } from "lucide-react";

interface ReferralCardProps {
  referralCode: string;
  referralLink: string;
  totalReferrals?: number;
  totalEarnings?: string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({
  referralCode,
  referralLink,
  totalReferrals = 0,
  totalEarnings = "0",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col p-4 gap-4 rounded-2xl border-2 border-translucent-light-4 bg-translucent-light-12">
      <div className="flex justify-between items-center">
        <h3 className="text-light-primary text-h6 font-semibold">
          Referral Program
        </h3>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-translucent-light-64 text-body2 font-pally mb-1">
            Total Referrals
          </p>
          <p className="text-light-primary text-h5 font-[600]">
            {totalReferrals}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-translucent-light-64 text-body2 font-pally mb-1">
            Total Earnings
          </p>
          <p className="text-light-primary text-h5 font-[600]">
            {totalEarnings} 🍌
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-translucent-light-64 text-body2 font-pally">
          Your Referral Code
        </p>
        <div className="flex gap-2 items-center">
          <div className="flex-1 p-3 bg-translucent-light-8 border border-translucent-light-4 rounded-lg">
            <p className="text-light-primary font-mono text-sm">
              {referralCode}
            </p>
          </div>
          <GlareButton
            onClick={handleCopy}
            borderRadius="8px"
            background="rgba(255, 255, 255, 0.16)"
            glareOpacity={0.3}
            glareColor="#ffffff"
            width="48px"
            height="48px"
            className="text-white flex items-center justify-center rounded-[8px] bg-translucent-light-16 border-translucent-light-4"
          >
            <Copy size={16} color="#FAFAFA" />
          </GlareButton>
        </div>
        {copied && (
          <p className="text-system-success-primary text-sm">
            Copied to clipboard!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReferralCard;