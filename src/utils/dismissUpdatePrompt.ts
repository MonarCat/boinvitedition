/**
 * Utility for handling and dismissing update prompts
 * This ensures that update prompts don't block UI elements like the sign-in button
 */

// Store user preference for update prompts
const USER_PREF_KEY = 'boinvit_update_prompt_preferences';

interface UpdatePromptPreferences {
  dismissedVersions: string[];
  lastPromptTime: number;
  postponeHours: number;
}

// Get stored preferences or create defaults
const getUpdatePreferences = (): UpdatePromptPreferences => {
  try {
    const storedPrefs = localStorage.getItem(USER_PREF_KEY);
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
  } catch (error) {
    console.error('Failed to parse update preferences:', error);
  }
  
  // Default preferences
  return {
    dismissedVersions: [],
    lastPromptTime: 0,
    postponeHours: 24
  };
};

// Save preferences to localStorage
const saveUpdatePreferences = (prefs: UpdatePromptPreferences): void => {
  try {
    localStorage.setItem(USER_PREF_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save update preferences:', error);
  }
};

/**
 * Dismisses the update prompt for a specific version
 * @param version Version string to dismiss
 * @param permanently If true, never show this version again
 */
export const dismissUpdatePrompt = (version: string, permanently = false): void => {
  const prefs = getUpdatePreferences();
  
  if (permanently) {
    // Add this version to the list of permanently dismissed versions
    if (!prefs.dismissedVersions.includes(version)) {
      prefs.dismissedVersions.push(version);
    }
  }
  
  // Update the last prompt time to now
  prefs.lastPromptTime = Date.now();
  saveUpdatePreferences(prefs);
};

/**
 * Checks if an update prompt should be shown
 * @param version Current version string
 * @returns Boolean indicating if prompt should be shown
 */
export const shouldShowUpdatePrompt = (version: string): boolean => {
  const prefs = getUpdatePreferences();
  
  // If this version has been permanently dismissed, don't show
  if (prefs.dismissedVersions.includes(version)) {
    return false;
  }
  
  // If it's been less than postponeHours since last prompt, don't show
  const hoursSinceLastPrompt = (Date.now() - prefs.lastPromptTime) / (1000 * 60 * 60);
  if (hoursSinceLastPrompt < prefs.postponeHours) {
    return false;
  }
  
  return true;
};

/**
 * Configure update prompt behavior
 * @param options Configuration options
 */
export const configureUpdatePrompts = (options: { postponeHours?: number }): void => {
  const prefs = getUpdatePreferences();
  
  if (options.postponeHours !== undefined) {
    prefs.postponeHours = options.postponeHours;
  }
  
  saveUpdatePreferences(prefs);
};

/**
 * Override for native confirm dialog for updates
 * Replaces the default confirm dialog with a custom one that doesn't block UI
 */
export const setupUpdatePromptOverride = (): void => {
  // Store the original confirm function
  const originalConfirm = window.confirm;
  
  // Override window.confirm for update prompts
  window.confirm = function(message: string): boolean {
    // Check if this is an update prompt
    if (message.includes('New version available') || message.includes('update') || message.includes('reload')) {
      // Completely suppress update notifications - they're annoying to users
      // We'll let natural page refreshes handle updates instead
      if (process.env.NODE_ENV === 'development') {
        console.log('Update available - suppressed notification in production');
      }
      
      // Don't block the UI, just return false
      return false;
    }
    
    // For other confirm dialogs, use the original behavior
    return originalConfirm.call(this, message);
  };
};

// Extend Window interface to include toast
declare global {
  interface Window {
    toast?: {
      info: (options: {
        title?: string;
        description?: string;
        action?: {
          label: string;
          onClick: () => void;
        };
        duration?: number;
      }) => void;
    };
  }
}
