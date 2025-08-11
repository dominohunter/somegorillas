import React from "react";
import Logo from "../icons/logo";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-black absolute w-full h-screen top-0 flex items-center justify-center ">
      <div className="flex justify-center items-center">
        <div className="animate-bounce duration-250">
          <Logo size={120} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
