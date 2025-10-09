"use client";
import React from "react";
import { GlareButton } from "../ui/glare-button";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import HelpPopup from "./help-popup";

export default function GymAdventure() {
  return (
    <>
      <section className="px-6 grid gap-4">
        {/* Header section */}
        <div className="flex justify-between items-center py-5 pr-5 pl-7 rounded-2xl border-[2px] border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl">
          <h1 className="text-h3 font-semibold text-light-primary">Stake</h1>
          <GlareButton
            background="rgba(255, 255, 255, 1)"
            borderRadius="8px"
            className="pr-4 pl-5 py-3 flex items-center justify-center gap-[10px] border border-translucent-light-4"
          >
            <span className="text-button-48 font-semibold text-dark-primary">
              Stake Gorilla
            </span>
            <ArrowRight className="h-5 w-5" />
          </GlareButton>
        </div>
        {/* Main grid bro */}
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* Gym section */}
          <div className="bg-translucent-light-4 w-full border-[2px] border-translucent-light-4 backdrop-blur-2xl p-3 grid gap-3 rounded-2xl">
            <div className="flex items-center py-4 pr-4 pl-5 h-[72px] border-[2px] border-translucent-light-4 rounded-2xl justify-between w-full">
              <h1 className="text-h5 font-semibold text-light-primary">
                Gym-Flexible Staking
              </h1>
              <HelpPopup type="gym" />
            </div>

            <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden">
              <div className="grid gap-5 p-4 max-h-[668px] overflow-y-auto">
                {/* Staking card 1 */}
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-5 rounded-[12px]">
                  <div className="flex items-center gap-5">
                    <Image
                      src="/gorillas/g1.svg"
                      alt="mock image"
                      width={60}
                      height={60}
                      className="object-cover aspect-square rounded-[8px]"
                    />
                    <h1 className="text-body-1-medium font-medium text-light-primary">
                      Some Gorillas #9455
                    </h1>
                  </div>

                  <div className="flex w-full gap-3">
                    <InfoCard label="Start date" value="Aug 31, 2025" />
                    <InfoCard label="Bananas per second" value="🍌 0" />
                    <InfoCard label="Total banana earned" value="🍌 120" />
                  </div>

                  <div className="grid grid-cols-2 w-full gap-3">
                    <Button
                      variant="outline"
                      className="w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-light-primary bg-translucent-light-4 px-5 py-3 h-12 hover:bg-translucent-light-4 hover:text-light-primary"
                    >
                      Withdraw NFT
                    </Button>

                    <Button className="w-full border-[2px] cursor-not-allowed border-translucent-light-4 text-button-48 font-semibold hover:bg-translucent-light-4 bg-translucent-light-4 px-5 py-3 h-12 rounded-[8px] text-translucent-light-64">
                      Claimed
                    </Button>
                  </div>
                </div>

                {/* Staking card 2 */}
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-5 rounded-[12px]">
                  <div className="flex items-center gap-5">
                    <Image
                      src="/gorillas/g2.svg"
                      alt="mock image"
                      width={60}
                      height={60}
                      className="object-cover aspect-square rounded-[8px]"
                    />
                    <h1 className="text-body-1-medium font-medium text-light-primary">
                      Some Gorillas #5653
                    </h1>
                  </div>

                  <div className="flex gap-3">
                    <InfoCard label="Start date" value="Sep 8, 2025" />
                    <InfoCard label="Bananas per second" value="🍌 0.1" />
                    <InfoCard label="Total banana earned" value="🍌 120" />
                  </div>

                  <div className="grid grid-cols-2 w-full gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-light-primary bg-translucent-light-4 px-5 py-3 h-12 hover:bg-translucent-light-4 hover:text-light-primary"
                    >
                      <Image
                        src="/stake/lock.svg"
                        alt="lock icon"
                        height={20}
                        width={20}
                        className="w-5 h-5 object-cover"
                      />
                      <p>Unstake</p>
                    </Button>

                    <Button className="w-full border-[2px] cursor-pointer border-translucent-light-4 text-button-48 font-semibold text-dark-primary bg-light-primary px-5 py-3 h-12 hover:bg-light-primary">
                      Claim 20 bananas
                    </Button>
                  </div>
                </div>
                {/* Staking card 3 */}
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-5 rounded-[12px]">
                  <div className="flex items-center gap-5">
                    <Image
                      src="/gorillas/g3.svg"
                      alt="mock image"
                      width={60}
                      height={60}
                      className="object-cover aspect-square rounded-[8px]"
                    />
                    <h1 className="text-body-1-medium font-medium text-light-primary">
                      Some Gorillas #1233
                    </h1>
                  </div>

                  <div className="flex gap-3">
                    <InfoCard label="Start date" value="Sep 8, 2025" />
                    <InfoCard label="Bananas per second" value="🍌 0.1" />
                    <InfoCard label="Total banana earned" value="🍌 120" />
                  </div>

                  <div className="grid grid-cols-2 w-full gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-light-primary bg-translucent-light-4 px-5 py-3 h-12 hover:bg-translucent-light-4 hover:text-light-primary"
                    >
                      <Image
                        src="/stake/lock.svg"
                        alt="lock icon"
                        height={20}
                        width={20}
                        className="w-5 h-5 object-cover"
                      />
                      <p>Unstake</p>
                    </Button>

                    <Button className="w-full border-[2px] cursor-pointer border-translucent-light-4 text-button-48 font-semibold text-dark-primary bg-light-primary px-5 py-3 h-12 hover:bg-light-primary">
                      Claim 20 bananas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  Adventure section*/}
          <div className="bg-translucent-light-4 w-full border-[2px] border-translucent-light-4 backdrop-blur-2xl p-3 grid gap-3 rounded-2xl">
            <div className="flex items-center py-4 pr-4 pl-5 h-[72px] border-[2px] border-translucent-light-4 rounded-2xl justify-between w-full">
              <h1 className="text-h5 font-semibold text-light-primary">
                Adventure - Locked Staking
              </h1>
              <HelpPopup type="adventure" />
            </div>

            <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden">
              <div className="grid gap-5 p-4 max-h-[668px] overflow-y-auto">
                {/* Adventure card 1 */}

                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-5 rounded-[12px]">
                  <div className="flex items-center gap-5">
                    <Image
                      src="/gorillas/g1.svg"
                      alt="mock image"
                      width={60}
                      height={60}
                      className="object-cover aspect-square rounded-[8px]"
                    />
                    <h1 className="text-body-1-medium font-medium text-light-primary">
                      Some Gorillas #3582
                    </h1>
                  </div>

                  <div className="flex gap-3">
                    <InfoCard label="Start date" value="Oct 9, 2025" />
                    <InfoCard label="Bananas per second" value="🍌 0.1" />
                    <InfoCard label="Total banana earned" value="🍌 120" />
                  </div>

                  <div className="grid grid-cols-2 w-full gap-3">
                    <Button
                      variant="outline"
                      className="w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-light-primary bg-translucent-light-4 px-5 py-3 h-12 hover:bg-translucent-light-4 hover:text-light-primary"
                    >
                      Withdraw NFT
                    </Button>

                    <Button className="w-full border-[2px] cursor-pointer border-translucent-light-4 text-button-48 font-semibold text-dark-primary bg-light-primary px-5 py-3 h-12 hover:bg-light-primary">
                      Claim 20 bananas
                    </Button>
                  </div>
                </div>

                {/* Adventure card 2 */}
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-5 rounded-[12px]">
                  <div className="flex items-center gap-5">
                    <Image
                      src="/gorillas/g8.svg"
                      alt="mock image"
                      width={60}
                      height={60}
                      className="object-cover aspect-square rounded-[8px]"
                    />
                    <h1 className="text-body-1-medium font-medium text-light-primary">
                      Some Gorillas #1261
                    </h1>
                  </div>

                  <div className="flex w-full gap-3">
                    <InfoCard label="Start date" value="Aug 12, 2025" />
                    <InfoCard label="Bananas per second" value="🍌 0" />
                    <InfoCard label="Total banana earned" value="🍌 1500" />
                  </div>

                  <div className="grid grid-cols-2 w-full gap-3">
                    <div className="grid gap-1 px-2">
                      <p className="text-caption-1-medium font-medium text-translucent-light-80">
                        You can withdraw your NFT after
                      </p>
                      <h1 className="text-body-2-medium font-medium text-light-primary">
                        45d 23h 59m
                      </h1>
                    </div>

                    <Button className="w-full border-[2px] cursor-not-allowed border-translucent-light-4 text-button-48 font-semibold hover:bg-translucent-light-4 bg-translucent-light-4 px-5 py-3 h-12 rounded-[8px] text-translucent-light-64">
                      Claimed
                    </Button>
                  </div>
                </div>

                {/* You are not staking any gorilla on Adventure condition. */}
                {/* <div className="h-[664px] border-2 border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-4 px-4 py-3 rounded-[12px]">
                  <div className="border-2 h-[96px] w-[96px] border-translucent-light-4 rounded-[12px] bg-translucent-light-4 p-6 flex justify-center items-center">
                    <Image
                      src="/slot-machine/gorilla.svg"
                      alt="stake image"
                      height={48}
                      width={48}
                      className="w-12 h-12 object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    />
                  </div>
                  <p className="text-translucent-light-64 text-body-2- medium font-medium ">
                    You are not staking any gorilla on Adventure.
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[2px] min-w-[192px] min-h-[72px] border-translucent-light-4 bg-translucent-light-4 rounded-[8px] py-3 px-4 grid gap-1">
      <p className="text-caption-1-medium text-translucent-light-80 font-medium">
        {label}
      </p>
      <h1 className="text-body-2-medium text-light-primary font-medium h-6">
        {value}
      </h1>
    </div>
  );
}
