
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Set security headers via meta tags for CSP and other security policies
    const addMetaTag = (name: string, content: string) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Content Security Policy
    addMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://prfowczgawhjapsdpncq.supabase.co wss://prfowczgawhjapsdpncq.supabase.co https://api.stripe.com https://maps.googleapis.com; " +
      "frame-src 'self' https://js.stripe.com;"
    );

    // X-Frame-Options
    addMetaTag('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    addMetaTag('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    addMetaTag('referrer', 'strict-origin-when-cross-origin');

    // Permissions Policy
    addMetaTag('Permissions-Policy', 
      'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
    );

  }, []);

  return null;
};
