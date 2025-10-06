"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Gorilla {
  id: number;
  image: string;
}

const gorillas: Gorilla[] = [
  { id: 3582, image: "/gorillas/g1.svg" },
  { id: 5653, image: "/gorillas/g2.svg" },
  { id: 4639, image: "/gorillas/g3.svg" },
  { id: 2744, image: "/gorillas/g4.svg" },
  { id: 3820, image: "/gorillas/g5.svg" },
  { id: 3921, image: "/gorillas/g6.svg" },
  { id: 3922, image: "/gorillas/g7.svg" },
  { id: 3923, image: "/gorillas/g8.svg" },
];

export default function AdventureDialog() {
  const [selected, setSelected] = useState<Gorilla | null>(null);
  const [stakeDays, setStakeDays] = useState<number | null>(30);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <>
      {/* Main Select Dialog */}
      <Dialog open={!confirmOpen && !successOpen}>
        <DialogContent className="bg-translucent-light-4 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1000px] border-[2px] border-translucent-light-4 rounded-[20px] backdrop-blur-[80px] p-6 gap-5">
          <DialogHeader>
            <DialogTitle className="text-h3 font-semibold text-light-primary">
              Gorilla Adventure
            </DialogTitle>
            <p className="text-translucent-light-64 text-body-2-medium">
              Choose your Some Gorilla to stake on Gorilla Adventure{" "}
            </p>
          </DialogHeader>

          <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-h-[480px] overflow-y-auto">
              {gorillas.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`relative rounded-xl p-3 border-[2px] h-fit w-full bg-translucent-light-4 border-translucent-light-4 transition-all duration-200 cursor-pointer ${
                    selected?.id === g.id
                      ? "border-white bg-white"
                      : "border-[2px] border-translucent-light-4 bg-translucent-light-4"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src={g.image}
                      alt={`Gorilla #${g.id}`}
                      width={187}
                      height={187}
                      className="object-cover w-full h-auto aspect-square"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        selected?.id === g.id
                          ? "text-dark-primary"
                          : "text-light-primary"
                      }`}
                    >
                      #{g.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between w-full bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-[16px] py-4 pl-6 pr-4">
            <div className="text-body-1-medium text-translucent-light-80 font-medium">
              Choose days to take
            </div>
            <div className="flex gap-3">
              {[30, 60, 90].map((d) => (
                <Button
                  key={d}
                  variant="outline"
                  onClick={() => setStakeDays(d)}
                  className={`flex-1 border rounded-md font-semibold text-[13px] ${
                    stakeDays === d
                      ? "bg-light-primary text-dark-primary border-light-primary"
                      : "border-translucent-light-4 bg-translucent-light-4 text-light-primary"
                  }`}
                >
                  {d} days
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              disabled={!selected}
              onClick={() => setConfirmOpen(true)}
              className={`rounded-[8px] px-6 py-4 text-button-56 cursor-pointer font-semibold hover:bg-light-primary transition-all duration-200 ${
                selected
                  ? "bg-light-primary text-dark-primary"
                  : "bg-light-primary text-dark-primary cursor-not-allowed"
              }`}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen && !successOpen}>
        <DialogContent className="max-w-[420px] bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-2xl backdrop-blur-[80px]">
          <DialogHeader>
            <DialogTitle className="text-h5 text-center font-semibold text-light-primary">
              Stake this NFT?
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center mt-2">
            {selected && (
              <div className="flex flex-col w-full items-center gap-6 border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-[12px] p-8 pb-6">
                <Image
                  src={selected.image}
                  alt={`Gorilla #${selected.id}`}
                  width={160}
                  height={160}
                  className="rounded-[8px]"
                />
                <p className="text-light-primary text-body-1-medium font-medium">
                  Some Gorillas #{selected.id}
                </p>
              </div>
            )}
            <p className="text-translucent-light-80 mt-3 w-full bg-translucent-light-4 rounded-[12px] p-4 border-[2px] border-translucent-light-4 text-body-2-medium font-medium">
              You will be able to withdraw your NFT after {stakeDays} days.
            </p>

            <div className="grid grid-cols-2 w-full gap-3 mt-5">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-light-primary bg-translucent-light-4 px-5 py-3 h-12 hover:bg-translucent-light-4 hover:text-light-primary"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setConfirmOpen(false);
                  setSuccessOpen(true);
                }}
                className="w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-dark-primary bg-light-primary px-5 py-3 h-12 hover:bg-light-primary"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen}>
        <DialogContent className="max-w-[420px] bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-2xl backdrop-blur-[80px] text-white text-center">
          <DialogHeader>
            <div className="flex flex-col items-center pt-4 pb-2 gap-5">
              <div className="border-[2px] border-translucent-light-4 p-4 bg-translucent-light-4 rounded-[12px]">
                <Image
                  src="/stake/checkYellow.svg"
                  alt="stake check image"
                  height={32}
                  width={32}
                  className="w-8 h-8 object-cover"
                />
              </div>
              <DialogTitle className="text-center grid gap-1">
                <p className="text-h5 text-light-primary">Successful!</p>
                <p className="text-translucent-light-64 text-body-2-medium">
                  You successfully staked your Gorilla on Adventure.
                </p>
              </DialogTitle>
            </div>
          </DialogHeader>

          {selected && (
            <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-[12px] pt-8 pb-6 flex flex-col gap-6 items-center">
              <Image
                src={selected.image}
                alt={`Gorilla #${selected.id}`}
                width={160}
                height={160}
                className="rounded-[8px]"
              />
            </div>
          )}

          <p className="text-body-1-medium text-light-primary font-medium">
            Some Gorillas #{selected?.id}
          </p>

          <Button
            className="w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-dark-primary bg-light-primary px-5 py-3 h-12 hover:bg-light-primary"
            onClick={() => setSuccessOpen(false)}
          >
            Okay
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
