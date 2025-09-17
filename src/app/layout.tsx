"use client";
import "./globals.css";
import { Providers } from "./provider";
import { AuthProvider } from "@/contexts/auth-context";
// import PageTransition from "@/components/page-transition";
import type { ReactNode } from "react";
import Header from "@/components/sections/header";
import { Toaster } from "@/components/ui/sonner";
import OptimizedBackground from "@/components/optimized-background";
import { AudioProvider } from "@/contexts/audio-context";
import AudioConsentModal from "@/components/audio/audio-consent-modal";
import AudioControls from "@/components/audio/audio-controls";

import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const background = findBackGroundImage(pathname);

  // if (isMobile) {
  //   return (
  //     <html lang="en" className="">
  //       <body className="h-full min-h-screen bg-black flex items-center justify-center text-center font-semibold text-white flex-col gap-4">
  //         <Image src="/Vector.svg" height={100} width={100} alt="Gorilla" />
  //         <h1 className="text-3xl px-16">
  //           Real Gorillas use PC Cuzz Gorillas have too big fINGERS
  //         </h1>
  //         <div className="text-center w-full absolute bottom-12">
  //           <h1 className="text-3xl px-20">Deal With It</h1>
  //         </div>
  //       </body>
  //     </html>
  //   );
  // }

  return (
    <html lang="en" className="bg-black">
      <head>
        <link
          rel="preload"
          href="/ClashDisplay-Variable.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Pally-Variable.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-black" suppressHydrationWarning={true}>
        <OptimizedBackground backgroundName={background} />
        <div className="relative z-10 min-h-screen min-h-[-webkit-fill-available] w-full">
          <Providers>
            <AudioProvider>
              <AuthProvider>
                <div className="min-h-screen flex flex-col">
                  <div className="w-full flex-shrink-0">
                    <Header />
                  </div>
                  <div className="w-full max-w-[1920px] mx-auto flex-1">{children}</div>
                </div>
                <AudioConsentModal />
                <AudioControls />
              </AuthProvider>
            </AudioProvider>
          </Providers>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

function findBackGroundImage(path: string) {
  switch (path) {
    case "/":
      return "HomeBackground";
    case "/dashboard":
      return "DashboardBackground";
    case "/profile":
      return "ProfileBackground";
    case "/dashboard/flip":
      return "FlipBackground";
    default:
      return "DashboardBackground";
  }
}
