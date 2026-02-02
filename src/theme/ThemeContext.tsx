
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from './types';
import { themes, defaultThemeId } from './themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem('app-theme') || defaultThemeId;
  });

  const theme = themes.find(t => t.id === currentThemeId) || themes[0];

  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS Variables
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--primary-foreground', theme.colors.primaryForeground);
    
    // 5-Level Semantic System
    root.style.setProperty('--promotion', theme.colors.promotion);
    root.style.setProperty('--promotion-foreground', theme.colors.promotionForeground);
    root.style.setProperty('--minor', theme.colors.minor);
    root.style.setProperty('--minor-foreground', theme.colors.minorForeground);
    
    // Semantic Accents
    root.style.setProperty('--accent-primary', theme.colors.accentPrimary);
    root.style.setProperty('--accent-secondary', theme.colors.accentSecondary);
    
    // Semantic Card Colors
    root.style.setProperty('--card-primary', theme.colors.cardPrimary);
    root.style.setProperty('--card-dark', theme.colors.cardDark);
    root.style.setProperty('--card-light', theme.colors.cardLight);
    
    // Border Color
    root.style.setProperty('--border-color', theme.colors.borderColor);
    
    // Semantic Borders (fallback to main color or border color if undefined)
    root.style.setProperty('--primary-border', theme.colors.primaryBorder || theme.colors.primary);
    root.style.setProperty('--promotion-border', theme.colors.promotionBorder || theme.colors.promotion);
    root.style.setProperty('--minor-border', theme.colors.minorBorder || theme.colors.minor);

    // Font FamilyLegacy support (mapping semantic to old names if needed, or just keeping them for reference)
    // We map the old variables to the new semantic values to ensure backward compatibility
    root.style.setProperty('--accent-blue', theme.colors.accentPrimary);
    root.style.setProperty('--accent-orange', theme.colors.accentSecondary);
    
    // Optional extra colors
    if (theme.colors.accentPurple) {
      root.style.setProperty('--accent-purple', theme.colors.accentPurple);
    } else {
      root.style.removeProperty('--accent-purple');
    }
    
    if (theme.colors.accentGreen) {
      root.style.setProperty('--accent-green', theme.colors.accentGreen);
    } else {
      root.style.removeProperty('--accent-green');
    }

    // Set Font Family
    root.style.setProperty('--font-sans', theme.fontFamily);
    document.body.style.fontFamily = theme.fontFamily;

    // Save to local storage
    localStorage.setItem('app-theme', currentThemeId);
  }, [theme, currentThemeId]);

  const setTheme = (themeId: string) => {
    if (themes.some(t => t.id === themeId)) {
      setCurrentThemeId(themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
