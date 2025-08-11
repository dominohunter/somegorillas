"use client";
import React, { useState } from "react";
import GlareButton from "../ui/glare-button";
import ArrowRight from "../icons/arrow-right";
import RankModal from "../modals/rank-modal";

interface StatsCardProps {
  stats: number;
  statsLabel: string;
  icon: React.ReactNode;
  clickAble?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  stats,
  statsLabel,
  icon,
  clickAble,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    if (clickAble) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex p-4 gap-5 items-center rounded-2xl border-2 border-translucent-light-4 bg-translucent-light-12">
        <div className="p-2 flex items-center bg-translucent-light-12 border-2 border-translucent-light-4 rounded-[8px] ">
          {icon}
        </div>
        <div className="flex w-full justify-between">
          <div>
            <p className="text-translucent-light-64 text-body2 font-pally">
              {statsLabel}
            </p>
            <p className="text-light-primary text-h5 font-body-2 font-[600]">
              {stats}
            </p>
          </div>
          <div className="flex items-center justify-center">
            {clickAble ? (
              <GlareButton
                onClick={handleButtonClick}
                borderRadius="12px"
                background="rgba(255, 255, 255, 0.16)"
                glareOpacity={0.3}
                glareColor="#ffffff"
                width="48px"
                height="48px"
                className="text-white flex items-center justify-center rounded-[12px] bg-translucent-light-16 border-translucent-light-4"
              >
                <ArrowRight size={24} color="#FAFAFA" />
              </GlareButton>
            ) : null}
          </div>
        </div>
      </div>

      <RankModal
        icon={icon}
        isModalOpen={isModalOpen}
        setIsModalOpen={() => setIsModalOpen(false)}
        statsLabel={statsLabel}
      />
    </>
  );
};

export default StatsCard;
