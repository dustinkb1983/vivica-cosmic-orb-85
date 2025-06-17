
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, initializePWAPrompt } from './lib/pwa'

// Register service worker for PWA functionality
registerServiceWorker();

// Initialize PWA install prompt
initializePWAPrompt();

// Prevent zooming on mobile
document.addEventListener('touchmove', (e) => {
  // Check if this is a pinch gesture by looking at the touches
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

createRoot(document.getElementById("root")!).render(<App />);
