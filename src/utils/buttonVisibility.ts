/**
 * Button Visibility Utilities
 * 
 * This module ensures that authentication buttons remain visible
 * and are not covered by other elements.
 */

/**
 * Ensures auth buttons remain visible and uncovered
 * This should be called when the component mounts
 */
export const ensureAuthButtonsVisible = () => {
  // Wait for DOM to load properly
  setTimeout(() => {
    const authButtons = document.querySelectorAll('.auth-container button, .btn-glossy-blue, .btn-glossy-red, .auth-button, .get-started-button');
    
    // Add special handling for auth buttons
    authButtons.forEach(button => {
      // Set high z-index to ensure visibility
      if (button instanceof HTMLElement) {
        button.style.position = 'relative';
        button.style.zIndex = '50';
        
        // Check if button is potentially obscured
        const checkVisibility = () => {
          const rect = button.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Check what element is at the center point of the button
          const elementAtCenter = document.elementFromPoint(centerX, centerY);
          
          // If button isn't the top element, increase its z-index
          if (elementAtCenter !== button) {
            const currentZ = parseInt(button.style.zIndex) || 50;
            button.style.zIndex = (currentZ + 5).toString();
          }
        };
        
        // Check on load and resize
        checkVisibility();
        window.addEventListener('resize', checkVisibility);
        window.addEventListener('scroll', checkVisibility);
      }
    });
  }, 500); // Small delay to ensure DOM is ready
};

/**
 * Add this effect to key pages to ensure auth buttons remain visible
 * @example
 * // In a React component
 * import { useEffect } from 'react';
 * import { ensureAuthButtonsVisible } from '@/utils/buttonVisibility';
 * 
 * useEffect(() => {
 *   ensureAuthButtonsVisible();
 * }, []);
 */
