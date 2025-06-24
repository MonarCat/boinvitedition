
// Enhanced Paystack script loader with better error handling
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Paystack is already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="paystack"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script')));
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      if (window.PaystackPop) {
        console.log('Paystack script loaded successfully');
        resolve();
      } else {
        console.error('Paystack script loaded but PaystackPop not available');
        reject(new Error('Paystack not properly initialized'));
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      reject(new Error('Failed to load Paystack script'));
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
