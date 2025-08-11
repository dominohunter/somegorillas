"use client";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {

  // useEffect(() => {
  //   if (!address) {
  //     localStorage.removeItem("gorillaz_token");
  //     router.push("/");
  //   }
  // }, []);

  return <div>{children}</div>;
};

export default DashboardLayout;
