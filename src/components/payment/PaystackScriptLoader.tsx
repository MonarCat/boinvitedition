
import { useEffect } from 'react';

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }

    // Check if script tag already exists
    if (document.querySelector('script[src*="paystack"]')) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Paystack script loading timeout'));
      }, 10000);
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      if (window.PaystackPop) {
        resolve();
      } else {
        reject(new Error('Paystack not available after script load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Paystack script'));
    };

    document.head.appendChild(script);
  });
};
