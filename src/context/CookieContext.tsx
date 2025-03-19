import React, { createContext, useContext, useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  showBanner: boolean;
  updatePreferences: (newPreferences: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  hideBanner: () => void;
  showPreferences: () => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true as these are essential
  analytics: false,
  marketing: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem('cookiePreferences');
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences));
      setShowBanner(false);
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  };

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
      necessary: true, // Always keep necessary cookies enabled
    };
    savePreferences(updatedPreferences);
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const allRejected = {
      necessary: true, // Keep necessary
      analytics: false,
      marketing: false,
    };
    savePreferences(allRejected);
    setShowBanner(false);
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  const showPreferences = () => {
    setShowBanner(true);
  };

  return (
    <CookieContext.Provider
      value={{
        preferences,
        showBanner,
        updatePreferences,
        acceptAll,
        rejectAll,
        hideBanner,
        showPreferences,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
}
