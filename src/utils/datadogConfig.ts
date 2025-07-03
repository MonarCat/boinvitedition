/**
 * Datadog SDK configuration and error handling
 */

import { detectStorageRestrictions, safeLocalStorage } from './browserStorage';

/**
 * Detect if the current browser environment is likely to cause Datadog issues
 * and apply appropriate workarounds
 */
export const configureDatadogSafely = (): void => {
  // Check for storage restrictions that will affect Datadog
  const { restricted, issues } = detectStorageRestrictions();

  if (restricted) {
    console.warn('🔍 Detected browser storage restrictions that may affect Datadog SDK');
    
    // Create a message for users in private/incognito mode
    if (!issues.localStorage.available || !issues.sessionStorage.available) {
      console.warn(
        'Datadog Browser SDK may not function correctly in private/incognito browsing mode. ' +
        'This is expected behavior and will not affect core app functionality.'
      );
    }
  }
};

/**
 * Custom storage provider for Datadog that falls back to memory
 * when browser storage is unavailable
 */
export class DatadogSafeStorage {
  private memoryStorage: Record<string, string> = {};
  private useMemory = false;
  
  constructor() {
    // Check storage restrictions
    const { issues } = detectStorageRestrictions();
    this.useMemory = !issues.localStorage.available;
    
    if (this.useMemory) {
      console.info('📝 Using memory storage fallback for Datadog SDK');
    }
  }

  getItem(key: string): string | null {
    if (this.useMemory) {
      return this.memoryStorage[key] ?? null;
    } else {
      return safeLocalStorage.getItem(key);
    }
  }

  removeItem(key: string): void {
    if (this.useMemory) {
      delete this.memoryStorage[key];
    } else {
      safeLocalStorage.removeItem(key);
    }
  }

  setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStorage[key] = value;
    } else {
      try {
        safeLocalStorage.setItem(key, value);
      } catch (e) {
        // Fall back to memory if localStorage fails
        this.useMemory = true;
        this.memoryStorage[key] = value;
      }
    }
  }
}

/**
 * Export a pre-configured safe storage instance for Datadog
 */
export const datadogSafeStorage = new DatadogSafeStorage();
