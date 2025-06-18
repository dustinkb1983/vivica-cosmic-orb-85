
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, initializePWAPrompt } from './lib/pwa'

// Wait for DOM to be ready
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

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

  // Create React root and render app
  const root = createRoot(rootElement);
  root.render(<App />);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
