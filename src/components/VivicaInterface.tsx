
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { GlassmorphicSettingsModal } from './GlassmorphicSettingsModal';
import { VivicaOrb } from './VivicaOrb';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { useIntentRecognition } from '@/hooks/useIntentRecognition';
import { IntentHandlers } from '@/services/intentHandlers';
import { useWakeLock } from '@/hooks/useWakeLock';

type VivicaState = 'idle' | 'listening' | 'processing' | 'speaking';

export const VivicaInterface = () => {
  const [state, setState] = useState<VivicaState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingRef = useRef(false);
  const pendingTranscriptRef = useRef('');
  
  const { requestWakeLock, releaseWakeLock, isSupported: wakeLockSupported } = useWakeLock();
  const { activeProfile } = useProfiles();
  
  const { generateResponse } = useOpenRouter();
  const { 
    messages, 
    addMessage, 
    editMessage, 
    deleteMessage, 
    clearHistory, 
    getContextMessages 
  } = useConversationHistory();
  
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech({
    onStart: () => {
      console.log('TTS started');
      setState('speaking');
      requestWakeLock();
    },
    onEnd: () => {
      console.log('TTS ended, returning to idle');
      isProcessingRef.current = false;
      setState('idle');
      releaseWakeLock();
    },
    onError: (error) => {
      console.error('TTS error:', error);
      isProcessingRef.current = false;
      setState('idle');
      releaseWakeLock();
    }
  });
  
  const { 
    isListening, 
    transcript,
    hasPermission,
    startListening, 
    stopListening,
    resetTranscript,
    forceStop,
    requestMicrophonePermission
  } = useVoiceRecognition({
    onResult: handleVoiceInput,
    onError: (error) => {
      console.error('Voice recognition error:', error);
      isProcessingRef.current = false;
      
      if (typeof error === 'string' && error.includes('permission')) {
        toast.error('Microphone permission required. Please allow microphone access.');
        setState('idle');
        releaseWakeLock();
        return;
      }
      
      if (error !== 'no-speech' && error !== 'aborted') {
        toast.error(`Voice error: ${error}`);
      }
      
      setState('idle');
      releaseWakeLock();
    },
    speechTimeout: 2000,
    hardTimeout: 15000,
    continuous: false
  });

  const { detectIntent } = useIntentRecognition();
  
  async function handleVoiceInput(text: string) {
    const trimmedText = text.trim();
    console.log('handleVoiceInput called with:', trimmedText);
    
    if (!trimmedText || isProcessingRef.current) {
      console.log('Ignoring voice input:', { text: trimmedText, isProcessing: isProcessingRef.current });
      return;
    }
    
    console.log('Processing voice input:', trimmedText);
    isProcessingRef.current = true;
    setState('processing');
    resetTranscript();
    pendingTranscriptRef.current = '';
    
    // Add user message to history
    addMessage('user', trimmedText);
    
    try {
      // Detect intent
      const intent = detectIntent(trimmedText);
      let response = '';
      
      if (intent !== 'general') {
        // Handle special intents
        const weatherApiKey = localStorage.getItem('vivica_weather_api_key');
        const newsApiKey = localStorage.getItem('vivica_news_api_key');
        
        if (weatherApiKey || newsApiKey) {
          const handlers = new IntentHandlers(weatherApiKey || '', newsApiKey || '');
          
          switch (intent) {
            case 'weather':
              response = await handlers.handleWeather(trimmedText);
              break;
            case 'news':
              response = await handlers.handleNews();
              break;
            case 'traffic':
              response = await handlers.handleTraffic(trimmedText);
              break;
            case 'sports':
              response = await handlers.handleSports(trimmedText);
              break;
          }
        }
      }
      
      // If no special intent response, use AI
      if (!response) {
        const contextMessages = getContextMessages(8);
        response = await generateResponse(trimmedText, contextMessages);
      }
      
      if (response) {
        console.log('AI response received:', response);
        // Add AI response to history
        addMessage('assistant', response);
        
        if (!isMuted) {
          console.log('Speaking AI response');
          speak(response);
          // TTS onEnd callback will handle returning to idle
        } else {
          console.log('Muted mode - returning to idle without speaking');
          isProcessingRef.current = false;
          setState('idle');
          releaseWakeLock();
        }
      } else {
        console.log('No AI response, returning to idle');
        isProcessingRef.current = false;
        setState('idle');
        releaseWakeLock();
      }
    } catch (error) {
      console.error('AI response error:', error);
      toast.error('Failed to generate response');
      isProcessingRef.current = false;
      setState('idle');
      releaseWakeLock();
    }
  }

  const handleHoldStart = useCallback(async () => {
    if (isHolding || showSettings) return;
    
    console.log('Hold start - checking state');
    
    // Haptic feedback on press
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // If speaking, interrupt and start listening
    if (isSpeaking) {
      console.log('Interrupting speech to listen');
      stopSpeaking();
      isProcessingRef.current = false;
    }
    
    // Always request permission explicitly when user wants to talk
    if (hasPermission !== true) {
      console.log('Requesting microphone permission...');
      const granted = await requestMicrophonePermission();
      if (!granted) {
        toast.error('Microphone permission is required for VIVICA to work.');
        return;
      }
    }
    
    console.log('Starting hold-to-talk');
    setIsHolding(true);
    setState('listening');
    requestWakeLock();
    pendingTranscriptRef.current = '';
    
    // Small delay to ensure state is set before starting
    setTimeout(() => {
      startListening();
    }, 100);
  }, [isHolding, showSettings, isSpeaking, hasPermission, requestMicrophonePermission, stopSpeaking, startListening, requestWakeLock]);

  const handleHoldEnd = useCallback(() => {
    if (!isHolding) return;
    
    console.log('Hold end - stopping listening and processing transcript');
    
    // Haptic feedback on release
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    setIsHolding(false);
    
    // Stop listening immediately and get the current transcript
    const currentTranscript = transcript.trim();
    console.log('Current transcript on release:', currentTranscript);
    
    // Force stop the voice recognition
    stopListening();
    
    // If we have a transcript, process it immediately
    if (currentTranscript) {
      console.log('Processing transcript from hold end:', currentTranscript);
      handleVoiceInput(currentTranscript);
    } else {
      // No transcript, return to idle
      console.log('No transcript captured, returning to idle');
      setState('idle');
      releaseWakeLock();
    }
  }, [isHolding, transcript, stopListening, handleVoiceInput, releaseWakeLock]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    handleHoldStart();
  }, [handleHoldStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    handleHoldEnd();
  }, [handleHoldEnd]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (isHolding) {
      handleHoldEnd();
    }
  }, [isHolding, handleHoldEnd]);

  // Handle keyboard space bar for desktop
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && !showSettings) {
      e.preventDefault();
      handleHoldStart();
    }
  }, [handleHoldStart, showSettings]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !showSettings) {
      e.preventDefault();
      handleHoldEnd();
    }
  }, [handleHoldEnd, showSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  const getStatusText = () => {
    if (hasPermission === false) {
      return 'Hold orb to allow microphone access';
    }
    
    switch (state) {
      case 'idle':
        return (
          <span className="block">
            <span className="hidden sm:inline">Hold space or </span>
            <span>hold orb to talk</span>
          </span>
        );
      case 'listening':
        return (
          <span className="flex items-center gap-2">
            Listening...
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </span>
        );
      case 'processing':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* Glassmorphic Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-6 right-6 z-10 p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          boxShadow: '0 8px 32px rgba(144, 72, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        <Settings className="w-5 h-5 text-white/80" />
      </button>

      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* Main Orb - Interactive */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: 'none' }}
      >
        <VivicaOrb 
          state={state} 
          audioLevel={isListening ? 0.5 : 0} 
          canvasRef={canvasRef}
          orbColors={activeProfile?.orbColors}
        />
      </div>

      {/* Active Profile Title - Responsive sizing */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none px-4 max-w-full">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] text-white/90 drop-shadow-2xl text-center">
          {activeProfile?.name || 'V I V I C A'}
        </h1>
        <div className="text-center text-white/60 mt-1 sm:mt-2 text-xs sm:text-sm px-2">
          {getStatusText()}
          {transcript && (
            <div className="mt-2 text-white/80 text-xs italic max-w-sm mx-auto line-clamp-2">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphic Settings Modal */}
      <GlassmorphicSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
          State: {state}<br/>
          Holding: {isHolding ? 'Yes' : 'No'}<br/>
          Listening: {isListening ? 'Yes' : 'No'}<br/>
          Speaking: {isSpeaking ? 'Yes' : 'No'}<br/>
          Processing: {isProcessingRef.current ? 'Yes' : 'No'}<br/>
          Permission: {hasPermission === null ? 'Unknown' : hasPermission ? 'Granted' : 'Denied'}<br/>
          WakeLock: {wakeLockSupported ? 'Supported' : 'Not supported'}<br/>
          Messages: {messages.length}<br/>
          Transcript: {transcript ? `"${transcript}"` : 'None'}<br/>
          Active Profile: {activeProfile?.name || 'None'}
        </div>
      )}
    </div>
  );
};
