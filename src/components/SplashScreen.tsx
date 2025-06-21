
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    // Fade out and complete
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div 
        className={`text-center transition-all duration-1000 ease-in-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8 relative">
          <img 
            src="/lovable-uploads/c5c74797-b25e-4549-a01a-3dbc359deb30.png" 
            alt="VIVICA Logo" 
            className="w-full h-full object-contain animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 20px #9048F8) drop-shadow(0 0 40px #E830E8)',
            }}
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.3em] text-white mb-2">
          V I V I C A
        </h1>
        <p className="text-purple-300 text-sm sm:text-base">AI Voice Assistant</p>
      </div>
    </div>
  );
};
