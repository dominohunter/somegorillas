"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAudio } from "@/contexts/audio-context";
import LoadingScreen from "@/components/screens/loading-screen";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Wallet from "@/components/icons/wallet";
import GlowButton from "@/components/ui/glow-button";
import { useConnect, useAccount } from "wagmi";
import { Connector } from "wagmi";
import { useLogin } from "@/hooks/use-login";
import { useReferralCode } from "@/hooks/use-referral-code";
import CheckCircle from "../icons/check-circle";
import Discord from "../icons/discord";
import Metamask from "../icons/metamask";
import Banana from "../icons/banana";
import Dashboard from "@/app/dashboard/page";

// Helper function to get the Metamask icon
const getConnectorIcon = (connectorName: string, size: number = 24) => {
  return <Metamask size={size} />;
};

export default function HomeContent() {
  const {
    isConnected,
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
  const { showAudioConsent } = useAudio();

  // Local wallet connection state
  const { connect, connectors, error: connectError } = useConnect();
  const { connector } = useAccount();
  // const { disconnect } = useDisconnect();
  const { login } = useLogin();

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<"wallet" | "sign" | "discord">(
    "wallet",
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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

  const isFullyAuthenticated = !!token && !!isDiscordVerified;

  // Show modal only if not fully authenticated AND audio consent is not showing
  useEffect(() => {
    if (!isFullyAuthenticated && !showAudioConsent) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isFullyAuthenticated, showAudioConsent]);

  // Show dashboard if fully authenticated
  if (isFullyAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Inactive Tiles Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-3 opacity-20">
          {Array.from({ length: 25 }, (_, i) => (
            <div
              key={i}
              className="w-16 h-16 bg-translucent-dark-24 border-2 border-translucent-light-4 rounded-xl flex items-center justify-center"
              style={{
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <span className="text-white font-bold text-sm drop-shadow-sm">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Modal */}
      <Dialog open={showModal} onOpenChange={() => {}}>
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
            <DialogDescription className="text-light-primary/80 text-center">
              {showAllSet
                ? "You're ready to start playing!"
                : currentStep === "wallet"
                  ? "Connect your wallet to get started"
                  : currentStep === "sign"
                    ? "Sign the message to verify your identity"
                    : "Link your Discord account to continue"}
            </DialogDescription>
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
                    currentStep === "discord" ? "bg-purple-500" : "bg-gray-400"
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
                    {connectors.filter((connector) => connector.name.toLowerCase().includes("metamask")).map((connector) => (
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
                          {getConnectorIcon(connector.name, 24)}
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
                        {connector ? getConnectorIcon(connector.name, 24) : <Wallet size={24} />}
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

      {/* Loading Overlay */}
      {isLoggingIn && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80">
          <LoadingScreen />
        </div>
      )}

      {/* Success Toast */}
      {isSubmitted && referralCode && (
        <div className="fixed top-4 right-4 z-[9999] bg-green-500/90 backdrop-blur-lg text-white p-4 rounded-lg border border-green-400/30">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Referral applied successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
