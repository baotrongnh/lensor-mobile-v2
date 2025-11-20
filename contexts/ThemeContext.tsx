import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

type ThemeMode = 'light' | 'dark' | 'auto';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
     theme: ThemeMode;
     colorScheme: ColorScheme;
     colors: typeof Colors.light;
     setTheme: (theme: ThemeMode) => void;
     toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@lensor_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
     const deviceColorScheme = useDeviceColorScheme() ?? 'light';
     const [theme, setThemeState] = useState<ThemeMode>('auto');

     // Determine actual color scheme based on theme mode
     const colorScheme: ColorScheme = theme === 'auto' ? deviceColorScheme : theme;
     const colors = Colors[colorScheme];

     // Load theme from storage on mount
     useEffect(() => {
          loadTheme();
     }, []);

     // Save theme to storage whenever it changes
     useEffect(() => {
          saveTheme(theme);
     }, [theme]);

     const loadTheme = async () => {
          try {
               const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
               if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
                    setThemeState(savedTheme as ThemeMode);
               }
          } catch (error) {
               console.error('Failed to load theme:', error);
          }
     };

     const saveTheme = async (newTheme: ThemeMode) => {
          try {
               await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
          } catch (error) {
               console.error('Failed to save theme:', error);
          }
     };

     const setTheme = (newTheme: ThemeMode) => {
          setThemeState(newTheme);
     };

     const toggleTheme = () => {
          setThemeState(current => {
               if (current === 'auto') return 'light';
               if (current === 'light') return 'dark';
               return 'auto';
          });
     };

     return (
          <ThemeContext.Provider value={{ theme, colorScheme, colors, setTheme, toggleTheme }}>
               {children}
          </ThemeContext.Provider>
     );
};

export const useTheme = () => {
     const context = useContext(ThemeContext);
     if (!context) {
          throw new Error('useTheme must be used within ThemeProvider');
     }
     return context;
};
