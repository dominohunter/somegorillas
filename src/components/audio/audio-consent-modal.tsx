"use client";

import { useAudio } from '@/contexts/audio-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AudioConsentModal() {
  const { showAudioConsent, handleAudioConsent } = useAudio();

  return (
    <Dialog open={showAudioConsent} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-h5 text-light-primary text-center">
            🎵 Welcome to the Jungle!
          </DialogTitle>
          <DialogDescription className="text-light-primary/80 text-center">
            Enable background music for the full SomeGorillas experience
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-light-primary/80 mb-6">
            Would you like to enable background music for the full SomeGorillas experience?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleAudioConsent(true)}
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              🦍 Yes, Let&apos;s Groove!
            </button>
            <button
              onClick={() => handleAudioConsent(false)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
            >
              No Thanks
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}