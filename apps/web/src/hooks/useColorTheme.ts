import { useState, useEffect } from 'react';

export interface ColorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'salon-brand',
    name: 'Salon Brand',
    colors: {
      primary: '#d34000',
      primaryHover: '#b8380a',
      secondary: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      accent: '#f59e0b',
    },
  },
  {
    id: 'rose-stone',
    name: 'Pastel Rose',
    colors: {
      primary: '#f8a5c2',
      primaryHover: '#f48fb1',
      secondary: '#d4b5a0',
      background: '#fef7f7',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#718096',
      border: '#f1e8e8',
      accent: '#fbb6ce',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Pastel Ocean',
    colors: {
      primary: '#a8d8ea',
      primaryHover: '#7cc7e8',
      secondary: '#b8c5d1',
      background: '#f0f8ff',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#718096',
      border: '#e8f4f8',
      accent: '#b3e5fc',
    },
  },
  {
    id: 'forest-green',
    name: 'Pastel Sage',
    colors: {
      primary: '#a8d5ba',
      primaryHover: '#8fbc8f',
      secondary: '#b8c5d1',
      background: '#f0f8f0',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#718096',
      border: '#e8f5e8',
      accent: '#c8e6c9',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Pastel Peach',
    colors: {
      primary: '#ffb3a7',
      primaryHover: '#ff9a85',
      secondary: '#d4b5a0',
      background: '#fff8f5',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#718096',
      border: '#f5e8e0',
      accent: '#ffcc9c',
    },
  },
  {
    id: 'purple-luxury',
    name: 'Pastel Lavender',
    colors: {
      primary: '#c8a8e9',
      primaryHover: '#b794d4',
      secondary: '#b8c5d1',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#718096',
      border: '#f0e8f5',
      accent: '#dcc7f0',
    },
  },
  {
    id: 'warm-beige',
    name: 'Pastel Cream',
    colors: {
      primary: '#e6d3a3',
      primaryHover: '#d4c190',
      secondary: '#c9b99b',
      background: '#fefcf8',
      surface: '#ffffff',
      text: '#4a4037',
      textSecondary: '#8b7d6b',
      border: '#f2ede5',
      accent: '#f0e4c1',
    },
  },
];

// Admin-only theme management
const ADMIN_THEME_KEY = 'admin-selected-theme';
const THEME_LOCK_KEY = 'theme-locked-by-admin';

export const useColorTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(colorThemes[0]);

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement;

    // Apply CSS custom properties for dynamic classes
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Also apply Tailwind CSS variables for UI components
    // Convert hex to HSL for Tailwind CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Set Tailwind CSS variables
    root.style.setProperty('--primary', hexToHsl(theme.colors.primary));
    root.style.setProperty('--background', hexToHsl(theme.colors.background));
    root.style.setProperty('--foreground', hexToHsl(theme.colors.text));

    setCurrentTheme(theme);
  };

  const changeTheme = (themeId: string, isAdmin: boolean = false) => {
    const theme = colorThemes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);

      if (isAdmin) {
        // Admin is setting the theme for the entire application
        localStorage.setItem(ADMIN_THEME_KEY, theme.id);
        localStorage.setItem(THEME_LOCK_KEY, 'true');
      }
    }
  };

  const resetThemeToAdmin = () => {
    const adminThemeId = localStorage.getItem(ADMIN_THEME_KEY);
    const isLocked = localStorage.getItem(THEME_LOCK_KEY) === 'true';

    if (isLocked && adminThemeId) {
      const adminTheme = colorThemes.find(t => t.id === adminThemeId);
      if (adminTheme) {
        applyTheme(adminTheme);
        return adminTheme;
      }
    }
    return null;
  };

  const unlockTheme = () => {
    localStorage.removeItem(THEME_LOCK_KEY);
  };

  const isThemeLocked = () => {
    return localStorage.getItem(THEME_LOCK_KEY) === 'true';
  };

  const getAdminTheme = () => {
    const adminThemeId = localStorage.getItem(ADMIN_THEME_KEY);
    return adminThemeId ? colorThemes.find(t => t.id === adminThemeId) : null;
  };

  useEffect(() => {
    // Check if admin has set a theme
    const adminTheme = resetThemeToAdmin();

    if (!adminTheme) {
      // Fall back to default theme
      applyTheme(colorThemes[0]);
    }
  }, []);

  return {
    currentTheme,
    availableThemes: colorThemes,
    changeTheme,
    applyTheme,
    resetThemeToAdmin,
    unlockTheme,
    isThemeLocked,
    getAdminTheme,
  };
};
