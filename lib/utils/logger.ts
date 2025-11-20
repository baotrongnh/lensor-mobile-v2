/**
 * Production-safe logger utility
 * Logs are only shown in development mode
 */

const isDev = __DEV__;

export const logger = {
     log: (...args: any[]) => {
          if (isDev) console.log(...args);
     },
     warn: (...args: any[]) => {
          if (isDev) console.warn(...args);
     },
     error: (...args: any[]) => {
          // Always log errors even in production
          console.error(...args);
     },
     debug: (...args: any[]) => {
          if (isDev) console.debug(...args);
     },
     info: (...args: any[]) => {
          if (isDev) console.info(...args);
     },
};

/**
 * Format API response for logging
 */
export const logAPIResponse = (endpoint: string, response: any) => {
     if (!isDev) return;
     console.log('═══════════════════════════════════════════════════');
     console.log(`📥 API Response: ${endpoint}`);
     console.log('═══════════════════════════════════════════════════');
     console.log(JSON.stringify(response, null, 2));
     console.log('═══════════════════════════════════════════════════');
};

/**
 * Format API request for logging
 */
export const logAPIRequest = (endpoint: string, data?: any) => {
     if (!isDev) return;
     console.log('═══════════════════════════════════════════════════');
     console.log(`📤 API Request: ${endpoint}`);
     console.log('═══════════════════════════════════════════════════');
     if (data) console.log(JSON.stringify(data, null, 2));
     console.log('═══════════════════════════════════════════════════');
};
