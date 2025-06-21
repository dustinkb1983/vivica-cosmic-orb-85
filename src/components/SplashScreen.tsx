
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
    }, 100);

    // Fade out and complete
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200);

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
        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 relative">
          <img 
            src="/lovable-uploads/c5c74797-b25e-4549-a01a-3dbc359deb30.png" 
            alt="VIVICA Logo" 
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 15px #9048F8) drop-shadow(0 0 30px #E830E8)',
            }}
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.3em] text-white">
          V I V I C A
        </h1>
      </div>
    </div>
  );
};
