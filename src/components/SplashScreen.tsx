
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
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

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
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-pulse shadow-2xl shadow-blue-500/50"></div>
        <h1 className="text-6xl font-bold tracking-[0.3em] text-white">
          V I V I C A
        </h1>
        <p className="text-gray-400 mt-4 text-lg">AI Voice Assistant</p>
      </div>
    </div>
  );
};
