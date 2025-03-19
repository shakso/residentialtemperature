import { useEffect, useState } from 'react';

declare global {
  interface Window {
    [key: string]: any;
    google?: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SCRIPT_ID = 'google-maps-script';
const CALLBACK_NAME = '__googleMapsCallback';
const SCRIPT_SRC = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${CALLBACK_NAME}`;

export function useGoogleMapsScript() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Early return if Maps is already loaded
    if (typeof window.google !== 'undefined' && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Return if script is already loading
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const existingCallback = window[CALLBACK_NAME];
      window[CALLBACK_NAME] = () => {
        if (existingCallback) existingCallback();
        setIsLoaded(true);
      };
      return;
    }

    // Set up callback
    window[CALLBACK_NAME] = () => {
      setIsLoaded(true);
    };

    // Create and append script
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed as script should persist
    };
  }, []);

  return { isLoaded, error };
}
