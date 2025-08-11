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

// import GlareButton from "@/components/ui/glare-button";
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

      // Refresh auth context token
      refreshToken();

      // Check if Discord verification is needed
      if (token && !isDiscordVerified) {
        setCurrentStep("discord");
      } else if (token && isDiscordVerified) {
        // Already fully authenticated, close modal and go to dashboard
        setShowModal(false);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Signing failed:", error);
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

  // // Auto-login if connected but not authenticated
  // useEffect(() => {
  //   if (isConnected && !isAuthenticated && !isLoggingIn && address) {
  //     setIsLoggingIn(true);
  //     performLogin()
  //       .catch(console.error)
  //       .finally(() => setIsLoggingIn(false));
  //   }
  // }, [isConnected, isAuthenticated, isLoggingIn, address]);

  // Show Discord modal when authenticated but not verified
  // useEffect(() => {
  //   if (token && !isDiscordVerified && discordStatus !== null) {
  //     setShowDiscordModal(true);
  //   }
  // }, [token, isDiscordVerified, discordStatus]);

  // Enhanced referral submission with Discord verification check
  // useEffect(() => {
  //   if (isAuthenticated && referralCode && !isSubmitted && !isSubmitting) {
  //     // Check if Discord verification is required
  //     if (!discordStatus?.verified) {
  //       setShowDiscordModal(true);
  //       return;
  //     }

  //     // Submit referral if Discord is verified
  //     submitReferral(referralCode);
  //   }
  // }, [isAuthenticated, referralCode, isSubmitted, isSubmitting, discordStatus]);

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
        <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 items-center text-center py-[80px] lg:pt-[184px]">
          <div className="text-light-primary text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold font-['Clash_Display'] leading-tight sm:leading-[60px] md:leading-[80px] lg:leading-[90px] xl:leading-[100px]">
            &quot;Ooohaahahhaah&quot;
          </div>
          <div className="text-light-primary text-xl sm:text-2xl md:text-3xl font-semibold font-['Clash_Display'] leading-tight sm:leading-8 md:leading-10 tracking-tight">
            - Some Gorilla
          </div>

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
                Let&apos;s Ape It!
              </p>
            </GlowButton>
          </div>
        </div>

        {/* Gorillaz Language Component */}
        <div className="mb-[40px] px-4 sm:px-6 md:px-8">
          <GorilakLanguage />
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
            {!showAllSet && (currentStep === "sign" || currentStep === "discord") && (
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
