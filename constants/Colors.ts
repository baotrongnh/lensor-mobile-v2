export const Colors = {
     light: {
          // Main brand color
          primary: '#8c4aea',
          primaryForeground: '#f7f3fc',

          // Background colors
          background: '#ffffff',
          foreground: '#24292e',

          // Card colors
          card: '#ffffff',
          cardForeground: '#24292e',

          // Secondary colors
          secondary: '#f7f7f8',
          secondaryForeground: '#24292e',

          // Muted colors
          muted: '#f7f7f8',
          mutedForeground: '#6e7681',

          // Accent colors
          accent: '#f7f7f8',
          accentForeground: '#24292e',

          // Border and input
          border: '#d0d7de',
          input: '#d0d7de',
          ring: '#8c4aea',

          // Text colors
          text: '#24292e',
          textMuted: '#6e7681',
          textTitle: '#24292e',

          // Destructive
          destructive: '#cf222e',
          destructiveForeground: '#ffffff',

          // Success, warning, info
          success: '#1a7f37',
          warning: '#bf8700',
          info: '#0969da',
     },

     dark: {
          // Main brand color
          primary: '#9d5eff',
          primaryForeground: '#f7f3fc',

          // Background colors
          background: '#0d1117',
          foreground: '#e6edf3',

          // Card colors
          card: '#161b22',
          cardForeground: '#e6edf3',

          // Secondary colors
          secondary: '#21262d',
          secondaryForeground: '#e6edf3',

          // Muted colors
          muted: '#21262d',
          mutedForeground: '#7d8590',

          // Accent colors
          accent: '#21262d',
          accentForeground: '#e6edf3',

          // Border and input
          border: 'rgba(255, 255, 255, 0.1)',
          input: 'rgba(255, 255, 255, 0.15)',
          ring: '#9d5eff',

          // Text colors
          text: '#e6edf3',
          textMuted: '#7d8590',
          textTitle: '#e6edf3',

          // Destructive
          destructive: '#f85149',
          destructiveForeground: '#ffffff',

          // Success, warning, info
          success: '#3fb950',
          warning: '#d29922',
          info: '#58a6ff',
     },
};

// Spacing system
export const Spacing = {
     xs: 4,
     sm: 8,
     md: 16,
     lg: 24,
     xl: 32,
     xxl: 48,
};

// Border radius
export const BorderRadius = {
     sm: 8,
     md: 12,
     lg: 16,
     xl: 20,
     full: 9999,
};

// Font sizes
export const FontSizes = {
     xs: 12,
     sm: 14,
     md: 16,
     lg: 18,
     xl: 20,
     xxl: 24,
     xxxl: 32,
};

// Font weights
export const FontWeights = {
     regular: '400' as const,
     medium: '500' as const,
     semibold: '600' as const,
     bold: '700' as const,
};
