
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
        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-pulse shadow-2xl shadow-blue-500/50"></div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.3em] text-white mb-2">
          V I V I C A
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">AI Voice Assistant</p>
      </div>
    </div>
  );
};
