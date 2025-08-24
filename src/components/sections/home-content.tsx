"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import LoadingScreen from "@/components/screens/loading-screen";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import RotatingText from "@/components/rotating-text";

import Wallet from "@/components/icons/wallet";
import GlowButton from "@/components/ui/glow-button";
import { useConnect } from "wagmi";
import { Connector } from "wagmi";
import Image from "next/image";
import GorilakLanguage from "@/components/sections/gorillak-language";
import { useLogin } from "@/hooks/use-login";
import { useReferralCode } from "@/hooks/use-referral-code";
import HomeFaq from "./home-faq";
import CheckCircle from "../icons/check-circle";
import Discord from "../icons/discord";
import Metamask from "../icons/metamask";
import Banana from "../icons/banana";

export default function HomeContent() {
  const {
    isConnected,
    isAuthenticated,
    address,
    refreshToken,
    token,
    discordStatus,
    isDiscordVerified,
    checkDiscordStatus,
    getDiscordAuthUrl,
    logout,
  } = useAuth();
  const router = useRouter();

  // Local wallet connection state
  const { connect, connectors, error: connectError } = useConnect();
  // const { disconnect } = useDisconnect();
  const { login } = useLogin();

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<"wallet" | "sign" | "discord">(
    "wallet",
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [pendingReferralSubmission, setPendingReferralSubmission] =
    useState(false);
  const [showAllSet, setShowAllSet] = useState(false);
  const [manualReferralCode, setManualReferralCode] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const { referralCode, submitReferral, isSubmitted } = useReferralCode();

  const handleWalletConnect = async (connector: Connector) => {
    try {
      // Just connect the wallet
      connect({ connector });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleSignMessage = async () => {
    try {
      setIsLoggingIn(true);

      if (!address || !isConnected) {
        throw new Error("Wallet not connected properly");
      }

      // Use the login function directly with the current address
      await login(address);

      // Play gorilla sound on successful sign
      playGorillaSound();

      // Refresh auth context token
      refreshToken();

      // Check if Discord verification is needed
      if (token && !isDiscordVerified) {
        setCurrentStep("discord");
      } else if (token && isDiscordVerified) {
        // Already fully authenticated, close modal and go to dashboard
        setShowModal(false);
        router.push("/dashboard");
        playGorillaSound();
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleReset = () => {
    // Logout completely (this clears token, disconnects wallet, etc.)
    logout();

    // Close modal first
    setShowModal(false);

    // Reset all local state
    setCurrentStep("wallet");
    setIsLoggingIn(false);
    setShowAllSet(false);
    setManualReferralCode("");
    setPendingReferralSubmission(false);
    setIsResetting(false);

    // Reopen modal on wallet step after a small delay
    setTimeout(() => {
      setShowModal(true);
    }, 150);
  };

  const playGorillaSound = () => {
    const audio = new Audio("/gorilla-sfx.wav");
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch(() => {
      // Handle cases where autoplay is blocked
      console.log("Audio playback failed");
    });
  };

  const handleMainButtonClick = () => {
    if (isAuthenticated) {
      // Already authenticated, could go to dashboard or stay on home
      router.push("/dashboard");
    } else {
      setShowModal(true);
    }
  };

  const handleDiscordVerification = async () => {
    try {
      const authUrl = await getDiscordAuthUrl();
      // Open Discord auth in popup
      const popup = window.open(
        authUrl,
        "discord-auth",
        "width=500,height=700,scrollbars=yes,resizable=yes",
      );

      // Listen for popup close or message
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check Discord status after popup closes
          setTimeout(() => {
            checkDiscordStatus().then(() => {
              if (
                pendingReferralSubmission &&
                (referralCode || manualReferralCode)
              ) {
                const codeToSubmit = referralCode || manualReferralCode;
                submitReferral(codeToSubmit);
                setPendingReferralSubmission(false);
                setManualReferralCode("");
              }
            });
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to start Discord verification:", error);
    }
  };
  // Move to sign step when wallet is connected
  useEffect(() => {
    if (isConnected && currentStep === "wallet" && showModal) {
      setCurrentStep("sign");
    }
  }, [isConnected, currentStep, showModal]);

  // Show Discord step when user has token but not verified (unless resetting)
  useEffect(() => {
    if (
      token &&
      !isDiscordVerified &&
      discordStatus !== null &&
      showModal &&
      !isResetting
    ) {
      setCurrentStep("discord");
    }
  }, [token, isDiscordVerified, discordStatus, showModal, isResetting]);

  // Show "All Set!" when fully authenticated during modal flow, then close modal and redirect
  useEffect(() => {
    if (token && isDiscordVerified && !showAllSet && showModal) {
      setShowAllSet(true);

      // Auto-close after 2 seconds and navigate to dashboard
      setTimeout(() => {
        setShowModal(false);
        setShowAllSet(false);
        router.push("/dashboard");
      }, 2000);
    }
  }, [token, isDiscordVerified, showAllSet, showModal, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col max-w-[1920px] items-center w-full relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 items-center text-center py-[240px]">
          <div className="text-light-primary text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold font-['Clash_Display'] leading-tight sm:leading-[60px] md:leading-[80px] lg:leading-[90px] xl:leading-[100px]">
            <RotatingText
              texts={[
                "KONG MODE!",
                "WILD WINS!",
                "LFG!",
                "MOON SOON!",
                "BANANA TIME!",
                "OOOHHHH AHHH!",
              ]}
              mainClassName="px-2 sm:px-2 md:px-3 text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
          </div>
          <div className="text-light-primary/80 text-lg sm:text-xl md:text-2xl font-medium max-w-4xl leading-relaxed">
            - Some Gorilla
          </div>

          {/* Feature highlights */}
          {/* Image and Button Section */}
          <div
            className="flex flex-col justify-center items-center"
            onClick={handleMainButtonClick}
          >
            <Image
              src="/Monke.png"
              alt="Gorilla"
              width={240}
              height={240}
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-60 lg:h-60 -mb-[32px] sm:-mb-[40px] md:-mb-[48px] lg:-mb-[52px] xl:-mb-[56px] z-100 cursor-pointer"
              priority
            />
            <GlowButton
              background="#F5D020"
              borderRadius="16px"
              borderColor="rgba(var(--translucent-dark-16), 0.16)"
              className="px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 relative z-20"
              duration={500}
            >
              <p className="text-dark-primary text-xl sm:text-2xl md:text-3xl font-semibold font-['Clash_Display']">
                Start Flipping Now!
              </p>
            </GlowButton>
          </div>
        </div>

        {/* Interactive Bento Features Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16">
          <div className="w-full py-[120px]">
            <div className="grid grid-cols-4 gap-6">
              {/*Banana part*/}
              <div className="grid col-span-2 gap-6">
                <div className=" row-span-2.5 rounded-[24px] border-2 border-translucent-light-8 p-8 backdrop-blur-[80px] gap-6">
                  <div className="bg-translucent-light-4 rounded-2xl overflow-hidden">
                    <img src={"/banana-pattern.png"} alt="helo" />
                  </div>
                  <div>
                    <h1 className="text-white text-h1 font-[600]">
                      $BANANA: Gorilla Fuel Supreme
                    </h1>
                    <p className="text-translucent-light-64 text-body-1 font-body-1-medium font-pally">
                      Banana powers gorilla life. Stack it, spend it, farm it,
                      watch it grow. 
                    </p>
                  </div>
                </div>
                <div className=" border-2 border-translucent-light-8 p-8 backdrop-blur-[80px] rounded-[24px]">
                  <h1 className="text-white text-h1 font-[600]">
                    True gorilla NFTs
                  </h1>
                  <p className="text-translucent-light-64 text-body-1 font-body-1-medium font-pally">
                    Utilities drive the core of Some Gorilla NFT. Exclusive
                    rewards, $BANANA yield boost, in-game characters, great art.
                    What else you need from a NFT, really.
                  </p>
                </div>
              </div>
              <div className="grid col-span-2 gap-6">
                <div className="grid row-span-1 col-span-2 h-[320px] overflow-hidden rounded-[24px] p-8 backdrop-blur-[80px]">
                  <div className="bg-translucent-light-4 rounded-2xl overflow-hidden h-[180px]">
                    <img src={"/gorilla-pattern.png"} alt="helo" className="" />
                  </div>
                  <h1 className="text-white text-h1 font-[600]">
                    Gorillas for Gorillas
                  </h1>
                  <p className="text-translucent-light-64 text-body-1 font-body-1-medium font-pally">
                    By the tribe, for the tribe. No gorilla forgotten. 
                  </p>
                </div>
                <div className="grid grid-cols-2 grid-rows-2 gap-6 col-span-2">
                  <div className="col-span-1 row-span-2 border-2 border-translucent-light-8 overflow-hidden rounded-[24px] p-8 backdrop-blur-[80px]">
                    <div className="bg-translucent-light-4 rounded-2xl overflow-hidden h-[180px] mb-4">
                      <img src={"/coin-pattern.png"} alt="helo" className="" />
                    </div>
                    <h1 className="text-white text-h1 font-[600]">
                      Built to last
                    </h1>
                    <p className="text-translucent-light-64 text-body-1 font-body-1-medium font-pally">
                      Hype's fun, but we're in for the marathon. Transparent
                      fees, fair mechanics, and endless games to keep the
                      ecosystem aping strong.
                    </p>
                  </div>
                  <div className="col-span-1 row-span-1 border-2 border-translucent-light-8 overflow-hidden rounded-[24px] p-8 backdrop-blur-[80px]">
                    <h1 className="text-white text-h1 font-[600]">Supa fast</h1>
                    <p className="text-translucent-light-64 text-body-1 font-body-1-medium font-pally">
                      That Somnia TPS! Whoo! Whee!
                    </p>
                  </div>

                  <div className="col-span-1 row-span-1 border-2 border-translucent-light-8 overflow-hidden rounded-[24px] p-8 backdrop-blur-[80px]">
                    <h1 className="text-white text-h1 font-[600]">Champs</h1>
                    <p className="text-translucent-light-64 text-body-1 font-body-1-medium font-pally">
                      Won the 1st place in the Somnia Mini Game hackathon.
                      Gorilla smart. Gorilla codes. 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Ecosystem Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 mb-8">
          {/* NFT Utility */}
          <div className="bg-translucent-dark-8 border border-translucent-light-8 backdrop-blur-3xl rounded-3xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-light-primary text-2xl font-bold mb-3">
                NFT Utility & Future Rewards
              </h3>
              <p className="text-light-primary/70">
                Your SomeGorillas NFTs aren&apos;t just
                collectibles—they&apos;re keys to exclusive benefits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎮</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Gaming Perks
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Special abilities, bonus multipliers, and exclusive game modes
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🤝</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Partner Rewards
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Access to airdrops, exclusive events, and partner ecosystem
                  benefits
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">👑</div>
                <h4 className="text-light-primary font-bold mb-2">
                  VIP Status
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Priority access, early features, and community governance
                  rights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Games Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-light-primary text-3xl sm:text-4xl md:text-5xl font-bold font-['Clash_Display'] mb-4">
              Epic Minigames Coming Soon
            </h2>
            <p className="text-light-primary/70 text-lg sm:text-xl max-w-3xl mx-auto">
              We&apos;re building the ultimate arcade experience! Each game will
              feature unique mechanics, rewards, and ways to earn $BANANA tokens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {/* Coin Flip - Current */}
            <div className="bg-gradient-to-br from-green-500/20 to-yellow-500/20 border border-green-400/30 rounded-3xl p-6 text-center relative backdrop-blur-3xl">
              <div className="absolute top-3 right-3 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                LIVE NOW
              </div>
              <div className="text-5xl mb-4 flex justify-center">
                <img
                  src="/coin/7.svg"
                  alt="coin"
                  className="w-[100px] h-[100px]"
                />
              </div>
              <h3 className="text-light-primary text-xl font-bold mb-3">
                Coin Flip
              </h3>
              <p className="text-light-primary/70 text-sm leading-relaxed mb-4">
                Call heads or tails! <br />
                The classic that started it all.
              </p>
            </div>

            {/* Dice Roll - Coming Soon */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-3xl p-6 text-center relative backdrop-blur-3xl">
              <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SOON
              </div>
              <div className="text-5xl mb-4"></div>
              <h3 className="text-light-primary text-xl font-bold mb-3">
                Coming Soon
              </h3>
              <p className="text-light-primary/70 text-sm leading-relaxed mb-4">
                More exciting games coming to the jungle!
              </p>
            </div>

            {/* Card Game - Coming Soon */}
            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-3xl p-6 text-center relative backdrop-blur-3xl">
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SOON
              </div>
              <div className="text-5xl mb-4"></div>
              <h3 className="text-light-primary text-xl font-bold mb-3">
                Coming Soon
              </h3>
              <p className="text-light-primary/70 text-sm leading-relaxed mb-4">
                More exciting games coming to the jungle!
              </p>
            </div>

            {/* Roulette - Coming Soon */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-3xl p-6 text-center relative backdrop-blur-3xl">
              <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SOON
              </div>
              <div className="text-5xl mb-4"></div>
              <h3 className="text-light-primary text-xl font-bold mb-3">
                Coming Soon
              </h3>
              <p className="text-light-primary/70 text-sm leading-relaxed mb-4">
                More exciting games coming to the jungle!
              </p>
            </div>

            {/* Slots - Coming Soon */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 rounded-3xl p-6 text-center relative backdrop-blur-3xl">
              <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                SOON
              </div>
              <div className="text-5xl mb-4"></div>
              <h3 className="text-light-primary text-xl font-bold mb-3">
                Coming Soon
              </h3>
              <p className="text-light-primary/70 text-sm leading-relaxed mb-4">
                More exciting games coming to the jungle!
              </p>
            </div>

            {/* Mystery Game */}
            <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 border border-gray-400/30 rounded-3xl p-6 text-center relative backdrop-blur-3xl">
              <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SECRET
              </div>
              <div className="text-5xl mb-4"></div>
              <h3 className="text-light-primary text-xl font-bold mb-3">
                Coming Soon
              </h3>
              <p className="text-light-primary/70 text-sm leading-relaxed mb-4">
                More exciting games coming to the jungle!
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-6 py-3 rounded-full">
              <span className="text-lg">🚀</span>
              <span className="text-light-primary text-sm font-medium">
                Join our Discord to vote on which game launches next!
              </span>
            </div>
          </div>
        </div>

        {/* Gaming Philosophy Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 mb-8">
          <div className="bg-gradient-to-br from-translucent-dark-8 to-translucent-dark-12 border border-translucent-light-8 rounded-3xl p-8 lg:p-12 backdrop-blur-3xl">
            <div className="text-center mb-8">
              <h2 className="text-light-primary text-3xl sm:text-4xl md:text-5xl font-bold font-['Clash_Display'] mb-4">
                Our Gaming Philosophy
              </h2>
              <p className="text-light-primary/70 text-lg sm:text-xl max-w-3xl mx-auto">
                We believe gaming should be fun, fair, and rewarding for
                everyone. That&apos;s why we built SomeGorillas differently.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-light-primary text-2xl font-bold mb-6">
                  🎮 Player-First Design
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-green-400 mt-1">✓</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Always Earn Something
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        Win or lose, you get $BANANA tokens. No completely empty
                        hands.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-green-400 mt-1">✓</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Fair & Transparent
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        All games are provably fair with on-chain verification.
                        No hidden algorithms.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-green-400 mt-1">✓</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Low Entry Barriers
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        Start with tiny amounts. Gaming should be accessible to
                        all apes.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-green-400 mt-1">✓</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Community Driven
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        Players vote on new features, games, and platform
                        direction.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-light-primary text-2xl font-bold mb-6">
                  🍌 Sustainable Economy
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 mt-1">🏦</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Real Utility Tokens
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        $BANANA isn&apos;t just a reward - it powers the entire
                        ecosystem and unlocks exclusive features.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 mt-1">🔄</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Circular Token Flow
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        Tokens flow between games, NFT purchases, staking, and
                        special events.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 mt-1">📈</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Deflationary Mechanics
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        Strategic token burns and limited NFT releases help
                        maintain token value.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 mt-1">🎁</div>
                    <div>
                      <div className="text-light-primary font-medium mb-1">
                        Multiple Earning Paths
                      </div>
                      <div className="text-light-primary/70 text-sm">
                        Gaming, staking, referrals, achievements, and seasonal
                        events all reward players.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-light-primary text-3xl sm:text-4xl md:text-5xl font-bold font-['Clash_Display'] mb-4">
              The Gorilla Roadmap
            </h2>
            <p className="text-light-primary/70 text-lg sm:text-xl max-w-3xl mx-auto">
              From jungle beginnings to gaming empire. Here&apos;s what
              we&apos;re building together, step by step.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 md:-ml-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-yellow-400 to-purple-400"></div>

            <div className="space-y-8 md:space-y-12">
              {/* Phase 1 - Completed */}
              <div className="flex items-center gap-6 md:gap-8">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div className="bg-translucent-dark-8 border border-green-400/30 rounded-2xl p-6 flex-1 md:max-w-md backdrop-blur-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-light-primary text-lg font-bold">
                      Phase 1: Foundation
                    </h3>
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      COMPLETE
                    </span>
                  </div>
                  <ul className="text-light-primary/70 text-sm space-y-1">
                    <li>✅ Coin flip game launched</li>
                    <li>✅ $BANANA token system</li>
                    <li>✅ NFT Magic Boxes</li>
                    <li>✅ Discord integration</li>
                    <li>✅ Web3 wallet support</li>
                  </ul>
                </div>
              </div>

              {/* Phase 2 - In Progress */}
              <div className="flex items-center gap-6 md:gap-8 md:flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center relative z-10 animate-pulse">
                  <span className="text-black text-sm font-bold">2</span>
                </div>
                <div className="bg-translucent-dark-8 border border-yellow-400/30 rounded-2xl p-6 flex-1 md:max-w-md backdrop-blur-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-light-primary text-lg font-bold">
                      Phase 2: Expansion
                    </h3>
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      IN PROGRESS
                    </span>
                  </div>
                  <ul className="text-light-primary/70 text-sm space-y-1">
                    <li>🚧 Dice Master game</li>
                    <li>🚧 Enhanced NFT utility</li>
                    <li>🚧 Leaderboards & achievements</li>
                    <li>🚧 Mobile app optimization</li>
                    <li>🚧 Staking rewards</li>
                  </ul>
                </div>
              </div>

              {/* Phase 3 - Upcoming */}
              <div className="flex items-center gap-6 md:gap-8">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div className="bg-translucent-dark-8 border border-purple-400/30 rounded-2xl p-6 flex-1 md:max-w-md backdrop-blur-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-light-primary text-lg font-bold">
                      Phase 3: Arcade
                    </h3>
                    <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Q3 2024
                    </span>
                  </div>
                  <ul className="text-light-primary/70 text-sm space-y-1">
                    <li>🔮 Card Clash skill-based game</li>
                    <li>🔮 Gorilla Roulette</li>
                    <li>🔮 Tournament system</li>
                    <li>🔮 Governance voting</li>
                    <li>🔮 Partner integrations</li>
                  </ul>
                </div>
              </div>

              {/* Phase 4 - Future */}
              <div className="flex items-center gap-6 md:gap-8 md:flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div className="bg-translucent-dark-8 border border-pink-400/30 rounded-2xl p-6 flex-1 md:max-w-md backdrop-blur-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-light-primary text-lg font-bold">
                      Phase 4: Empire
                    </h3>
                    <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Q4 2024
                    </span>
                  </div>
                  <ul className="text-light-primary/70 text-sm space-y-1">
                    <li>🌟 Banana Slots with jackpots</li>
                    <li>🌟 Cross-platform play</li>
                    <li>🌟 VR/AR experiences</li>
                    <li>🌟 Mystery game reveal</li>
                    <li>🌟 Global tournaments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-purple-500/20 border border-green-400/30 px-6 py-3 rounded-full">
              <span className="text-lg">🗺️</span>
              <span className="text-light-primary text-sm font-medium">
                This roadmap evolves based on community feedback and votes
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Social Proof Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-light-primary text-3xl sm:text-4xl md:text-5xl font-bold font-['Clash_Display'] mb-4">
              Join the Gorilla Army
            </h2>
            <p className="text-light-primary/70 text-lg sm:text-xl max-w-3xl mx-auto">
              Thousands of apes are already earning $BANANA tokens and building
              their NFT collections. Don&apos;t get left behind in the jungle!
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">
                10K+
              </div>
              <div className="text-light-primary/70 text-sm">
                $BANANA Earned
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                5K+
              </div>
              <div className="text-light-primary/70 text-sm">STT Staked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">
                40%
              </div>
              <div className="text-light-primary/70 text-sm">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">
                100%
              </div>
              <div className="text-light-primary/70 text-sm">Play-to-Earn</div>
            </div>
          </div>

          {/* Community Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-translucent-dark-8 border border-translucent-light-8 rounded-2xl p-6 backdrop-blur-3xl">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🦍</div>
                <div>
                  <p className="text-light-primary/80 text-sm mb-3 italic">
                    &quot;Even when I lose, I still earn $BANANA tokens! This
                    play-to-earn model is genius. Already unlocked 3 Magic Boxes
                    and got a legendary gorilla NFT!&quot;
                  </p>
                  <div className="text-yellow-400 text-xs font-medium">
                    @GorillaGamer_Pro
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-translucent-dark-8 border border-translucent-light-8 rounded-2xl p-6 backdrop-blur-3xl">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🍌</div>
                <div>
                  <p className="text-light-primary/80 text-sm mb-3 italic">
                    &quot;The NFT collection is absolutely insane! Got a rare
                    King Ape from my first Magic Box. Somnia blockchain makes
                    everything lightning fast.&quot;
                  </p>
                  <div className="text-yellow-400 text-xs font-medium">
                    @NFTCollectorApe
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-translucent-dark-8 border border-translucent-light-8 rounded-2xl p-6 backdrop-blur-3xl">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🚀</div>
                <div>
                  <p className="text-light-primary/80 text-sm mb-3 italic">
                    &quot;Been playing since day 1 and can&apos;t wait for the
                    new games! The Discord community is amazing and the devs
                    actually listen to feedback.&quot;
                  </p>
                  <div className="text-yellow-400 text-xs font-medium">
                    @EarlyApe_Investor
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-translucent-dark-8 border border-translucent-light-8 rounded-2xl p-6 backdrop-blur-3xl">
              <div className="flex items-start gap-4">
                <div className="text-2xl">💎</div>
                <div>
                  <p className="text-light-primary/80 text-sm mb-3 italic">
                    &quot;Finally, a play-to-earn game that&apos;s actually fun!
                    Made back my initial investment in a week just by playing
                    casually. Diamond hands! 💎🙌&quot;
                  </p>
                  <div className="text-yellow-400 text-xs font-medium">
                    @DiamondHandsApe
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Features */}
          <div className="bg-gradient-to-br from-translucent-dark-8 to-translucent-dark-12 border border-translucent-light-8 rounded-3xl p-8 mb-8 backdrop-blur-3xl">
            <div className="text-center mb-6">
              <h3 className="text-light-primary text-2xl font-bold mb-3">
                Why Apes Choose SomeGorillas
              </h3>
              <p className="text-light-primary/70">
                The community-driven features that make us different
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🏆</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Fair Competition
                </h4>
                <p className="text-light-primary/70 text-sm">
                  No pay-to-win mechanics. Skill and luck determine rewards, not
                  wallet size.
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Global Community
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Players from 50+ countries. 24/7 active Discord with events
                  and competitions.
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Lightning Fast
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Built on Somnia for instant transactions. No waiting, just
                  pure gaming fun.
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Provably Fair
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Every game outcome is verifiable on-chain. Complete
                  transparency, zero manipulation.
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Real Rewards
                </h4>
                <p className="text-light-primary/70 text-sm">
                  $BANANA tokens have real utility and value. Trade, stake, or
                  use in future games.
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🎨</div>
                <h4 className="text-light-primary font-bold mb-2">
                  Unique NFTs
                </h4>
                <p className="text-light-primary/70 text-sm">
                  Hand-crafted gorilla art with actual utility. Not just JPEGs,
                  but gaming assets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gorillaz Language Component */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-light-primary text-3xl sm:text-4xl md:text-5xl font-bold font-['Clash_Display'] mb-4">
              Speak Like a Gorilla
            </h2>
            <p className="text-light-primary/70 text-lg sm:text-xl max-w-3xl mx-auto">
              Master the ancient language of the jungle apes. Translate your
              messages into authentic gorilla speak!
            </p>
          </div>

          <div className=" p-8 lg:p-12 flex justify-center">
            <GorilakLanguage />
          </div>
        </div>

        {/* FAQ Section */}
        <HomeFaq />

        {/* Unified Modal with Step Transitions */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-h5 text-light-primary text-center">
                {showAllSet
                  ? "All Set!"
                  : currentStep === "wallet"
                    ? "Connect your Wallet"
                    : currentStep === "sign"
                      ? "Sign Message"
                      : "Discord Verification"}
              </DialogTitle>
              {/* Progress indicator */}
              {!showAllSet && (
                <div className="flex justify-center gap-2 mt-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep === "wallet"
                        ? "bg-yellow-500"
                        : currentStep === "sign" || currentStep === "discord"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep === "sign"
                        ? "bg-green-500"
                        : currentStep === "discord"
                          ? "bg-green-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep === "discord"
                        ? "bg-purple-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
              )}
            </DialogHeader>

            {/* Content container */}
            {showAllSet ? (
              /* All Set Success Screen */
              <div className="text-center py-8 flex flex-col justify-center items-center">
                <div className="text-6xl text-system-success-primary mb-4">
                  <CheckCircle size={64} />
                </div>
                <h3 className="text-xl text-light-primary font-semibold mb-2">
                  Welcome Gorilla!
                </h3>
                <p className="text-gray-400 text-sm">
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              /* Sliding Steps Container */
              <div className="relative overflow-hidden">
                <div
                  className={`flex transition-transform duration-300 ease-out ${
                    currentStep === "wallet"
                      ? "translate-x-0"
                      : currentStep === "sign"
                        ? "-translate-x-1/3"
                        : "-translate-x-2/3"
                  }`}
                  style={{ width: "300%" }}
                >
                  {/* Step 1: Wallet Connection */}
                  <div className="w-1/3 space-y-4 flex-shrink-0 px-2">
                    {referralCode && (
                      <div className="bg-translucent-light-8 rounded-lg p-3 text-center">
                        <p className="text-light-primary text-sm">
                          Referral code:{" "}
                          <span className="font-semibold">{referralCode}</span>
                        </p>
                      </div>
                    )}

                    <div className="px-8 py-20 rounded-2xl border-translucent-light-8 bg-translucent-light-8 flex items-center justify-center">
                      <div className="text-4xl">
                        <Wallet size={48} />
                      </div>
                    </div>

                    <div className="stroke-2 bg-translucent-light-8 self-stretch h-0.5" />

                    <div className="space-y-2 px-4 -mx-4">
                      {connectors.map((connector) => (
                        <GlowButton
                          key={connector.id}
                          onClick={() => handleWalletConnect(connector)}
                          background="#FAFAFA"
                          borderRadius="12px"
                          borderColor="transparent"
                          width="100%"
                          className="px-6 py-3 font-semibold text-dark-primary"
                          enableGlow={currentStep === "wallet"}
                        >
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap text-center">
                            <Metamask size={24} />
                            <p className="text-center flex">{connector.name}</p>
                          </div>
                        </GlowButton>
                      ))}

                      {connectError && (
                        <p className="text-red-500 text-center mt-4">
                          {connectError.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Sign Message */}
                  <div className="w-1/3 space-y-4 flex-shrink-0 px-2">
                    <div className="px-8 py-20 rounded-2xl border-translucent-light-8 bg-translucent-light-8 flex items-center justify-center">
                      <Banana size={48} />
                    </div>

                    <div className="stroke-2 bg-translucent-light-8 self-stretch h-0.5" />

                    <div className="space-y-2 px-4 -mx-4">
                      <GlowButton
                        onClick={handleSignMessage}
                        background="#FAFAFA"
                        borderRadius="12px"
                        borderColor="transparent"
                        width="100%"
                        className="px-6 py-3 font-semibold text-dark-primary"
                        disabled={isLoggingIn}
                        enableGlow={currentStep === "sign"}
                      >
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap text-center">
                          <Metamask size={24} />
                          <p className="text-center flex">
                            {isLoggingIn ? "Signing..." : "Sign Message"}
                          </p>
                        </div>
                      </GlowButton>

                      {/* Back button */}
                      <button
                        onClick={() => setCurrentStep("wallet")}
                        className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                      >
                        ← Back to Connect
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Discord Verification */}
                  <div className="w-1/3 space-y-4 flex-shrink-0 px-2">
                    <div className="text-center">
                      <div className="flex justify-center text-center mb-4">
                        <Discord size={64} />
                      </div>
                      <p className="text-light-primary text-sm mb-4">
                        Discord verification is required to access the platform
                        and prevent spam accounts.
                      </p>
                    </div>

                    {/* Optional Referral Code Input */}
                    {!referralCode && (
                      <div className="space-y-2">
                        <label className="text-light-primary text-xs font-medium text-start block">
                          Referral Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={manualReferralCode}
                          onChange={(e) =>
                            setManualReferralCode(e.target.value.trim())
                          }
                          placeholder="Enter referral code..."
                          className="w-full px-3 py-2 bg-translucent-dark-8 border border-translucent-light-8 rounded-lg text-light-primary placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}

                    <div className="space-y-3 px-4 -mx-4">
                      <GlowButton
                        onClick={handleDiscordVerification}
                        background="#5865F2"
                        borderRadius="12px"
                        borderColor="transparent"
                        width="100%"
                        className="px-6 py-3 font-semibold text-white"
                        enableGlow={currentStep === "discord"}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Verify with Discord
                        </div>
                      </GlowButton>

                      {/* Back button */}
                      <button
                        onClick={() => setCurrentStep("sign")}
                        className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                      >
                        ← Back to Sign
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-xs">
                        Discord verification helps us prevent bot accounts and
                        ensures a fair gaming experience for everyone.
                      </p>
                      {token && !isDiscordVerified && (
                        <p className="text-yellow-400 text-xs mt-2 font-semibold">
                          This verification is required to proceed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button - Only show on sign and discord steps */}
            {!showAllSet &&
              (currentStep === "sign" || currentStep === "discord") && (
                <div className="flex justify-center pt-4 border-t border-translucent-light-8">
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded transition-colors"
                    title="Reset and start over"
                  >
                    Reset
                  </button>
                </div>
              )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={showDiscordModal}
          onOpenChange={(open) => {
            // Don't allow closing if user has token but isn't verified
            if (!open && token && !isDiscordVerified) {
              return; // Prevent closing
            }
            setShowDiscordModal(open);
          }}
        >
          <DialogContent className="sm:max-w-md bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-h5 text-light-primary text-center">
                Discord Verification Required
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  <Discord size={64} />
                </div>
                <p className="text-light-primary text-sm mb-2">
                  Discord verification is required to access the platform and
                  prevent spam accounts.
                </p>
                {referralCode && (
                  <p className="text-purple-400 text-xs">
                    Your referral code{" "}
                    <span className="font-semibold">{referralCode}</span> will
                    be applied after verification.
                  </p>
                )}
              </div>

              <div className="space-y-3 px-4 -mx-4">
                <GlowButton
                  onClick={() => {
                    // Set pending referral submission if there's any referral code
                    if (referralCode || manualReferralCode) {
                      setPendingReferralSubmission(true);
                    }
                    handleDiscordVerification();
                  }}
                  background="#5865F2"
                  borderRadius="12px"
                  borderColor="transparent"
                  width="100%"
                  className="px-6 py-3 font-semibold text-white"
                >
                  <div className="flex items-center justify-center gap-2">
                    Verify with Discord
                  </div>
                </GlowButton>

                {/* Only show skip button if user doesn't have a token (not logged in) */}
                {!token && (
                  <button
                    onClick={() => {
                      setShowDiscordModal(false);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("pending_referral");
                      }
                    }}
                    className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    Skip for now
                  </button>
                )}
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  Discord verification helps us prevent bot accounts and ensures
                  a fair gaming experience for everyone.
                </p>
                {token && !isDiscordVerified && (
                  <p className="text-yellow-400 text-xs mt-2 font-semibold">
                    This verification is required to proceed.
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading Overlay */}
        {isLoggingIn && (
          <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80">
            <LoadingScreen />
          </div>
        )}

        {/* NEW: Success/Error Toast Notifications */}
        {isSubmitted && referralCode && (
          <div className="fixed top-4 right-4 z-[9999] bg-green-500/90 backdrop-blur-lg text-white p-4 rounded-lg border border-green-400/30">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Referral applied successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
