
// Global promise to track loading state once
let paystackLoadPromise: Promise<void> | null = null;
let isPaystackLoaded = false;

// Enhanced Paystack script loader with improved performance and caching
export const loadPaystackScript = (retries = 3, delay = 500): Promise<void> => {
  // If Paystack is already loaded, return a resolved promise immediately
  if (isPaystackLoaded || (typeof window !== 'undefined' && window.PaystackPop)) {
    isPaystackLoaded = true;
    return Promise.resolve();
  }

  // Return existing promise if script is already being loaded
  if (paystackLoadPromise) {
    return paystackLoadPromise;
  }
  
  paystackLoadPromise = new Promise((resolve, reject) => {
    // Double check if Paystack is already loaded
    if (typeof window !== 'undefined' && window.PaystackPop) {
      console.log('Paystack already loaded');
      isPaystackLoaded = true;
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="paystack"]');
    if (existingScript) {
      console.log('Paystack script is already loading');
      existingScript.addEventListener('load', () => {
        console.log('Existing Paystack script loaded');
        if (window.PaystackPop) {
          resolve();
        } else {
          // Give a little time for PaystackPop to initialize
          setTimeout(() => {
            if (window.PaystackPop) {
              resolve();
            } else {
              reject(new Error('Paystack script loaded but PaystackPop not available'));
            }
          }, 300);
        }
      });
      existingScript.addEventListener('error', () => {
        console.error('Existing Paystack script failed to load');
        paystackLoadPromise = null; // Reset promise on error
        reject(new Error('Failed to load Paystack script'));
      });
      return;
    }

    // Create and load the script with priority and performance optimizations
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.defer = false;
    // Only use standard attributes to ensure compatibility
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Wait a moment for PaystackPop to be initialized
      setTimeout(() => {
        if (window.PaystackPop) {
          console.log('Paystack script loaded successfully');
          isPaystackLoaded = true;
          resolve();
        } else {
          console.error('Paystack script loaded but PaystackPop not available');
          
          if (retries > 0) {
            console.log(`Retrying Paystack initialization (${retries} attempts left)...`);
            // Remove script for clean retry
            script.remove();
            paystackLoadPromise = null; // Reset promise on retry
            setTimeout(() => {
              loadPaystackScript(retries - 1, delay * 1.5)
                .then(resolve)
                .catch(reject);
            }, delay);
          } else {
            paystackLoadPromise = null; // Reset promise on failure
            reject(new Error('Paystack not properly initialized after multiple attempts'));
          }
        }
      }, 500); // Increased timeout for better reliability
    };
    
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      
      if (retries > 0) {
        console.log(`Retrying Paystack script load (${retries} attempts left)...`);
        // Remove script for clean retry
        script.remove();
        paystackLoadPromise = null; // Reset promise on retry
        setTimeout(() => {
          loadPaystackScript(retries - 1, delay * 1.5)
            .then(resolve)
            .catch(reject);
        }, delay);
      } else {
        paystackLoadPromise = null; // Reset promise on failure
        reject(new Error('Failed to load Paystack script after multiple attempts'));
      }
    };
    
    document.head.appendChild(script);
  });
  
  return paystackLoadPromise;
};

// Preload function that can be called as early as possible in app initialization
export const preloadPaystackScript = (): void => {
  try {
    // Only add preload link if browser supports it
    if (typeof document !== 'undefined') {
      // Add a preload link for faster script loading
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'script';
      preloadLink.href = 'https://js.paystack.co/v1/inline.js';
      document.head.appendChild(preloadLink);
    
      // We won't automatically load the script on preload to avoid interfering with booking flow
      // Just add the preload hint for when it's actually needed
    }
  } catch (err) {
    console.warn('Paystack preloading not supported', err);
    // Silent fail - preloading is just an optimization
  }
};

// Define proper types for Paystack response and metadata
export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  [key: string]: unknown;
}

export interface PaystackMetadata {
  payment_type: string;
  business_id?: string;
  booking_id?: string;
  plan_type?: string;
  business_name?: string;
  customer_name?: string;
  customer_phone?: string;
  service_id?: string;
  service_name?: string;
  staff_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  [key: string]: unknown;
}

// Declare global Paystack interface
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: PaystackMetadata;
        callback: (response: PaystackResponse) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}
