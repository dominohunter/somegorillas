"use client";

import { useAudio } from '@/contexts/audio-context';

export default function MuteButton() {
  const { audioEnabled, isMuted, toggleMute } = useAudio();

  if (!audioEnabled) return null;

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 bg-translucent-dark-12 border border-translucent-light-8 rounded-full p-3 hover:bg-translucent-dark-16 transition-all duration-200"
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
  );
}
