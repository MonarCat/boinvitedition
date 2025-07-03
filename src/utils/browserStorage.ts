/**
 * Browser storage utilities for detecting and handling storage issues
 * Especially useful for DataDog and Pusher integration
 */

// Type definition for storage checks
type StorageType = 'localStorage' | 'sessionStorage' | 'cookies';

interface StorageStatus {
  available: boolean;
  error: string | null;
}

/**
 * Check if a specific browser storage is available and working
 * This helps diagnose issues with DataDog SDK and Pusher
 */
export const checkStorageAvailability = (type: StorageType): StorageStatus => {
  let storage: Storage | null = null;
  
  try {
    if (type === 'localStorage') {
      storage = window.localStorage;
    } else if (type === 'sessionStorage') {
      storage = window.sessionStorage;
    }
    
    if (!storage) {
      return { 
        available: false, 
        error: `${type} is not available in this browser environment`
      };
    }
    
    // Try to use storage
    const testKey = `__storage_test_${Date.now()}__`;
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    
    return { available: true, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { 
      available: false, 
      error: `${type} is not available: ${error}` 
    };
  }
};

/**
 * Detect if there are storage restrictions that may affect third-party libraries
 * Returns true if browser storage is limited or restricted
 */
export const detectStorageRestrictions = (): {
  restricted: boolean;
  issues: Record<StorageType, StorageStatus>;
} => {
  const issues: Record<StorageType, StorageStatus> = {
    localStorage: checkStorageAvailability('localStorage'),
    sessionStorage: checkStorageAvailability('sessionStorage'),
    cookies: { 
      available: navigator.cookieEnabled, 
      error: navigator.cookieEnabled ? null : 'Cookies are disabled in this browser'
    }
  };
  
  // Check if any storage type is restricted
  const restricted = Object.values(issues).some(status => !status.available);
  
  return { restricted, issues };
};

/**
 * Create a safe wrapper around localStorage that falls back to memory storage
 * when browser storage is unavailable (like in private/incognito mode)
 */
class SafeStorage {
  private memoryStorage: Record<string, string> = {};
  private useMemory = false;
  
  constructor() {
    // Check if localStorage is available
    const { available } = checkStorageAvailability('localStorage');
    this.useMemory = !available;
    
    if (this.useMemory) {
      console.warn('⚠️ localStorage unavailable, using in-memory storage instead');
    }
  }
  
  getItem(key: string): string | null {
    if (this.useMemory) {
      return this.memoryStorage[key] || null;
    }
    return localStorage.getItem(key);
  }
  
  setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStorage[key] = value;
    } else {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Failed to write to localStorage, falling back to memory storage', e);
        this.useMemory = true;
        this.memoryStorage[key] = value;
      }
    }
  }
  
  removeItem(key: string): void {
    if (this.useMemory) {
      delete this.memoryStorage[key];
    } else {
      localStorage.removeItem(key);
    }
  }
  
  clear(): void {
    if (this.useMemory) {
      this.memoryStorage = {};
    } else {
      localStorage.clear();
    }
  }
  
  get isUsingMemoryStorage(): boolean {
    return this.useMemory;
  }
}

// Export singleton instances
export const safeLocalStorage = new SafeStorage();

/**
 * Initialize diagnostics and log any browser storage issues
 */
export const initStorageDiagnostics = (): void => {
  const { restricted, issues } = detectStorageRestrictions();
  
  if (restricted) {
    console.warn('⚠️ Browser storage restrictions detected:');
    Object.entries(issues).forEach(([type, status]) => {
      if (!status.available) {
        console.warn(`- ${type}: ${status.error}`);
      }
    });
    
    // Log specific message for DataDog
    if (!issues.localStorage.available || !issues.sessionStorage.available) {
      console.warn(
        '⚠️ DataDog Browser SDK may not function correctly due to storage restrictions. ' +
        'This commonly occurs in private/incognito browsing modes.'
      );
    }
  }
};
