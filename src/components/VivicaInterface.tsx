
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Settings, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from './SettingsPanel';
import { VivicaOrb } from './VivicaOrb';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { toast } from 'sonner';

type VivicaState = 'idle' | 'listening' | 'processing' | 'speaking';

export const VivicaInterface = () => {
  const [state, setState] = useState<VivicaState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { generateResponse } = useOpenRouter();
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
    
    try {
      const response = await generateResponse(text);
      if (response && !isMuted) {
        speak(response);
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
    } else if (!showSettings) {
      toggleVivica();
    }
  }, [isSpeaking, showSettings, toggleVivica, stopSpeaking, startListening]);

  useEffect(() => {
    document.addEventListener('keydown', handleSpaceBar);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      document.removeEventListener('keydown', handleSpaceBar);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleSpaceBar, handleTouchStart]);

  // Auto-hide settings on mobile after interaction
  useEffect(() => {
    if (showSettings && window.innerWidth <= 768) {
      const timer = setTimeout(() => setShowSettings(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSettings]);

  return (
    <div className="fixed inset-0 bg-gradient-radial from-purple-900/20 via-purple-950/40 to-black overflow-hidden select-none touch-none">
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

      {/* VIVICA Title */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-bold tracking-[0.3em] text-white/90 drop-shadow-2xl">
          V I V I C A
        </h1>
        <div className="text-center text-white/60 mt-2 text-sm md:text-base">
          {state === 'idle' && 'Press space or tap to activate'}
          {state === 'listening' && 'Listening...'}
          {state === 'processing' && 'Processing...'}
          {state === 'speaking' && 'Speaking...'}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={`backdrop-blur-md border-white/20 text-white ${
            isEnabled 
              ? 'bg-green-500/20 hover:bg-green-500/30' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
          onClick={toggleVivica}
        >
          {isEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
          State: {state}<br/>
          Listening: {isListening ? 'Yes' : 'No'}<br/>
          Speaking: {isSpeaking ? 'Yes' : 'No'}<br/>
          Enabled: {isEnabled ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};
