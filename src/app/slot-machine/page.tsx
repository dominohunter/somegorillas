"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectGorillaDialog from "@/components/slot-machine/selectGorillaDialog";

interface Gorilla {
  id: number;
  image: string;
}

const gorillas: Gorilla[] = [
  { id: 3520, image: "/gorillas/g1.svg" },
  { id: 5621, image: "/gorillas/g2.svg" },
  { id: 4632, image: "/gorillas/g3.svg" },
  { id: 2740, image: "/gorillas/g4.svg" },
  { id: 4521, image: "/gorillas/g5.svg" },
  { id: 5830, image: "/gorillas/g6.svg" },
  { id: 6711, image: "/gorillas/g7.svg" },
  { id: 2180, image: "/gorillas/g8.svg" },
];

export default function SlotMachine() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGorilla, setSelectedGorilla] = useState<Gorilla | null>(null);
  const [step, setStep] = useState<"initial" | "pending">("initial");
  const [isPayButtonEnabled, setIsPayButtonEnabled] = useState(false);

  const handleConfirm = (gorilla: Gorilla) => {
    setSelectedGorilla(gorilla);
    setStep("initial");
    setDialogOpen(false);
  };

  // Pay button 3 секундийн дараа идэвхжих logic
  useEffect(() => {
    if (selectedGorilla && step === "initial") {
      const timer = setTimeout(() => setIsPayButtonEnabled(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsPayButtonEnabled(false);
    }
  }, [selectedGorilla, step]);

  return (
    <>
      <section className="w-full flex gap-4 px-6 pb-6">
        {/* left content */}
        <div className="w-[35%] grid gap-4">
          <div className="border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 grid gap-3 rounded-[20px]">
            <h1 className="text-h4 font-semibold text-light-primary">
              NFT slot machine
            </h1>
            <p className="text-translucent-light-80 text-body-2-medium font-normal">
              Pay the fee, pull the lever, and let the jungle decide your next
              Gorilla. You might score a legend—or get tricked by the jungle
              gods. Spin and find out.
            </p>
            <div className="grid grid-cols-2 w-full gap-3">
              <div className="w-full bg-translucent-light-4 border-2 border-translucent-light-4 rounded-[12px] px-4 py-3 grid gap-1">
                <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                  Play fee
                </p>
                <h1 className="w-full text-body-2-medium font-medium text-light-primary">
                  0.0001 ETH
                </h1>
              </div>
              <div className="bg-translucent-light-4 border-2 border-translucent-light-4 rounded-[12px] px-4 py-3 grid gap-1">
                <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                  Prize pool
                </p>
                <h1 className="text-body-2-medium font-medium text-light-primary">
                  12.5 ETH
                </h1>
              </div>
            </div>
          </div>
          <div className="border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 grid gap-3 rounded-[20px]">
            <h1 className="text-h5 font-semibold text-light-primary">
              How to play
            </h1>
            <div className="grid gap-2 w-full">
              {[
                {
                  step: 1,
                  title: "Choose your Gorilla",
                  desc: "Choose one Some Gorillas NFT you want to swap.",
                },
                {
                  step: 2,
                  title: "Pay fee",
                  desc: "Pay the fee that is required to play slot machine.",
                },
                {
                  step: 3,
                  title: "Reveal your swapped NFT",
                  desc: "You must reveal your swapped NFT after paying fee.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border-2 border-translucent-light-4 bg-translucent-light-4 p-3 rounded-[12px] flex gap-4"
                >
                  <div className="h-12 w-12 border-2 border-translucent-light-4 rounded-[8px] text-body-1-bold text-bold text-accent-yellow flex justify-center items-center">
                    {item.step}
                  </div>
                  <div className="grid gap-1 w-full">
                    <h1 className="text-body-2-medium font-medium text-light-primary">
                      {item.title}
                    </h1>
                    <p className="font-pally text-[14px] leading-5 font-normal text-translucent-light-64">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 grid gap-3 rounded-[20px]">
            <h1 className="text-h5 font-semibold text-light-primary">
              History
            </h1>
            {/* You haven’t played yet section */}
            {/* <div className="h-[216px] border-2 border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-4 px-4 py-3 rounded-[12px]">
              <div className="h-[56px] w-[56px] p-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px]">
                <Image
                  src="/slot-machine/history.svg"
                  alt="slot machine history image"
                  height={24}
                  width={24}
                  className="w-6 h-6 object-cover"
                />
              </div>
              <p className="text-translucent-light-64 text-body-2-medium font-medium ">
                You haven’t played yet.
              </p>
            </div> */}
            {/* notification card */}
            <div className="flex justify-between items-center w-full bg-translucent-light-4 border-2 border-translucent-light-4 p-3 rounded-[12px]">
              <div className="flex items-center gap-2">
                <p className="text-caption-1-medium text-light-primary font-medium">
                  #2424 (Tier D)
                </p>
                <ArrowRight className="inline-block ml-2 mb-1 h-4 w-4 text-translucent-light-64" />
                <p className="text-caption-1-medium text-light-primary font-medium">
                  #1351 (Tier A)
                </p>
              </div>
              <div className="flex items-center gap-2 text-translucent-light-64 text-caption-1-medium font-medium">
                <p>Oct 12,2025</p>
                <Image
                  src="/slot-machine/explore.svg"
                  alt="explore icon"
                  width={16}
                  height={16}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex items-center w-full bg-translucent-light-4 border-2 border-translucent-light-4 p-3 rounded-[12px]">
              <div className="flex justify-between w-full items-center gap-2">
                <p className="text-body-2-medium text-translucent-light-64 font-medium">
                  Total played
                </p>
                <p className="text-body-2-medium text-light-primary font-medium">
                  12
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* right content */}
        <div className="w-[65%] border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 flex flex-col gap-4 rounded-[20px]">
          <div className="bg-translucent-light-4 max-h-[392px] border-2 border-translucent-light-4 backdrop-blur-2xl px-4 pt-4 pb-6 grid gap-6 rounded-[16px]">
            <div className="flex justify-around items-center w-full gap-4">
              <div className="bg-translucent-light-4 flex items-center justify-center h-[280px] w-full border-2 border-translucent-light-4 backdrop-blur-2xl p-6 rounded-[12px]">
                {selectedGorilla ? (
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={selectedGorilla.image}
                      alt="Selected Gorilla"
                      width={187}
                      height={187}
                      className="rounded-lg"
                    />
                    <p className="text-light-primary text-caption-1-medium font-medium">
                      Some Gorillas #{selectedGorilla.id}
                    </p>
                    <p className="text-accent-yellow text-cpation-2-medium font-medium">
                      Rarity B
                    </p>
                  </div>
                ) : (
                  <Button
                    className="h-12 rounded-[8px] bg-light-primary px-5 py-3 text-dark-primary hover:bg-light-primary text-button-48 font-semibold"
                    onClick={() => setDialogOpen(true)}
                  >
                    Choose your NFT
                  </Button>
                )}
              </div>

              <div className="w-6 h-6">
                <ArrowRight className="h-6 w-6 text-light-primary" />
              </div>

              <div className="bg-translucent-light-4 h-[280px] w-full flex items-center justify-center border-2 border-translucent-light-4 backdrop-blur-2xl p-6 rounded-[12px]">
                {step === "pending" ? (
                  <div className="flex items-center flex-col gap-3 w-full text-center">
                    <div className="border-2 border-translucent-light-4 bg-translucent-light-4 px-4 py-3 flex flex-col items-center justify-center w-full gap-4 rounded-[8px]">
                      <div className="h-[56px] w-[56px] p-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px]">
                        <Image
                          src="/slot-machine/hourglass.svg"
                          alt="slot machine hour image"
                          height={24}
                          width={24}
                          className="w-6 h-6 object-cover"
                        />
                      </div>
                      <p className="text-light-primary text-body-2-medium font-medium">
                        Pending Commitment...
                      </p>
                    </div>
                    <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                      <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                        Committed block
                      </p>
                      <p className="text-caption-1-medium text-light-primary">
                        192152938
                      </p>
                    </div>
                    <div className="grid grid-cols-2 w-full gap-2">
                      <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                        <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                          Token ID
                        </p>
                        <p className="text-caption-1-medium text-light-primary">
                          #{selectedGorilla?.id}
                        </p>
                      </div>
                      <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                        <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                          Rarity
                        </p>
                        <p className="text-caption-1-medium text-light-primary">
                          B
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 h-[96px] w-[96px] border-translucent-light-4 rounded-[12px] bg-translucent-light-4 p-6 flex justify-center items-center">
                    <Image
                      src="/slot-machine/gorilla.svg"
                      alt="stake image"
                      height={48}
                      width={48}
                      className="w-12 h-12 object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              {step === "pending" ? (
                <>
                  <Button
                    className="h-12 rounded-[8px] cursor-pointer bg-transparent border-2 text-light-primary border-translucent-light-4 px-5 py-3  text-button-48 font-semibold hover:bg-translucent-light-4"
                    onClick={() => {
                      setStep("initial");
                      setSelectedGorilla(null);
                    }}
                  >
                    <p className="text-translucent-light-64">Cancel</p>
                  </Button>
                  <Button className="h-12 cursor-pointer rounded-[8px] bg-light-primary px-5 py-3 text-dark-primary text-button-48 font-semibold hover:bg-light-primary">
                    Reveal NFT
                  </Button>
                </>
              ) : (
                <Button
                  disabled={!isPayButtonEnabled}
                  className={`h-12 rounded-[8px] border-2 px-5 py-3 text-button-48 font-semibold transition-all duration-300 ${
                    isPayButtonEnabled
                      ? "bg-light-primary text-dark-primary hover:bg-light-primary border-light-primary cursor-pointer"
                      : "bg-translucent-light-4 text-translucent-light-64 border-translucent-light-4 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (!isPayButtonEnabled) return;
                    setStep("pending");
                  }}
                >
                  Pay fee - 1 SOMI
                </Button>
              )}
            </div>
          </div>
          <div className="border-[2px] h-[448px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden mt-4">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-h5 font-semibold text-light-primary">
                NFT Pool
              </h1>
              <div className="border-2 border-translucent-light-4 px-3 py-2 rounded-[8px] flex gap-2">
                <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                  Pool size
                </p>
                <p className="text-light-primary text-caption-1-medium font-medium">
                  8 NFTs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-h-[364px] overflow-y-auto">
              {gorillas.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGorilla(g)}
                  className={`relative rounded-xl p-3 border-[2px] h-fit w-full transition-all duration-200 cursor-pointer ${
                    selectedGorilla?.id === g.id
                      ? "border-white bg-white"
                      : "border-translucent-light-4 bg-translucent-light-4"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src={g.image}
                      alt={`Gorilla #${g.id}`}
                      width={138}
                      height={138}
                      className="object-cover w-full h-auto aspect-square"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-center mt-2">
                    <span
                      className={`text-caption-1-medium font-medium ${
                        selectedGorilla?.id === g.id
                          ? "text-dark-primary"
                          : "text-light-primary"
                      }`}
                    >
                      #{g.id}
                    </span>
                    <span
                      className={`text-caption-2-medium font-medium ${
                        selectedGorilla?.id === g.id
                          ? "text-dark-primary"
                          : "text-accent-yellow"
                      }`}
                    >
                      Rarity B
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <SelectGorillaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        gorillas={gorillas}
      />
    </>
  );
}
