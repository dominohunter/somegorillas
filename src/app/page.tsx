import LoadingScreen from "@/components/screens/loading-screen";
import HomeContent from "@/components/sections/home-content";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
