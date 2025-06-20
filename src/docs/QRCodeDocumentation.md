
# Boinvit QR Code System Documentation

## Overview
The QR Code system in Boinvit allows businesses to generate scannable codes that redirect customers to their public booking page, streamlining the appointment booking process.

## Architecture

### Components
- **ReliableQRGenerator**: Main QR generation component with Boinvit branding
- **BusinessQRGenerator**: Business-specific wrapper for QR generation
- **QRCodeGenerator**: Base QR code generation utility
- **EnhancedQRGenerator**: Advanced QR generator with customization options

### Key Features
1. **Dynamic QR Generation**: Creates unique QR codes for each business
2. **Boinvit Branding**: Includes Boinvit logo and branding on QR codes
3. **Customizable Styling**: Business name, colors, and sizing options
4. **Download Functionality**: Multiple format support (PNG, Canvas)
5. **Error Handling**: Robust error correction and fallback mechanisms
6. **Mobile Sharing**: Native share API integration

### Usage
```typescript
import { ReliableQRGenerator } from '@/components/qr/ReliableQRGenerator';

<ReliableQRGenerator 
  businessId="business-uuid" 
  businessName="Business Name" 
/>
```

### URL Structure
QR codes redirect to: `/book/[businessId]`

### Branding Guidelines
- **Main Brand**: "Boinvit" prominently displayed
- **Business Name**: Secondary branding below Boinvit
- **Colors**: Blue primary (#1f2937 for QR, blue accent for branding)
- **Tagline**: "Powered by Boinvit"

### Error Correction
- Level M (Medium) - 15% error correction
- Handles damaged or partially obscured codes
- Automatic retry mechanism on generation failures

### Best Practices
1. Test QR codes before printing
2. Maintain adequate white space around codes
3. Use high contrast colors for scanning
4. Ensure minimum size of 2cm x 2cm for physical prints
5. Include Boinvit branding consistently

### Technical Implementation
- **Library**: qrcode npm package
- **Canvas API**: For branded QR code generation
- **Error Handling**: Comprehensive try-catch with user feedback
- **Performance**: Optimized for quick generation and rendering

## Maintenance
- QR codes are generated client-side using the `qrcode` library
- No server-side dependencies required
- Caching handled automatically by browser
- Automatic regeneration on business ID changes

## Support
For QR code issues:
1. Check console logs for generation errors
2. Verify business ID is valid
3. Ensure stable internet connection
4. Try regenerating the QR code
5. Contact Boinvit support if issues persist
