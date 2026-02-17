# Netlify Cache Configuration Fix

## Problem

The live site was showing an old version of the landing page despite successful deployments to GitHub and Netlify. This occurred because:

1. **Netlify does not process `.htaccess` files** - These are Apache-specific configuration files
2. All cache control headers defined in `.htaccess` were being ignored
3. Browsers cached the old landing page indefinitely without proper cache control

## Root Cause

Apache `.htaccess` files are only processed by Apache web servers. Netlify uses its own CDN and configuration system, which requires:
- `_headers` file for HTTP header configuration
- `netlify.toml` for build settings and redirects

## Solution

### 1. Created `public/_headers` File

This Netlify-specific file sets proper cache control headers:

```
# HTML files - no caching (ensures users always get latest version)
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# Static assets with hash-based filenames - aggressive caching
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Service Worker - never cache
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
```

### 2. Updated `netlify.toml`

Added critical SPA redirect configuration:

```toml
# SPA redirect - ensures client-side routing works
# This is appropriate for React Router apps with no backend API endpoints
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Note**: All HTTP header configuration (including service worker cache headers) is handled in the `_headers` file to maintain a single source of truth.

### 3. Cleaned Up Repository

- Removed tracked backup file (`BookingPage.tsx.new`)
- Updated `.gitignore` to exclude backup files (`*.new`, `*.old`, `*.bak`)
- Removed incorrect `NETLIFY_USE_YARN` environment variable (project uses npm)

## How It Works

1. **Build Process**: `npm run build` copies `public/_headers` to `dist/_headers`
2. **Netlify Deployment**: Reads `_headers` file and applies HTTP headers to responses
3. **Cache Control**:
   - HTML files: Never cached (users always get latest version)
   - Hashed assets: Cached forever (safe due to hash-based versioning)
   - Service worker: Never cached (critical for PWA functionality)

## Verification

After deployment, verify headers using browser DevTools:

1. Open DevTools → Network tab
2. Load the site (clear cache first)
3. Check `index.html` response headers:
   - Should have `Cache-Control: no-cache, no-store, must-revalidate`
4. Check asset files in `/assets/`:
   - Should have `Cache-Control: public, max-age=31536000, immutable`

## Important Notes

- The `.htaccess` file remains in the repository for potential future Apache hosting
- All Netlify deployments now use `_headers` and `netlify.toml` for configuration
- This fix ensures users always see the latest landing page after deployment
- Hash-based asset versioning (configured in `vite.config.ts`) works in tandem with these headers

## References

- [Netlify Headers Documentation](https://docs.netlify.com/routing/headers/)
- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
- [Cache-Control Header MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
