"use client";

import { useAudio } from '@/contexts/audio-context';
import { useState } from 'react';

export default function AudioControls() {
  const { audioEnabled, isMuted, volume, toggleMute, setVolume } = useAudio();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!audioEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Volume Slider */}
      {showVolumeSlider && (
        <div className="bg-translucent-dark-12 border border-translucent-light-8 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-light-primary text-xs font-medium">Volume</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-light-primary/70 text-xs">{Math.round(volume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-2 bg-translucent-light-8 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f5d020 0%, #f5d020 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Audio Button */}
      <div className="relative">
        <button
          onClick={toggleMute}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
          className="bg-translucent-dark-12 border border-translucent-light-8 rounded-full p-3 hover:bg-translucent-dark-16 transition-all duration-200"
          title={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-light-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-light-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f5d020;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f5d020;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}