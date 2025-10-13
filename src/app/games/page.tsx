"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import Activity from "@/components/dashboard/activity";
import { CartoonButton } from "@/components/ui/cartoon-button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Games() {
  const router = useRouter();

  return (
    <section className="w-full flex flex-col xl:flex-row m-0 items-start h-auto overflow-y-hidden gap-4 px-4 lg:px-6">

      {/* LEFT SIDE - GAME CARDS */}
      <div className="grid w-full xl:w-[70%] h-auto gap-4">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coin Flip */}
          <div
            className="relative h-[300px] md:h-[420px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            style={{
              backgroundImage: "url('games/coin-flip.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:px-6 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold text-light-primary mb-2 md:mb-0">
                Coin Flip
              </h1>
              <CartoonButton
                variant="secondary"
                className="text-button-48 font-semibold text-dark-primary w-[118px] h-12"
                onClick={() => router.push("/dashboard/flip")}
              >
                Play now!
              </CartoonButton>
            </div>
          </div>

          {/* Mines */}
          <div
            className="relative h-[300px] md:h-[420px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            style={{
              backgroundImage: "url('/games/mines.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:px-6 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold text-light-primary mb-2 md:mb-0">
                Mines
              </h1>
              <CartoonButton
                variant="secondary"
                className="text-button-48 font-semibold text-dark-primary w-[118px] h-12"
                onClick={() => router.push("/dashboard/mines")}
              >
                Play now!
              </CartoonButton>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Flinko */}
          <div
            className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            style={{
              backgroundImage: "url('/games/flinko.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:px-6 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold text-light-primary">
                Flinko
              </h1>
              <Button
                variant="secondary"
                className="text-button-40 font-semibold bg-translucent-light-4 border-2 border-translucent-light-4 px-4 py-3 backdrop-blur-xl text-light-primary w-[127px] h-10 hover:bg-transparent"
              >
                Coming soon
              </Button>
            </div>
          </div>

          {/* Rock Paper Scissors */}
          <div
            className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            style={{
              backgroundImage: "url('/games/rock.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:px-6 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold text-light-primary">
                Rock
              </h1>
              <Button
                variant="secondary"
                className="text-button-40 font-semibold bg-translucent-light-4 border-2 border-translucent-light-4 px-4 py-3 backdrop-blur-xl text-light-primary w-[127px] h-10 hover:bg-transparent"
              >
                Coming soon
              </Button>
            </div>
          </div>

          {/* Limbo */}
          <div
            className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            style={{
              backgroundImage: "url('/games/limbo.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:px-6 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold text-light-primary">
                Limbo
              </h1>
              <Button
                variant="secondary"
                className="text-button-40 font-semibold bg-translucent-light-4 border-2 border-translucent-light-4 px-4 py-3 backdrop-blur-xl text-light-primary w-[127px] h-10 hover:bg-transparent"
              >
                Coming soon
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - ACTIVITY */}
      <div className="w-full flex flex-col gap-3 lg:w-[90%] xl:w-[420px] 2xl:w-[460px] flex-shrink-0 bg-translucent-light-4 backdrop-blur-2xl rounded-2xl p-4">
        <div className="px-5 py-4 border-2 border-translucent-light-4 grid gap-[10px] rounded-[12px] bg-translucent-light-8 text-h6 md:text-h5 h-16 w-full text-light-primary font-semibold">
          Activity
        </div>

        <div className="p-4 border-2 border-translucent-light-4 flex items-center bg-translucent-light-4 rounded-[12px]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 border-2 bg-translucent-light-4 border-translucent-light-4 h-[52px] w-[52px] flex items-center justify-center rounded-[8px]">
              <Image
                src="/chart.svg"
                alt="activity chart"
                height={28}
                width={28}
                className="object-cover h-7 w-7"
              />
            </div>
            <div className="grid gap-1">
              <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                Live Activity
              </h1>
              <p className="text-body-1-medium font-medium text-light-primary">
                Recent games
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Activity />
        </div>
      </div>
    </section>
  );
}
