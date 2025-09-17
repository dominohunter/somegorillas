"use client";
import Image from "next/image";
import { useState } from "react";

interface OptimizedBackgroundProps {
  backgroundName: string;
}

export default function OptimizedBackground({
  backgroundName,
}: OptimizedBackgroundProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-900 to-black animate-pulse" />
      )}

      <div className="fixed inset-0 z-0" data-background="fixed">
        <Image
          src={`/${backgroundName}.png`}
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          quality={75}
          sizes="100vw"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            console.error(
              "Background image failed to load:",
              backgroundName,
              e,
            );
            setHasError(true);
            setIsLoading(false);
          }}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyepckmy2kkyKKKKStIVFTSiiiiqVKSlJSlIVJKKUpFJKUpSkUpSKKpJKUpJKUpSkpSKUiiiiiqf//Z"
        />
      </div>

      {hasError && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-900 to-black" />
      )}

      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 z-[1] bg-black/30 pointer-events-none" />

      <div
        className="fixed inset-0 opacity-50 pointer-events-none z-[2] bg-repeat"
        data-background="fixed"
        style={{
          backgroundImage: "url(/Noiselayer.svg)",
          backgroundRepeat: "repeat",
        }}
      />
    </>
  );
}
