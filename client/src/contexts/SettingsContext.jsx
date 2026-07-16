import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SETTINGS_KEY = "anicove_settings";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { includeAdult: false };
    } catch {
      return { includeAdult: false };
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleAdultContent = useCallback(() => {
    setSettings((prev) => ({ ...prev, includeAdult: !prev.includeAdult }));
  }, []);

  const setAdultContent = useCallback((value) => {
    setSettings((prev) => ({ ...prev, includeAdult: !!value }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        includeAdult: settings.includeAdult,
        toggleAdultContent,
        setAdultContent,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
