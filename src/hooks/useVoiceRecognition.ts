
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
  speechTimeout = 1000 // Reduced timeout for faster response
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
    recognition.interimResults = true; // Enable interim results for better responsiveness
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
      finalTranscriptRef.current = '';
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
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

      // Update the display transcript
      setTranscript(finalTranscriptRef.current + finalTranscript + interimTranscript);

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        
        // Clear any existing timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }

        // Set a timeout to process the final transcript after a pause
        speechTimeoutRef.current = setTimeout(() => {
          const toSend = finalTranscriptRef.current.trim();
          if (toSend.length > 2) {
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
      setIsListening(false);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      
      // Only call onError for significant errors, not 'no-speech'
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
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
        setTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (error instanceof Error && !error.message.includes('already started')) {
          onError(error);
        }
      }
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
