"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type WhitelistResult = {
  whitelisted: boolean;
  tier?: string;
  message?: string;
};

type SheetRow = string[];

export default function Checker() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState("");
  const [checkResult, setCheckResult] = useState<WhitelistResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [whitelistData, setWhitelistData] = useState<SheetRow[] | null>(null);
  const SHEET_ID = "1sBcDuo_7Pih2n3Ztaj9II72p4SU1jYs96NqQQgATLnE";

  useEffect(() => {
    fetchWhitelistData();
  }, []);

  const fetchWhitelistData = async () => {
    setIsLoading(true);

    try {
      // Using the gid to access the specific sheet
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1882816451`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch whitelist data");
      }

      const csvText = await response.text();
      console.log("Fetched CSV:", csvText);
      // Parse CSV to array format
      const rows = csvText.split("\n").map((row) => row.split(","));
      setWhitelistData(rows);
    } catch (error) {
      console.error("Error fetching whitelist:", error);
      alert("Failed to load whitelist data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkWhitelist = () => {
    if (!walletAddress || !whitelistData) return;

    const matchedRow = whitelistData
      .slice(1)
      .find((row) => row[1]?.toLowerCase() === walletAddress.toLowerCase());

    if (matchedRow) {
      setCheckResult({
        whitelisted: true,
        tier: matchedRow[2] || "Unknown",
      });
    } else {
      setCheckResult({
        whitelisted: false,
        message: "Wallet address not found in whitelist",
      });
    }
  };

  const refreshList = () => {
    fetchWhitelistData();
  };
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <section className="flex flex-col items-center gap-4 w-full pb-[52px] px-4">
        <div className="w-full max-w-[720px] bg-translucent-light-4 border-2 backdrop-blur-2xl border-translucent-light-4 p-3 sm:p-4 grid gap-3 rounded-[20px]">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="bg-translucent-light-4 w-[107px] h-10 sm:h-12 rounded-[8px] border border-translucent-light-4 gap-[10px] hover:bg-transparent cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-light-primary" />{" "}
            <span className="text-button-48 text-light-primary">Back</span>
          </Button>
          <div className="grid gap-4 sm:gap-6 rounded-[20px] border-2 border-translucent-light-4 bg-translucent-light-4 p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h1 className="text-light-primary text-body-2-medium font-medium">
                Check whitelist status
              </h1>
              <Button
                variant="secondary"
                onClick={refreshList}
                disabled={isLoading}
                className="bg-light-primary text-button-32 font-semibold px-3 py-2 rounded-[8px] text-sm sm:text-base"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
            <div className="relative w-full">
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={isLoading}
                className="w-full pr-[80px] sm:pr-[90px] outline-none focus:outline-none active:outline-none text-base sm:!text-xl pl-4 sm:pl-6 py-3 sm:py-4 h-[60px] sm:h-[72px] bg-translucent-light-4 border-2 border-translucent-light-4 focus-visible:border-translucent-light-4 focus-visible:ring-0 placeholder:text-translucent-light-48 text-light-primary font-medium"
                placeholder="Enter wallet address (0x...)"
              />
              <Button
                variant="secondary"
                onClick={checkWhitelist}
                disabled={isLoading || !walletAddress || !whitelistData}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-[8px] bg-light-primary text-button-32 font-semibold text-xs sm:text-sm"
              >
                {isLoading ? "Loading..." : "Check"}
              </Button>
            </div>
            <p className="text-caption-1-medium text-translucent-light-64 font-medium px-2 sm:px-3 text-sm">
              Enter your EVM wallet address to check your eligibility
            </p>

            {isLoading && (
              <div className="rounded-[20px] border-2 border-translucent-light-4 bg-translucent-light-4 p-3 sm:p-5 opacity-0 animate-[fadeInUp_0.3s_ease-out_forwards]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-translucent-light-4 border border-translucent-light-4 animate-spin flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-light-primary border-t-transparent rounded-full"></div>
                  </div>
                  <p className="text-translucent-light-64 text-body-2-medium font-medium text-sm sm:text-base">
                    Loading whitelist data...
                  </p>
                  <div className="ml-auto opacity-30">
                    <Image
                      src="/coin/idle.svg"
                      alt="loading"
                      width={20}
                      height={20}
                      className="sm:w-6 sm:h-6"
                    />
                  </div>
                </div>
              </div>
            )}

            {checkResult && (
              <div className="rounded-[20px] border-2 border-translucent-light-4 bg-translucent-light-4 p-3 sm:p-5 opacity-0 animate-[fadeInUp_0.3s_ease-out_forwards] relative overflow-hidden">
                {/* Banana pattern background */}
                <div className="absolute inset-0 opacity-5">
                  <Image
                    src="/banana-pattern.png"
                    alt="banana pattern"
                    fill
                    className="object-cover"
                  />
                </div>

                {checkResult.whitelisted ? (
                  <div className="grid gap-3 sm:gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-light-primary bg-opacity-10 border border-light-primary border-opacity-20 flex items-center justify-center">
                          <span className="text-light-primary font-bold text-sm sm:text-lg">
                            ✓
                          </span>
                        </div>
                        <div>
                          <h3 className="text-light-primary text-base sm:text-h6 font-semibold">
                            Whitelisted
                          </h3>
                          <p className="text-translucent-light-64 text-caption-1-medium text-xs sm:text-sm">
                            Address found in database
                          </p>
                        </div>
                      </div>
                      <div>
                        <Image
                          src="/icons/Banana.svg"
                          alt="verified"
                          width={24}
                          height={24}
                          className="sm:w-7 sm:h-7"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4">
                      <div className="bg-translucent-light-4 border border-translucent-light-4 rounded-[12px] p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-translucent-light-64 text-body-2-medium font-medium text-sm">
                            Wallet Address
                          </span>
                          <button className="text-translucent-light-64 hover:text-light-primary transition-colors text-caption-1-medium text-xs">
                            Copy
                          </button>
                        </div>
                        <code className="text-light-primary text-body-2-medium font-mono block mt-2 break-all text-xs sm:text-sm">
                          {walletAddress}
                        </code>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-translucent-light-4 border border-translucent-light-4 rounded-[12px] p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-light-primary bg-opacity-20 flex items-center justify-center">
                              <Image
                                src="/coin/1.svg"
                                alt="approved"
                                width={12}
                                height={12}
                                className="sm:w-4 sm:h-4"
                              />
                            </div>
                            <div>
                              <p className="text-translucent-light-64 text-caption-1-medium text-xs">
                                Status
                              </p>
                              <p className="text-light-primary text-body-2-medium font-semibold text-sm">
                                Approved
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-translucent-light-4 border border-translucent-light-4 rounded-[12px] p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 bg-opacity-30 flex items-center justify-center">
                              <Image
                                src="/coin/12.svg"
                                alt="tier"
                                width={12}
                                height={12}
                                className="sm:w-4 sm:h-4"
                              />
                            </div>
                            <div>
                              <p className="text-translucent-light-64 text-caption-1-medium text-xs">
                                Tier
                              </p>
                              <p className="text-light-primary text-body-2-medium font-semibold text-sm">
                                {checkResult.tier}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-translucent-light-64 bg-opacity-20 border border-translucent-light-64 border-opacity-30 flex items-center justify-center">
                          <span className="text-translucent-light-64 font-bold text-sm sm:text-lg">
                            ✗
                          </span>
                        </div>
                        <div>
                          <h3 className="text-light-primary text-base sm:text-h6 font-semibold">
                            Not Found
                          </h3>
                          <p className="text-translucent-light-64 text-caption-1-medium text-xs sm:text-sm">
                            Address not in whitelist
                          </p>
                        </div>
                      </div>
                      <div>
                        <Image
                          src="/coin/idle.svg"
                          alt="not found"
                          width={24}
                          height={24}
                          className="opacity-50 sm:w-7 sm:h-7"
                        />
                      </div>
                    </div>

                    <div className="bg-translucent-light-4 border border-translucent-light-4 rounded-[12px] p-3 sm:p-4">
                      <p className="text-translucent-light-64 text-body-2-medium font-medium mb-2 transition-all duration-300 hover:text-light-primary text-sm">
                        {checkResult.message}
                      </p>
                      <p className="text-translucent-light-48 text-caption-1-medium font-medium transition-all duration-300 hover:text-translucent-light-64 text-xs">
                        Note: Please ensure the wallet address is entered
                        correctly, including the &quot;0x&quot; prefix.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-translucent-light-4 border border-translucent-light-4 rounded p-3">
              <div className="font-medium text-light-primary mb-2 text-sm sm:text-base">
                Whitelist Information
              </div>
              <div className="text-xs sm:text-sm text-translucent-light-64">
                <p>
                  <strong>Last updated:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[720px] bg-translucent-light-4 border-2 backdrop-blur-2xl border-translucent-light-4 p-3 sm:p-4 grid gap-3 rounded-[20px]">
          <h1 className="text-lg sm:text-h5 text-light-primary font-semibold">
            Heads or Butts Criteria
          </h1>
          <div className="grid gap-4 sm:gap-6 rounded-[20px] border-2 border-translucent-light-4 bg-translucent-light-4 px-3 sm:pr-6 sm:pl-4 py-4">
            <div className="w-full flex gap-3 sm:gap-5 items-center">
              <Image
                src="/buttlist.png"
                alt="stake image"
                height={50}
                width={50}
                className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-cover rounded-xl"
              />
              <h1 className="text-base sm:text-body-1-bold text-light-primary font-bold">
                How to get Buttlisted? (Guaranteed)
              </h1>
            </div>
            <div className="w-full grid gap-3">
              <div className="px-2 sm:pr-6 sm:pl-4">
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium leading-relaxed">
                  Upload a video of yourself enjoying a banana on X(Twitter) and
                  tag{" "}
                  <a
                    href="https://x.com/somegorillas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-light-primary hover:underline"
                  >
                    @SomeGorillas
                  </a>
                  . Prove you&apos;re a true degen gorilla.
                </li>
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  Complete 10 Coinflips on Somnia Mainnet.
                </li>
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  Play Mines 3 time on Somnia Mainnet.
                </li>
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  Reach lvl 5 on our Discord.
                </li>
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  Invite 1 gorilla to Discord.
                </li>
              </div>
              <div className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium text-start px-2 sm:px-0">
                Once you complete all the task, fill out this{" "}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfXJnOd3TWjoMUlRJWPFTm1ewpKQu7BA92JIX6jwwRRJqDfow/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-light-primary hover:underline"
                >
                  form
                </a>{" "}
                to secure your spot.
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:gap-6 rounded-[20px] border-2 border-translucent-light-4 bg-translucent-light-4 px-3 sm:pr-6 sm:pl-4 py-4">
            <div className="w-full flex gap-3 sm:gap-5 items-center">
              <Image
                src="/headlist.png"
                alt="stake head image"
                height={50}
                width={50}
                className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-cover rounded-xl"
              />
              <h1 className="text-base sm:text-body-1-bold text-light-primary font-bold">
                How to get Headlisted? (FCFS)
              </h1>
            </div>
            <div className="w-full grid gap-3">
              <div className="px-2 sm:pr-6 sm:pl-4">
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  Complete at least 10 coinflips on Somnia Mainnet.
                </li>
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  Play Mines at least 3 time on Somnia Mainnet.
                </li>
                <li className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium">
                  OR participate in our giveaways.
                </li>
              </div>
              <div className="text-sm sm:text-body-2-medium text-translucent-light-64 font-medium px-2 sm:px-0">
                Only the top users and giveaway winners will be added to the
                Headlist. The Headlist is updated every 72 hours.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
