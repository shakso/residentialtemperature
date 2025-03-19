import { useEffect, useRef } from 'react';

interface UseGoogleMapsProps {
  step: number;
  autocompleteInputRef: React.RefObject<HTMLInputElement>;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}

export function useGoogleMaps({ step, autocompleteInputRef, onPlaceSelect }: UseGoogleMapsProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (step !== 2) return; // Only load when on address step
    
    // Load Google Maps API script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
      return () => {
        // Clean up script if component unmounts before script loads
        document.head.removeChild(script);
      };
    } else {
      // If Google Maps API is already loaded, initialize autocomplete
      initAutocomplete();
    }
  }, [step]);

  const initAutocomplete = () => {
    if (!autocompleteInputRef.current || !window.google) return;
    
    // Destroy previous instance if it exists
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }
    
    // Create new autocomplete instance
    autocompleteRef.current = new google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      {
        componentRestrictions: { country: 'gb' },
        fields: ['address_components', 'formatted_address'],
        types: ['address']
      }
    );
    
    // Add place_changed event listener
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;
    
    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.address_components || place.address_components.length === 0) {
      console.error('No address components found');
      return;
    }
    
    onPlaceSelect(place);
  };

  return {
    initAutocomplete
  };
}
