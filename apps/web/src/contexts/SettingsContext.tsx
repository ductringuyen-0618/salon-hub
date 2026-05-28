import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/services/api';

export interface DayHours {
  open: string;   // "09:00"
  close: string;  // "19:00"
  closed: boolean;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  businessHours: Record<string, DayHours>; // monday..sunday lowercase
  turnoverMinutes: number;
  themePrimary: string;
  themeAccent: string;
  logoUrl: string | null;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'SalonHub',
  tagline: null,
  contactPhone: null,
  contactEmail: null,
  contactAddress: null,
  businessHours: {},
  turnoverMinutes: 5,
  themePrimary: '#d34000',
  themeAccent: '#7c3aed',
  logoUrl: null,
};

interface SettingsContextType {
  settings: BusinessSettings;
  loading: boolean;
  /** Re-fetches /api/settings — call after admin saves changes so the UI
   *  reflects them without a hard reload. */
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};

/**
 * Loads /api/settings on mount and applies the theme colors to CSS
 * variables so Tailwind's `dynamic-primary` / `dynamic-accent` classes
 * pick them up. Re-applies on every reload().
 */
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const applyTheme = (s: BusinessSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (s.themePrimary) root.style.setProperty('--color-primary', s.themePrimary);
    if (s.themeAccent) root.style.setProperty('--color-accent', s.themeAccent);
    // Update <title> with business name so browser tab reflects it.
    if (s.businessName) document.title = s.businessName;
  };

  const load = async () => {
    try {
      const data = await apiService.getSettings();
      // Normalize: server returns nulls; merge with defaults so consumers
      // can always read .businessName etc. without null-checking.
      const merged: BusinessSettings = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      applyTheme(merged);
    } catch (err) {
      console.warn('[settings] failed to load, using defaults', err);
      applyTheme(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, reload: load }}>
      {children}
    </SettingsContext.Provider>
  );
};
