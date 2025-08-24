"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  audioEnabled: boolean;
  showAudioConsent: boolean;
  volume: number;
  toggleMute: () => void;
  enableAudio: () => void;
  disableAudio: () => void;
  handleAudioConsent: (consent: boolean) => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioConsent, setShowAudioConsent] = useState(false);
  const [volume, setVolumeState] = useState(0.3); // Default 30% volume
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const themeAudioRef2 = useRef<HTMLAudioElement | null>(null);
  const isFirstAudioRef = useRef(true);

  // Check audio consent and load saved volume on startup
  useEffect(() => {
    const hasAskedAudioConsent = localStorage.getItem('audioConsent');
    const savedVolume = localStorage.getItem('audioVolume');
    
    if (savedVolume) {
      setVolumeState(parseFloat(savedVolume));
    }
    
    if (!hasAskedAudioConsent) {
      setShowAudioConsent(true);
    } else if (hasAskedAudioConsent === 'true') {
      setAudioEnabled(true);
    }
  }, []);

  // Initialize dual audio elements for seamless looping
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize both audio elements with fallback support
      themeAudioRef.current = new Audio();
      themeAudioRef2.current = new Audio();
      
      // Check browser support for OGG, fallback to WAV
      const canPlayOgg = themeAudioRef.current.canPlayType('audio/ogg; codecs="vorbis"');
      const audioSrc = canPlayOgg ? '/theme.ogg' : '/theme.wav';
      
      themeAudioRef.current.src = audioSrc;
      themeAudioRef2.current.src = audioSrc;
      
      themeAudioRef.current.volume = volume;
      themeAudioRef2.current.volume = volume;
      themeAudioRef.current.preload = 'auto';
      themeAudioRef2.current.preload = 'auto';
      
      // Seamless crossfade looping
      const handleAudioEnd1 = () => {
        if (audioEnabled && !isMuted && themeAudioRef2.current) {
          themeAudioRef2.current.currentTime = 0;
          themeAudioRef2.current.play().catch(() => {});
          isFirstAudioRef.current = false;
        }
      };
      
      const handleAudioEnd2 = () => {
        if (audioEnabled && !isMuted && themeAudioRef.current) {
          themeAudioRef.current.currentTime = 0;
          themeAudioRef.current.play().catch(() => {});
          isFirstAudioRef.current = true;
        }
      };
      
      // Add error handling
      const handleAudioError1 = (e: Event) => {
        console.error('Audio 1 error:', e, 'Source:', audioSrc);
      };
      
      const handleAudioError2 = (e: Event) => {
        console.error('Audio 2 error:', e, 'Source:', audioSrc);
      };
      
      themeAudioRef.current.addEventListener('ended', handleAudioEnd1);
      themeAudioRef2.current.addEventListener('ended', handleAudioEnd2);
      themeAudioRef.current.addEventListener('error', handleAudioError1);
      themeAudioRef2.current.addEventListener('error', handleAudioError2);
      
      return () => {
        if (themeAudioRef.current) {
          themeAudioRef.current.removeEventListener('ended', handleAudioEnd1);
          themeAudioRef.current.removeEventListener('error', handleAudioError1);
          themeAudioRef.current.pause();
          themeAudioRef.current = null;
        }
        if (themeAudioRef2.current) {
          themeAudioRef2.current.removeEventListener('ended', handleAudioEnd2);
          themeAudioRef2.current.removeEventListener('error', handleAudioError2);
          themeAudioRef2.current.pause();
          themeAudioRef2.current = null;
        }
      };
    }
  }, [volume, audioEnabled, isMuted]);

  // Handle audio playback with dual audio system
  useEffect(() => {
    if (audioEnabled && !isMuted && themeAudioRef.current && themeAudioRef2.current) {
      console.log('Attempting to play audio:', themeAudioRef.current.src);
      themeAudioRef.current.volume = volume;
      themeAudioRef2.current.volume = volume;
      
      // Start with the first audio element
      themeAudioRef.current.currentTime = 0;
      themeAudioRef.current.play()
        .then(() => {
          console.log('Audio playback started successfully');
          setIsPlaying(true);
          isFirstAudioRef.current = true;
        })
        .catch((error) => {
          console.error('Audio playback failed:', error);
          console.log('Audio readyState:', themeAudioRef.current?.readyState);
          console.log('Audio networkState:', themeAudioRef.current?.networkState);
        });
    } else if (themeAudioRef.current && themeAudioRef2.current) {
      themeAudioRef.current.pause();
      themeAudioRef2.current.pause();
      setIsPlaying(false);
    }
  }, [audioEnabled, isMuted, volume]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const enableAudio = () => {
    setAudioEnabled(true);
  };

  const disableAudio = () => {
    setAudioEnabled(false);
  };

  const handleAudioConsent = (consent: boolean) => {
    localStorage.setItem('audioConsent', consent.toString());
    setAudioEnabled(consent);
    setShowAudioConsent(false);
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume)); // Clamp between 0 and 1
    setVolumeState(clampedVolume);
    localStorage.setItem('audioVolume', clampedVolume.toString());
    
    if (themeAudioRef.current) {
      themeAudioRef.current.volume = clampedVolume;
    }
    if (themeAudioRef2.current) {
      themeAudioRef2.current.volume = clampedVolume;
    }
  };

  const value: AudioContextType = {
    isPlaying,
    isMuted,
    audioEnabled,
    showAudioConsent,
    volume,
    toggleMute,
    enableAudio,
    disableAudio,
    handleAudioConsent,
    setVolume,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
