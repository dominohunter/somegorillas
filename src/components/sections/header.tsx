"use client";

import GlareButton from "@/components/ui/glare-button";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CartoonButton } from "../ui/cartoon-button";
import { createPortal } from "react-dom";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  const router = useRouter();
  const pathname = usePathname();

  const handleIndexClick = () => {
    router.push("/");
  };

  const handleProfileClick = () => {
    router.push("/profile");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      updateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Generate avatar from wallet address
  const getAvatarColor = (address: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
      "#00D2D3",
      "#FF9F43",
    ];
    if (!address) return colors[0];
    const hash = address.slice(2, 8);
    const index = parseInt(hash, 16) % colors.length;
    return colors[index];
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-2)}`;
  };

  return (
    <div className="w-full min-w-full backdrop-blur-[80px] flex justify-center z-[100]">
      <div className="max-w-[2500px] w-full flex justify-between items-center px-3 py-3 sm:px-6 sm:py-5">
        <div className="flex items-center gap-8 ">
          <Link href={"/dashboard"}>
            <Image
              src="/logo/Logo.svg"
              alt="logo"
              className="h-7 w-auto sm:h-10 md:h-12 md:w-[276px]"
              width={200}
              height={100}
              onClick={handleIndexClick}
              draggable={false}
            />
          </Link>
          <div className="flex items-center">
            {/*<Link href={"/games"} className="py-3 px-5">
              <p className="text-button-48 text-light-primary font-semibold">
                Games
              </p>
            </Link>*/}
            {/*<Link href={"/games"} className="py-3 px-5">
            <p className="text-button-48 text-light-primary font-semibold">
              Staking
            </p>
          </Link>
          <Link href={"/games"} className="py-3 px-5">
            <p className="text-button-48 text-light-primary font-semibold">
              Leaderboard
            </p>
          </Link>
          <Link href={"/games"} className="py-3 px-5">
            <p className="text-button-48 text-light-primary font-semibold">
              Guide
            </p>
          </Link>*/}
          </div>
        </div>
        <div className="flex flex-row gap-2 sm:gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              <CartoonButton
                size={"md"}
                variant={
                  pathname.startsWith("/games") ? "secondary" : "primary"
                }
                onClick={() =>
                  router.push(
                    pathname.startsWith("/games") ? "/dashboard" : "/games",
                  )
                }
              >
                <p className="text-dark-primary">
                  {pathname.startsWith("/games") ? "Dashboard" : "Games"}
                </p>
              </CartoonButton>
              {/* Profile Dropdown */}
              <div className="relative z-[200]" ref={buttonRef}>
                <GlareButton
                  onClick={handleDropdownToggle}
                  background={"rgba(255, 255, 255, 0.04)"}
                  borderRadius="12px"
                  glareColor="#ffffff"
                  borderColor="rgba(255, 255, 255, 0.04)"
                  className="backdrop-blur-[40px] w-auto h-[44px] sm:h-[56px] py-2 sm:py-4 px-3 sm:px-4 flex items-center gap-1 sm:gap-2"
                >
                  {/* Avatar */}
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      backgroundColor: getAvatarColor(
                        user?.walletAddress || "",
                      ),
                    }}
                  ></div>

                  <p className="text-light-primary font-pally">
                    {formatAddress(user?.walletAddress || "")}
                  </p>
                  {/* Dropdown Arrow - Hidden on mobile for cleaner look */}
                  <div className="hidden sm:block">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={`transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </GlareButton>
              </div>
            </>
          ) : (
            <>
              <GlareButton
                background="rgba(255, 255, 255, 0.16)"
                borderRadius="12px"
                borderColor="rgba(255, 255, 255, 0.04)"
                onClick={() =>
                  window.open(
                    "https://x.com/somegorillas",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="p-2 sm:p-3 backdrop-blur-[40px] min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Image
                  src="/Twitter.svg"
                  alt="Twitter"
                  width={24}
                  height={24}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              </GlareButton>
              <GlareButton
                background="rgba(255, 255, 255, 0.16)"
                borderRadius="12px"
                borderColor="rgba(255, 255, 255, 0.04)"
                onClick={() =>
                  window.open(
                    "https://discord.gg/3uGRW3kJd3",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="p-2 sm:p-3 backdrop-blur-[40px] min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Image
                  src="/Discord.svg"
                  alt="Discord"
                  width={24}
                  height={24}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              </GlareButton>
            </>
          )}
        </div>
      </div>
      {/* Portal Dropdown */}
      {isDropdownOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-64 bg-black/95 border border-white/10 rounded-xl shadow-lg overflow-hidden z-[99999]"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}
          >
            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="16,17 21,12 16,7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="21"
                    y1="12"
                    x2="9"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
