
// Enhanced Paystack script loader with improved error handling and retry mechanism
export const loadPaystackScript = (retries = 3, delay = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Paystack is already loaded
    if (window.PaystackPop) {
      console.log('Paystack already loaded');
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
          }, 500);
        }
      });
      existingScript.addEventListener('error', () => {
        console.error('Existing Paystack script failed to load');
        reject(new Error('Failed to load Paystack script'));
      });
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      // Wait a moment for PaystackPop to be initialized
      setTimeout(() => {
        if (window.PaystackPop) {
          console.log('Paystack script loaded successfully');
          resolve();
        } else {
          console.error('Paystack script loaded but PaystackPop not available');
          
          if (retries > 0) {
            console.log(`Retrying Paystack initialization (${retries} attempts left)...`);
            // Remove script for clean retry
            script.remove();
            setTimeout(() => {
              loadPaystackScript(retries - 1, delay * 1.5)
                .then(resolve)
                .catch(reject);
            }, delay);
          } else {
            reject(new Error('Paystack not properly initialized after multiple attempts'));
          }
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      
      if (retries > 0) {
        console.log(`Retrying Paystack script load (${retries} attempts left)...`);
        // Remove script for clean retry
        script.remove();
        setTimeout(() => {
          loadPaystackScript(retries - 1, delay * 1.5)
            .then(resolve)
            .catch(reject);
        }, delay);
      } else {
        reject(new Error('Failed to load Paystack script after multiple attempts'));
      }
    };
    
    document.head.appendChild(script);
  });
};

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
        metadata?: any;
        callback: (response: any) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}
