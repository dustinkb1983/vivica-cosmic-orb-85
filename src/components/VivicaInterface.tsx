
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from './SettingsPanel';
import { ConversationHistoryPanel } from './ConversationHistoryPanel';
import { VivicaOrb } from './VivicaOrb';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { toast } from 'sonner';

type VivicaState = 'idle' | 'listening' | 'processing' | 'speaking';

export const VivicaInterface = () => {
  const [state, setState] = useState<VivicaState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    onStart: () => setState('speaking'),
    onEnd: () => {
      setState('listening');
      startListening();
    }
  });
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useVoiceRecognition({
    onResult: handleVoiceInput,
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setState('idle');
    }
  });

  async function handleVoiceInput(text: string) {
    if (!text.trim()) return;
    
    console.log('Voice input received:', text);
    setState('processing');
    stopListening();
    
    // Add user message to history
    addMessage('user', text);
    
    try {
      // Get conversation context for AI
      const contextMessages = getContextMessages(8); // Last 8 messages for context
      
      const response = await generateResponse(text, contextMessages);
      if (response) {
        // Add AI response to history
        addMessage('assistant', response);
        
        if (!isMuted) {
          speak(response);
        } else {
          setState('listening');
          startListening();
        }
      } else {
        setState('listening');
        startListening();
      }
    } catch (error) {
      console.error('AI response error:', error);
      toast.error('Failed to generate response');
      setState('listening');
      startListening();
    }
  }

  const toggleVivica = useCallback(() => {
    if (!isEnabled) {
      setState('listening');
      setIsEnabled(true);
      startListening();
      toast.success('VIVICA activated');
    } else {
      setState('idle');
      setIsEnabled(false);
      stopListening();
      stopSpeaking();
      toast.info('VIVICA deactivated');
    }
  }, [isEnabled, startListening, stopListening, stopSpeaking]);

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
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isSpeaking) {
      stopSpeaking();
      setState('listening');
      startListening();
    } else if (!showSettings && !showHistory) {
      toggleVivica();
    }
  }, [isSpeaking, showSettings, showHistory, toggleVivica, stopSpeaking, startListening]);

  useEffect(() => {
    document.addEventListener('keydown', handleSpaceBar);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      document.removeEventListener('keydown', handleSpaceBar);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleSpaceBar, handleTouchStart]);

  // Auto-hide panels on mobile after interaction
  useEffect(() => {
    if ((showSettings || showHistory) && window.innerWidth <= 768) {
      const timer = setTimeout(() => {
        setShowSettings(false);
        setShowHistory(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSettings, showHistory]);

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
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] text-white/90 drop-shadow-2xl text-center whitespace-nowrap">
          V I V I C A
        </h1>
        <div className="text-center text-white/60 mt-2 text-xs sm:text-sm">
          {state === 'idle' && (
            <span className="block">
              <span className="hidden sm:inline">Press space or </span>
              <span>Tap to activate</span>
              <span className="hidden sm:inline">, hold for settings</span>
            </span>
          )}
          {state === 'listening' && 'Listening...'}
          {state === 'processing' && 'Processing...'}
          {state === 'speaking' && 'Speaking...'}
        </div>
      </div>

      {/* Minimal Settings Button - Only visible when not active */}
      {!isEnabled && (
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-900/30 backdrop-blur-md border-gray-700/30 hover:bg-gray-800/50 text-white/70 hover:text-white"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      )}

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
          Messages: {messages.length}
        </div>
      )}
    </div>
  );
};
