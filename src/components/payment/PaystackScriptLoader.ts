
// Global promise to track loading state once
let paystackLoadPromise: Promise<void> | null = null;
let isPaystackLoaded = false;

// Enhanced Paystack script loader with better error handling
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

    // Remove any existing failed scripts
    const existingScripts = document.querySelectorAll('script[src*="paystack"]');
    existingScripts.forEach(script => {
      if (script.getAttribute('data-failed') === 'true') {
        script.remove();
      }
    });

    // Check if script is already loading successfully
    const existingScript = document.querySelector('script[src*="paystack"]:not([data-failed="true"])');
    if (existingScript) {
      console.log('Paystack script is already loading');
      const handleLoad = () => {
        if (window.PaystackPop) {
          isPaystackLoaded = true;
          resolve();
        } else {
          setTimeout(() => {
            if (window.PaystackPop) {
              isPaystackLoaded = true;
              resolve();
            } else {
              existingScript.setAttribute('data-failed', 'true');
              reject(new Error('Paystack script loaded but PaystackPop not available'));
            }
          }, 200);
        }
      };

      const handleError = () => {
        existingScript.setAttribute('data-failed', 'true');
        paystackLoadPromise = null;
        reject(new Error('Failed to load Paystack script'));
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.setAttribute('data-paystack-loader', 'true');
    
    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    const handleLoad = () => {
      cleanup();
      setTimeout(() => {
        if (window.PaystackPop) {
          console.log('Paystack script loaded successfully');
          isPaystackLoaded = true;
          resolve();
        } else {
          console.error('Paystack script loaded but PaystackPop not available');
          
          if (retries > 0) {
            console.log(`Retrying Paystack initialization (${retries} attempts left)...`);
            script.setAttribute('data-failed', 'true');
            paystackLoadPromise = null;
            setTimeout(() => {
              loadPaystackScript(retries - 1, delay * 1.5)
                .then(resolve)
                .catch(reject);
            }, delay);
          } else {
            script.setAttribute('data-failed', 'true');
            paystackLoadPromise = null;
            reject(new Error('Paystack not properly initialized after multiple attempts'));
          }
        }
      }, 200);
    };
    
    const handleError = () => {
      cleanup();
      console.error('Failed to load Paystack script', script.src);
      
      if (retries > 0) {
        console.log(`Retrying Paystack script load (${retries} attempts left)...`);
        script.setAttribute('data-failed', 'true');
        paystackLoadPromise = null;
        setTimeout(() => {
          loadPaystackScript(retries - 1, delay * 1.5)
            .then(resolve)
            .catch(reject);
        }, delay);
      } else {
        script.setAttribute('data-failed', 'true');
        paystackLoadPromise = null;
        reject(new Error('Failed to load Paystack script after multiple attempts'));
      }
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    
    document.head.appendChild(script);
  });
  
  return paystackLoadPromise;
};

// Preload function that can be called as early as possible in app initialization
export const preloadPaystackScript = (): void => {
  // Remove preload approach as it's causing issues
  // Script will be loaded on-demand when needed
  console.log('Paystack will be loaded on-demand when payment is initiated');
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
