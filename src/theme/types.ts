
export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string; // Text color on primary background
  
  // 5-Level Semantic System
  // 1. Promotion (Version highlight features) - Standout color
  promotion: string;
  promotionForeground: string;
  
  // 2. Important (Key product features) - Equivalent to Primary
  // We use 'primary' for this, but can alias if needed.
  
  // 3. Normal (Standard features) - Black/White/Gray
  // We use standard background/foreground/border for this.
  
  // 4. Minor (Niche features) - Independent but subtle
  minor: string;
  minorForeground: string;

  // Semantic Accents (Legacy support or specific UI elements)
  accentPrimary: string;   // Main action/brand color
  accentSecondary: string; // Secondary highlight
  
  // New Semantic Slots for UI Elements
  cardPrimary: string;     // For primary/featured cards (e.g., Inspiration)
  cardDark: string;        // For dark-themed cards (e.g., Banking)
  cardLight: string;       // For light/secondary cards (e.g., Playground)
  
  // Border Color for Cards/Elements
  borderColor: string;

  // Semantic Border Colors
  primaryBorder?: string;
  promotionBorder?: string;
  minorBorder?: string;

  // Optional extras
  accentPurple?: string;
  accentGreen?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  fontFamily: string;
}
