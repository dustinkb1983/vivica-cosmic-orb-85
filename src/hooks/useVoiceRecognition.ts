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
  speechTimeout = 500 // refined: default pause between speech segments, now 500ms
}: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fullUtteranceRef = useRef(''); // buffer for current utterance

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = false; // only finalized utterances matter for conversation
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
      fullUtteranceRef.current = '';
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      // Aggregate all final results in this event into a coherent utterance
      let combined = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const txt = event.results[i][0].transcript.trim();
          if (txt) {
            combined += (combined ? ' ' : '') + txt;
          }
        }
      }
      if (combined) {
        fullUtteranceRef.current += (fullUtteranceRef.current ? ' ' : '') + combined;
        setTranscript(fullUtteranceRef.current);

        // Reset the speech timeout for post-speech pause
        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = setTimeout(() => {
          const toSend = fullUtteranceRef.current.trim();
          // Only respond if we have a useful phrase (minimum length to avoid "um", blank, etc)
          if (toSend.length > 2) {
            console.log('Final utterance dispatched:', toSend);
            onResult(toSend);
          } else {
            console.log('Ignoring very short utterance:', toSend);
          }
          fullUtteranceRef.current = '';
          setTranscript('');
        }, speechTimeout);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (event.error !== 'no-speech') {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      // On natural end, also clear buffers
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      setTranscript('');
      fullUtteranceRef.current = '';
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
        fullUtteranceRef.current = '';
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
    fullUtteranceRef.current = '';
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
