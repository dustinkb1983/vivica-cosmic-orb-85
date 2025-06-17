
import { useState, useCallback, useRef } from 'react';
import { GoogleTTSService } from '@/services/googleTTS';

interface UseTextToSpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  useGoogleTTS?: boolean;
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
  voice = null,
  useGoogleTTS = false
}: UseTextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const googleTTSRef = useRef<GoogleTTSService | null>(null);

  // Initialize Google TTS if needed
  const initializeGoogleTTS = useCallback(() => {
    const apiKey = localStorage.getItem('vivica_google_tts_key');
    if (apiKey && !googleTTSRef.current) {
      const voiceName = localStorage.getItem('vivica_google_voice') || 'en-US-Standard-E';
      googleTTSRef.current = new GoogleTTSService({
        apiKey,
        voice: voiceName
      });
    }
    return googleTTSRef.current;
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Filter out emojis before speaking
    const filteredText = filterEmojis(text);
    if (!filteredText.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const shouldUseGoogle = useGoogleTTS || localStorage.getItem('vivica_use_google_tts') === 'true';
    
    if (shouldUseGoogle) {
      const googleTTS = initializeGoogleTTS();
      if (googleTTS) {
        try {
          console.log('Using Google TTS');
          setIsSpeaking(true);
          setIsPaused(false);
          onStart?.();

          const audioContent = await googleTTS.synthesize(filteredText);
          
          // Create audio element for playback
          const audioBlob = new Blob([
            Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
          ], { type: 'audio/mp3' });
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.volume = volume;
          
          audio.onended = () => {
            console.log('Google TTS speech ended');
            URL.revokeObjectURL(audioUrl);
            setIsSpeaking(false);
            setIsPaused(false);
            audioRef.current = null;
            onEnd?.();
          };
          
          audio.onerror = (event) => {
            console.error('Google TTS audio error:', event);
            URL.revokeObjectURL(audioUrl);
            setIsSpeaking(false);
            setIsPaused(false);
            audioRef.current = null;
            onError?.(event);
          };
          
          await audio.play();
          return;
        } catch (error) {
          console.error('Google TTS error, falling back to browser TTS:', error);
          // Fall back to browser TTS
        }
      }
    }

    // Use browser TTS (fallback or default)
    console.log('Using browser TTS');
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
      console.log('Browser TTS speech started');
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      console.log('Browser TTS speech ended');
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Browser TTS speech error:', event);
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
  }, [rate, pitch, volume, voice, onStart, onEnd, onError, useGoogleTTS, initializeGoogleTTS]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (isSpeaking && !isPaused) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPaused(true);
      } else {
        speechSynthesis.pause();
      }
    }
  }, [isSpeaking, isPaused]);

  const resumeSpeaking = useCallback(() => {
    if (isSpeaking && isPaused) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        speechSynthesis.resume();
      }
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
