
import { useState, useCallback, useRef, useEffect } from 'react';

export const useWakeLock = () => {
  const [isActive, setIsActive] = useState(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const isSupported = 'wakeLock' in navigator;

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) {
      console.log('Wake Lock API not supported');
      return false;
    }

    try {
      // Only request if we don't already have one
      if (!wakeLock.current) {
        wakeLock.current = await navigator.wakeLock.request('screen');
        setIsActive(true);
        console.log('Wake lock acquired');

        // Listen for release
        wakeLock.current.addEventListener('release', () => {
          console.log('Wake lock was released');
          setIsActive(false);
          wakeLock.current = null;
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock.current) {
      try {
        await wakeLock.current.release();
        wakeLock.current = null;
        setIsActive(false);
        console.log('Wake lock released manually');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  }, []);

  // Auto-reacquire wake lock when page becomes visible again
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && isActive && !wakeLock.current) {
      console.log('Page became visible, reacquiring wake lock');
      requestWakeLock();
    }
  }, [isActive, requestWakeLock]);

  // Set up visibility change listener
  useEffect(() => {
    if (isSupported) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [handleVisibilityChange, isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock
  };
};
