
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available
                  console.log('New content is available; please refresh.');
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const requestFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  }
};

export const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// PWA Install Prompt
let deferredPrompt: any;

export const initializePWAPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or toast
    showInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
};

export const showInstallPrompt = () => {
  // Create a simple toast-like notification
  const installBanner = document.createElement('div');
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(79, 70, 229, 0.95);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: opacity 0.3s ease;
    ">
      📱 Install VIVICA as an app for the best experience
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (installBanner.parentNode) {
      installBanner.style.opacity = '0';
      setTimeout(() => {
        if (installBanner.parentNode) {
          installBanner.parentNode.removeChild(installBanner);
        }
      }, 300);
    }
  }, 5000);
  
  // Handle click to install
  installBanner.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    }
    
    // Remove banner
    if (installBanner.parentNode) {
      installBanner.parentNode.removeChild(installBanner);
    }
  });
};

export const canInstallPWA = () => {
  return deferredPrompt !== null;
};

export const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
};
