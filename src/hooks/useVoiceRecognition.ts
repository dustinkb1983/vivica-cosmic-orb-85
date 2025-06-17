
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecognitionOptions {
  onResult: (text: string) => void;
  onError: (error: any) => void;
  language?: string;
  continuous?: boolean;
  speechTimeout?: number;
  hardTimeout?: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceRecognition = ({
  onResult,
  onError,
  language = 'en-US',
  continuous = true,
  speechTimeout = 1500,
  hardTimeout = 30000
}: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef('');
  const isActiveRef = useRef(false);
  const isStartingRef = useRef(false);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      // First check if we already have permission
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(permission.state === 'granted');
      
      permission.onchange = () => {
        setHasPermission(permission.state === 'granted');
      };
    } catch (error) {
      console.log('Permission API not supported, will check during recognition');
      setHasPermission(null);
    }
  }, []);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
      setHasPermission(true);
      console.log('Microphone permission granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      onError('Microphone permission denied. Please allow microphone access and try again.');
      return false;
    }
  }, [onError]);

  const cleanupTimeouts = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
  }, []);

  const forceStop = useCallback(() => {
    console.log('Force stopping recognition');
    isActiveRef.current = false;
    isStartingRef.current = false;
    setIsListening(false);
    cleanupTimeouts();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
    
    setTranscript('');
    finalTranscriptRef.current = '';
  }, [cleanupTimeouts]);

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      isStartingRef.current = false;
      if (!isActiveRef.current) return;
      
      setIsListening(true);
      finalTranscriptRef.current = '';
      setTranscript('');
      
      // Set hard timeout to prevent getting stuck
      hardTimeoutRef.current = setTimeout(() => {
        console.log('Hard timeout reached, forcing stop');
        onError('timeout');
        forceStop();
      }, hardTimeout);
    };

    recognition.onresult = (event: any) => {
      if (!isActiveRef.current) return;
      
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      setTranscript(finalTranscriptRef.current + finalTranscript + interimTranscript);

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        
        cleanupTimeouts();
        speechTimeoutRef.current = setTimeout(() => {
          const toSend = finalTranscriptRef.current.trim();
          if (toSend.length > 2 && isActiveRef.current) {
            console.log('Processing final transcript:', toSend);
            onResult(toSend);
            finalTranscriptRef.current = '';
            setTranscript('');
          }
        }, speechTimeout);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      isStartingRef.current = false;
      
      if (!isActiveRef.current) return;
      
      cleanupTimeouts();
      setIsListening(false);
      
      // Handle different error types
      switch (event.error) {
        case 'not-allowed':
          setHasPermission(false);
          onError('Microphone permission denied');
          break;
        case 'no-speech':
          // Restart listening if still active
          if (isActiveRef.current) {
            setTimeout(() => {
              if (isActiveRef.current && !isStartingRef.current) {
                console.log('Restarting after no-speech');
                startListening();
              }
            }, 1000);
          }
          break;
        case 'network':
          onError('Network error - check your connection');
          break;
        case 'aborted':
          // Expected when manually stopped
          break;
        default:
          onError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      isStartingRef.current = false;
      
      if (!isActiveRef.current) return;
      
      cleanupTimeouts();
      setIsListening(false);
      
      // Auto-restart if still active and no errors
      setTimeout(() => {
        if (isActiveRef.current && !isStartingRef.current) {
          console.log('Auto-restarting recognition');
          startListening();
        }
      }, 500);
    };

    return recognition;
  }, [onResult, onError, language, continuous, speechTimeout, hardTimeout, cleanupTimeouts, forceStop]);

  const startListening = useCallback(async () => {
    console.log('startListening called, current state:', { 
      isListening, 
      isActive: isActiveRef.current,
      isStarting: isStartingRef.current,
      hasPermission 
    });
    
    // Prevent multiple simultaneous starts
    if (isStartingRef.current || isListening) {
      console.log('Already starting or listening, ignoring request');
      return;
    }
    
    // Check if we have permission first
    if (hasPermission === false) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }
    
    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current && !isListening && !isStartingRef.current) {
      try {
        isActiveRef.current = true;
        isStartingRef.current = true;
        finalTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        isStartingRef.current = false;
        if (error instanceof Error && !error.message.includes('already started')) {
          onError(error.message);
        }
      }
    }
  }, [initializeRecognition, isListening, onError, hasPermission, requestMicrophonePermission]);

  const stopListening = useCallback(() => {
    console.log('stopListening called');
    isActiveRef.current = false;
    forceStop();
  }, [forceStop]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    cleanupTimeouts();
  }, [cleanupTimeouts]);

  useEffect(() => {
    checkMicrophonePermission();
    
    return () => {
      isActiveRef.current = false;
      isStartingRef.current = false;
      cleanupTimeouts();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up recognition:', error);
        }
      }
    };
  }, [checkMicrophonePermission, cleanupTimeouts]);

  return {
    isListening,
    transcript,
    hasPermission,
    startListening,
    stopListening,
    resetTranscript,
    forceStop,
    requestMicrophonePermission,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  };
};
