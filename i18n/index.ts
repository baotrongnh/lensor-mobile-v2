import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import vi from './locales/vi.json';
import jp from './locales/jp.json';

const LANGUAGE_STORAGE_KEY = '@lensor_language';

const resources = {
     en: { translation: en },
     vi: { translation: vi },
     jp: { translation: jp },
};

// Get device language
const getDeviceLanguage = (): string => {
     const locale = Localization.getLocales()[0];
     const languageCode = locale.languageCode;

     if (languageCode === 'vi') return 'vi';
     if (languageCode === 'ja' || languageCode === 'jp') return 'jp';
     return 'en';
};

// Initialize i18n
const initI18n = async () => {
     let savedLanguage = 'en';

     try {
          const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
          savedLanguage = stored || getDeviceLanguage();
     } catch (error) {
          console.error('Failed to load language:', error);
          savedLanguage = getDeviceLanguage();
     }

     i18n
          .use(initReactI18next)
          .init({
               resources,
               lng: savedLanguage,
               fallbackLng: 'en',
               interpolation: {
                    escapeValue: false,
               },
          });
};

initI18n();

// Save language when it changes
i18n.on('languageChanged', async (lng) => {
     try {
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
     } catch (error) {
          console.error('Failed to save language:', error);
     }
});

export default i18n;
