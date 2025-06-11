import { useState, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

const filterEmojis = (text: string): string => {
  // Remove emojis and other non-speech characters
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional country flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .trim();
};

export const useTextToSpeech = ({
  onStart,
  onEnd,
  onError,
  rate = 1,
  pitch = 1,
  volume = 1,
  voice = null
}: UseTextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!text.trim()) return;

    // Filter out emojis before speaking
    const filteredText = filterEmojis(text);
    if (!filteredText.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(filteredText);
    utteranceRef.current = utterance;

    // Configure utterance
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    if (voice) {
      utterance.voice = voice;
    }

    // Event handlers
    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(event);
    };

    utterance.onpause = () => {
      console.log('Speech paused');
      setIsPaused(true);
    };

    utterance.onresume = () => {
      console.log('Speech resumed');
      setIsPaused(false);
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  }, [rate, pitch, volume, voice, onStart, onEnd, onError]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (isSpeaking && !isPaused) {
      speechSynthesis.pause();
    }
  }, [isSpeaking, isPaused]);

  const resumeSpeaking = useCallback(() => {
    if (isSpeaking && isPaused) {
      speechSynthesis.resume();
    }
  }, [isSpeaking, isPaused]);

  const getVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  return {
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    isPaused,
    getVoices,
    isSupported: 'speechSynthesis' in window
  };
};
