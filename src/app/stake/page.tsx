"use client";

import React from "react";
import Image from "next/image";
import { GlareButton } from "@/components/ui/glare-button";
import { ArrowRight } from "lucide-react";

export default function Stake() {
  return (
    <section className="w-full flex items-center mt-[120px] justify-center overflow-y-hidden px-4">
      <div className="grid md:grid-cols-2 backdrop-blur-3xl grid-cols-1 gap-4 p-4 rounded-[20px] border-2 border-translucent-light-4 max-w-[880px] w-full h-auto">
        {/* Left content */}
        <div className="p-4 grid gap-3 rounded-2xl border-translucent-light-4 bg-translucent-light-4">
          <h5 className="text-h5 text-light-primary">Stake</h5>
          <p className="text-body-2-medium text-light-primary">
            Stake your Gorillas and grow your Banana stash. Hit the Gym for
            flexible yields with no lockup, or send them on Adventures for
            bigger rewards and rare upgrades. Train, explore, and come back
            stronger.
          </p>
          <div className="h-[412px] border border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-7 rounded-[12px]">
            <span className="h-[96px] w-[96px] p-6 border-2 border-translucent-light-8 bg-translucent-light-8 rounded-2xl">
              <Image
                src="/icons/logo-gradient.svg"
                alt="stake image"
                height={48}
                width={48}
                className="w-12 h-12 object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] glow"
              />
            </span>
            {/*<p className="text-translucent-light-80 text-body-2-medium text-center">
              Looks like you are not staking any gorilla
            </p>*/}
            <GlareButton
              background="rgba(255, 255, 255, 1)"
              borderRadius="8px"
              disabled={true}
              className="pr-4 pl-5 py-3 flex items-center justify-center gap-[10px] border border-translucent-light-4"
            >
              <span className="text-button-48 font-semibold text-dark-primary">
                Coming soon...
              </span>
              <ArrowRight className="h-5 w-5" />
            </GlareButton>
          </div>
        </div>

        {/* Right content */}
        <div className="w-full h-auto flex items-center justify-center">
          <Image
            src="/staking.png"
            draggable="false"
            alt="stake image"
            height={100}
            width={400}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
