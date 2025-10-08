"use client";

import React from "react";

interface GlobalStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}

const GlobalStatCard: React.FC<GlobalStatCardProps> = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="flex gap-5 p-4 flex-1 bg-translucent-light-4 rounded-2xl backdrop-blur-xl border-2 border-translucent-light-4">
      <div className="flex rounded-[12px] justify-center border-2 border-translucent-light-4 bg-translucent-light-8 items-center p-4 ">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-body-2 text-translucent-light-64 font-medium font-pally">
          {title}
        </h2>
        <p className="text-body-1 font-medium font-pally text-light-primary">
          {value}
        </p>
      </div>
    </div>
  );
};

export default GlobalStatCard;
