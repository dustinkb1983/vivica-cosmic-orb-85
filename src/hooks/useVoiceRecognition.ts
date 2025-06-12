
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecognitionOptions {
  onResult: (text: string) => void;
  onError: (error: any) => void;
  language?: string;
  continuous?: boolean;
  speechTimeout?: number;
}

// Extend the Window interface for TypeScript
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
  speechTimeout = 1500
}: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef('');

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
      setIsListening(true);
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the current transcript display
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // If we have a final result, accumulate it
      if (finalTranscript && finalTranscript.trim()) {
        finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + finalTranscript.trim();
        console.log('Accumulated transcript:', finalTranscriptRef.current);
        
        // Clear any existing timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        
        // Set a timeout to process the accumulated speech after a pause
        speechTimeoutRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            console.log('Processing final accumulated transcript:', finalTranscriptRef.current);
            onResult(finalTranscriptRef.current.trim());
            finalTranscriptRef.current = '';
            setTranscript('');
          }
        }, speechTimeout);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Clear any pending timeouts
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      
      // Don't treat 'no-speech' as a real error - just restart
      if (event.error === 'no-speech') {
        console.log('No speech detected, this is normal');
        return;
      }
      
      onError(event.error);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      setTranscript('');
      
      // Clear any pending timeouts
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
    };

    return recognition;
  }, [onResult, onError, language, continuous, speechTimeout]);

  const startListening = useCallback(() => {
    console.log('startListening called, current state:', { isListening, isInitialized: isInitializedRef.current });
    
    if (!isInitializedRef.current || !recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
      isInitializedRef.current = true;
    }

    if (recognitionRef.current && !isListening) {
      try {
        console.log('Actually starting recognition...');
        finalTranscriptRef.current = '';
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        // If we get an error because it's already started, that's ok
        if (error instanceof Error && !error.message.includes('already started')) {
          onError(error);
        }
      }
    } else {
      console.log('Not starting recognition - either no recognition object or already listening');
    }
  }, [initializeRecognition, isListening, onError]);

  const stopListening = useCallback(() => {
    console.log('stopListening called');
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    // Clear any pending timeouts
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up recognition:', error);
        }
      }
      
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  };
};
