import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from './SettingsPanel';
import { ConversationHistoryPanel } from './ConversationHistoryPanel';
import { VivicaOrb } from './VivicaOrb';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { toast } from 'sonner';
import { useIntentRecognition } from '@/hooks/useIntentRecognition';
import { IntentHandlers } from '@/services/intentHandlers';

type VivicaState = 'idle' | 'listening' | 'processing' | 'speaking';

export const VivicaInterface = () => {
  const [state, setState] = useState<VivicaState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingRef = useRef(false);
  
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
    },
    onEnd: () => {
      console.log('TTS ended, returning to listening mode');
      isProcessingRef.current = false;
      if (isEnabled) {
        setState('listening');
        setTimeout(() => {
          console.log('Restarting listening after speech ended');
          startListening();
        }, 1000);
      } else {
        setState('idle');
      }
    },
    onError: (error) => {
      console.error('TTS error:', error);
      isProcessingRef.current = false;
      if (isEnabled) {
        setState('listening');
        setTimeout(() => {
          startListening();
        }, 1000);
      } else {
        setState('idle');
      }
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
        setIsEnabled(false);
        return;
      }
      
      if (error === 'timeout') {
        toast.info('Voice recognition timed out. Restarting...');
      } else if (error !== 'no-speech' && error !== 'aborted') {
        toast.error(`Voice error: ${error}`);
      }
      
      if (isEnabled && !isProcessingRef.current) {
        setState('listening');
        setTimeout(() => {
          startListening();
        }, 2000);
      } else {
        setState('idle');
      }
    },
    speechTimeout: 3000, // Increased for better accuracy
    hardTimeout: 25000
  });

  const { detectIntent } = useIntentRecognition();
  
  async function handleVoiceInput(text: string) {
    if (!text.trim() || isProcessingRef.current || !isEnabled) {
      console.log('Ignoring voice input:', { text: text.trim(), isProcessing: isProcessingRef.current, isEnabled });
      return;
    }
    
    console.log('Processing voice input:', text);
    isProcessingRef.current = true;
    setState('processing');
    stopListening(); // Stop listening immediately
    resetTranscript();
    
    // Add user message to history
    addMessage('user', text);
    
    try {
      // Detect intent
      const intent = detectIntent(text);
      let response = '';
      
      if (intent !== 'general') {
        // Handle special intents
        const weatherApiKey = localStorage.getItem('vivica_weather_api_key');
        const newsApiKey = localStorage.getItem('vivica_news_api_key');
        
        if (weatherApiKey || newsApiKey) {
          const handlers = new IntentHandlers(weatherApiKey || '', newsApiKey || '');
          
          switch (intent) {
            case 'weather':
              response = await handlers.handleWeather(text);
              break;
            case 'news':
              response = await handlers.handleNews();
              break;
            case 'traffic':
              response = await handlers.handleTraffic(text);
              break;
            case 'sports':
              response = await handlers.handleSports(text);
              break;
          }
        }
      }
      
      // If no special intent response, use AI
      if (!response) {
        const contextMessages = getContextMessages(8);
        response = await generateResponse(text, contextMessages);
      }
      
      if (response && isEnabled) {
        console.log('AI response received:', response);
        // Add AI response to history
        addMessage('assistant', response);
        
        if (!isMuted) {
          console.log('Speaking AI response');
          speak(response);
          // TTS onEnd callback will handle returning to listening
        } else {
          console.log('Muted mode - returning to listening without speaking');
          isProcessingRef.current = false;
          setState('listening');
          setTimeout(() => {
            startListening();
          }, 500);
        }
      } else {
        console.log('No AI response or disabled, returning to listening');
        isProcessingRef.current = false;
        if (isEnabled) {
          setState('listening');
          setTimeout(() => {
            startListening();
          }, 500);
        } else {
          setState('idle');
        }
      }
    } catch (error) {
      console.error('AI response error:', error);
      toast.error('Failed to generate response');
      isProcessingRef.current = false;
      if (isEnabled) {
        setState('listening');
        setTimeout(() => {
          startListening();
        }, 1000);
      } else {
        setState('idle');
      }
    }
  }

  const toggleVivica = useCallback(async () => {
    if (!isEnabled) {
      // Always request permission explicitly when user activates
      if (hasPermission !== true) {
        console.log('Requesting microphone permission...');
        const granted = await requestMicrophonePermission();
        if (!granted) {
          toast.error('Microphone permission is required for VIVICA to work.');
          return;
        }
      }
      
      console.log('Activating VIVICA');
      isProcessingRef.current = false;
      setState('listening');
      setIsEnabled(true);
      setTimeout(() => {
        startListening();
      }, 500);
      toast.success('VIVICA activated');
    } else {
      console.log('Deactivating VIVICA');
      isProcessingRef.current = false;
      setState('idle');
      setIsEnabled(false);
      forceStop();
      stopSpeaking();
      resetTranscript();
      toast.info('VIVICA deactivated');
    }
  }, [isEnabled, hasPermission, requestMicrophonePermission, startListening, forceStop, stopSpeaking, resetTranscript]);

  const handleSpaceBar = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && e.type === 'keydown') {
      e.preventDefault();
      if (e.shiftKey) {
        setShowSettings(!showSettings);
      } else {
        toggleVivica();
      }
    }
  }, [showSettings, toggleVivica]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Don't handle touch events if settings or history panels are open
    if (showSettings || showHistory) {
      return;
    }
    
    // Check if touch is inside a panel
    const target = e.target as Element;
    if (target.closest('[data-settings-panel]') || target.closest('[data-history-panel]')) {
      return;
    }
    
    if (e.touches.length === 1) {
      const touchDuration = setTimeout(() => {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        setShowSettings(true);
      }, 500);
      
      const cleanup = () => {
        clearTimeout(touchDuration);
        document.removeEventListener('touchend', cleanup);
        document.removeEventListener('touchmove', cleanup);
      };
      
      document.addEventListener('touchend', cleanup);
      document.addEventListener('touchmove', cleanup);
    }
  }, [showSettings, showHistory]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't handle clicks if panels are open
    if (showSettings || showHistory) {
      return;
    }
    
    // Check if click is inside a panel
    const target = e.target as Element;
    if (target.closest('[data-settings-panel]') || target.closest('[data-history-panel]')) {
      return;
    }
    
    if (isSpeaking) {
      console.log('Stopping speech and returning to listening');
      stopSpeaking();
      isProcessingRef.current = false;
      if (isEnabled) {
        setState('listening');
        setTimeout(() => {
          startListening();
        }, 500);
      } else {
        setState('idle');
      }
    } else {
      toggleVivica();
    }
  }, [isSpeaking, showSettings, showHistory, toggleVivica, stopSpeaking, startListening, isEnabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleSpaceBar);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      document.removeEventListener('keydown', handleSpaceBar);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleSpaceBar, handleTouchStart]);

  // Clean up processing state when component unmounts
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, []);

  const getStatusText = () => {
    if (hasPermission === false) {
      return 'Tap to allow microphone access';
    }
    
    switch (state) {
      case 'idle':
        return (
          <span className="block">
            <span className="hidden sm:inline">Space or </span>
            <span>tap to activate</span>
            <span className="hidden sm:inline">, hold for settings</span>
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
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-none">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleClick}
      />
      
      {/* Main Orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <VivicaOrb 
          state={state} 
          audioLevel={isListening ? 0.3 : 0} 
          canvasRef={canvasRef}
        />
      </div>

      {/* VIVICA Title - Responsive sizing */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none px-4 max-w-full">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] text-white/90 drop-shadow-2xl text-center">
          V I V I C A
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

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onOpenHistory={() => {
          setShowSettings(false);
          setShowHistory(true);
        }}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Conversation History Panel */}
      <ConversationHistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onBackToSettings={() => {
          setShowHistory(false);
          setShowSettings(true);
        }}
        messages={messages}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
        onClearHistory={clearHistory}
      />

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
          State: {state}<br/>
          Listening: {isListening ? 'Yes' : 'No'}<br/>
          Speaking: {isSpeaking ? 'Yes' : 'No'}<br/>
          Enabled: {isEnabled ? 'Yes' : 'No'}<br/>
          Processing: {isProcessingRef.current ? 'Yes' : 'No'}<br/>
          Permission: {hasPermission === null ? 'Unknown' : hasPermission ? 'Granted' : 'Denied'}<br/>
          Messages: {messages.length}<br/>
          Transcript: {transcript ? `"${transcript}"` : 'None'}
        </div>
      )}
    </div>
  );
};
