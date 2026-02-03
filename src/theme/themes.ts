
import { Theme } from './types';

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper to lighten color (mix with white)
// factor: 0 to 1 (1 is fully white)
function lighten(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Base Themes (Modified Lovart)
const baseThemes: Theme[] = [
  {
    id: 'lovart-default',
    name: 'Lovart Style',
    description: 'Minimalist, Swiss-style, High Contrast',
    colors: {
      background: '#F9FAFB',
      foreground: '#000000',
      primary: '#2E5BFF',     // Blue (Swapped)
      primaryForeground: '#FFFFFF',
      
      promotion: '#FF5C00',   // Orange
      promotionForeground: '#FFFFFF',
      minor: '#000000',       // Black (Swapped)
      minorForeground: '#FFFFFF',
      
      accentPrimary: '#2E5BFF', 
      accentPromotion: '#FF5C00',
      accentMinor: '#000000',
      
      cardPrimary: '#2E5BFF',
      cardDark: '#000000',    // Black for Minor
      cardLight: '#F5F5F7',
      
      borderColor: 'rgba(0,0,0,0.05)', // Default subtle border
    },
    fontFamily: '"Inter", sans-serif',
  },
  {
    id: 'nunito-vibrant',
    name: 'Nunito Vibrant',
    description: 'Playful, Rounded, Gradient-friendly',
    colors: {
      background: '#F0F4F8',
      foreground: '#1A1A2E',
      primary: '#446DF6',    // Bright Blue
      primaryForeground: '#FFFFFF',
      
      promotion: '#8F7AFB',         // Purple
      promotionForeground: '#FFFFFF',
      minor: '#4ADE80',             // Mint Green
      minorForeground: '#000000',
      
      accentPrimary: '#446DF6',
      accentPromotion: '#8F7AFB',
      accentMinor: '#4ADE80',
      accentSecondary: '#4ADE80',
      
      cardPrimary: '#446DF6',
      cardDark: '#2D2D44',
      cardLight: '#FFFFFF',
      
      accentPurple: '#8F7AFB',
      accentGreen: '#4ADE80',
      borderColor: 'rgba(0,0,0,0.05)',
    },
    fontFamily: '"Nunito", sans-serif',
  },
  {
    id: 'rotation-geometric',
    name: 'Rotation Geometric',
    description: 'Bauhaus-inspired, Bold, Structural',
    colors: {
      background: '#F3F4F6',
      foreground: '#111827',
      primary: '#3B82F6',     // Blue
      primaryForeground: '#FFFFFF',
      
      promotion: '#F59E0B',         // Mustard Yellow
      promotionForeground: '#000000',
      minor: '#111827',             // Dark Gray/Black
      minorForeground: '#FFFFFF',
      
      accentPrimary: '#3B82F6',
      accentPromotion: '#F59E0B',
      accentMinor: '#111827',
      accentSecondary: '#F59E0B',
      
      cardPrimary: '#3B82F6',
      cardDark: '#111827',
      cardLight: '#FFFFFF',
      
      accentPurple: '#8B5CF6',
      accentGreen: '#10B981',
      borderColor: 'rgba(0,0,0,0.05)',
    },
    fontFamily: '"Inter", sans-serif',
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Dreamy, Gradient, Soft UI',
    colors: {
      background: '#FDFDFD',
      foreground: '#6353AC',  // Deep Purple Text
      primary: '#9F9DF3',     // Periwinkle
      primaryForeground: '#FFFFFF',
      
      promotion: '#FF9BB3',         // Pink
      promotionForeground: '#FFFFFF',
      minor: '#6353AC',             // Deep Purple
      minorForeground: '#FFFFFF',
      
      accentPrimary: '#9F9DF3',
      accentPromotion: '#FF9BB3',
      accentMinor: '#6353AC',
      
      cardPrimary: '#9F9DF3',
      cardDark: '#6353AC',
      cardLight: '#FFFFFF',
      
      accentGreen: '#C9EBCA',
      borderColor: 'rgba(0,0,0,0.05)',
    },
    fontFamily: '"Nunito", sans-serif',
  }
];

// Generate Variants
export const themes: Theme[] = [];

baseThemes.forEach(theme => {
  // 1. Original
  themes.push({
    ...theme,
    colors: {
      ...theme.colors,
      // Explicitly set semantic borders to main colors if not defined
      primaryBorder: theme.colors.primary,
      promotionBorder: theme.colors.promotion,
      minorBorder: theme.colors.minor,
    }
  });

  // 2. Glass Variant (-glass)
  // Transparent backgrounds + Blur (handled by CSS)
  themes.push({
    ...theme,
    id: `${theme.id}-glass`,
    name: `${theme.name} (Glass)`,
    description: `${theme.description} - Frosted Glass Effect`,
    colors: {
      ...theme.colors,
      primary: hexToRgba(theme.colors.primary, 0.7),
      promotion: hexToRgba(theme.colors.promotion, 0.7),
      minor: hexToRgba(theme.colors.minor, 0.7),
      cardPrimary: hexToRgba(theme.colors.cardPrimary, 0.7),
      cardDark: hexToRgba(theme.colors.cardDark, 0.7),
      // Glass border
      borderColor: 'rgba(255,255,255,0.3)',
      primaryBorder: hexToRgba(theme.colors.primary, 0.5),
      promotionBorder: hexToRgba(theme.colors.promotion, 0.5),
      minorBorder: hexToRgba(theme.colors.minor, 0.5),
    }
  });

  // 3. Outlined Variant (-outlined)
  // Light Background + Solid Border
  const lightenFactor = 0.9; // 90% white mix
  themes.push({
    ...theme,
    id: `${theme.id}-outlined`,
    name: `${theme.name} (Outlined)`,
    description: `${theme.description} - Light Bg & Solid Edge`,
    colors: {
      ...theme.colors,
      // Backgrounds become light
      primary: lighten(theme.colors.primary, lightenFactor),
      primaryForeground: '#333333', // Dark Gray for readability
      
      promotion: lighten(theme.colors.promotion, lightenFactor),
      promotionForeground: '#333333',
      
      minor: lighten(theme.colors.minor, lightenFactor),
      minorForeground: '#333333',
      
      cardPrimary: lighten(theme.colors.cardPrimary, lightenFactor),
      cardDark: lighten(theme.colors.cardDark, lightenFactor),
      
      // Border becomes the original bold color
      primaryBorder: theme.colors.primary,
      promotionBorder: theme.colors.promotion,
      minorBorder: theme.colors.minor,

      // Global border (for normal cards) - Neutral/Subtle
      borderColor: 'rgba(0,0,0,0.1)', 
    }
  });
});

export const defaultThemeId = 'lovart-default';
