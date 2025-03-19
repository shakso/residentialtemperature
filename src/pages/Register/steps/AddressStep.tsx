import React, { useRef, useEffect, useState } from 'react';
import { FormState } from '../data';
import { useGoogleMapsScript } from '../../../hooks/useGoogleMapsScript';

interface AddressStepProps {
  formState: FormState;
  setFormValue: (key: keyof FormState, value: any) => void;
  validationErrors: {[key: string]: string};
}

const AddressStep: React.FC<AddressStepProps> = ({ 
  formState, 
  setFormValue, 
  validationErrors 
}) => {
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, error: mapsError } = useGoogleMapsScript();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      initAutocomplete();
    }
  }, [isLoaded]);

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
    
    // Extract address components
    let streetNumber = '';
    let route = '';
    let subpremise = '';
    let locality = '';
    let postalCode = '';
    
    for (const component of place.address_components) {
      const componentType = component.types[0];
      
      switch (componentType) {
        case 'street_number':
          streetNumber = component.long_name;
          break;
        case 'subpremise':
          subpremise = component.long_name;
          break;
        case 'route':
          route = component.long_name;
          break;
        case 'postal_town':
        case 'locality':
          locality = component.long_name;
          break;
        case 'postal_code':
          postalCode = component.long_name;
          break;
      }
    }
    
    // Update form fields
    const address1 = subpremise 
      ? `${subpremise}, ${streetNumber} ${route}`
      : streetNumber 
        ? `${streetNumber} ${route}` 
        : route;
    
    setFormValue('address1', address1);
    setFormValue('city', locality);
    setFormValue('postcode', postalCode);
    
    // Clear the autocomplete input and set it to the formatted address
    if (place.formatted_address && autocompleteInputRef.current) {
      setFormValue('addressQuery', place.formatted_address);
    }
  };

  return (
    <>
      <div className="mb-4">
        {mapsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            Failed to load address lookup. Please enter address manually.
          </div>
        )}
        <label htmlFor="address-autocomplete" className="block text-sm font-medium text-gray-700">
          Search for your address*
        </label>
        <div className="mt-1">
          <input
            id="address-autocomplete"
            ref={autocompleteInputRef}
            type="text"
            value={formState.addressQuery}
            onChange={(e) => setFormValue('addressQuery', e.target.value)}
            placeholder="Start typing your address..."
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-gray-500">
            Type your address or postcode and select from the dropdown
          </p>
        </div>
      </div>
      
      <div>
        <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
          Address Line 1*
        </label>
        <div className="mt-1">
          <input
            id="address1"
            name="address1"
            type="text"
            required
            value={formState.address1}
            onChange={(e) => setFormValue('address1', e.target.value)}
            className={`appearance-none block w-full px-3 py-2 border ${validationErrors.address1 ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {validationErrors.address1 && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.address1}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
          Address Line 2 (Optional)
        </label>
        <div className="mt-1">
          <input
            id="address2"
            name="address2"
            type="text"
            value={formState.address2}
            onChange={(e) => setFormValue('address2', e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City*
          </label>
          <div className="mt-1">
            <input
              id="city"
              name="city"
              type="text"
              required
              value={formState.city}
              onChange={(e) => setFormValue('city', e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border ${validationErrors.city ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.city && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
            Postcode*
          </label>
          <div className="mt-1">
            <input
              id="postcode"
              name="postcode"
              type="text"
              required
              value={formState.postcode}
              onChange={(e) => setFormValue('postcode', e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border ${validationErrors.postcode ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.postcode && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.postcode}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressStep;
