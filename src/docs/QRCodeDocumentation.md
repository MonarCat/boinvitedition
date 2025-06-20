
# QR Code System Documentation

## Overview
The QR Code system in this application allows businesses to generate scannable codes that redirect customers to their public booking page.

## Architecture

### Components
- **EnhancedQRGenerator**: Main QR generation component with customization options
- **BusinessQRGenerator**: Business-specific wrapper for QR generation
- **QRCodeGenerator**: Base QR code generation utility

### Key Features
1. **Dynamic QR Generation**: Creates unique QR codes for each business
2. **Customizable Styling**: Logo overlay, colors, and sizing options
3. **Download Functionality**: Multiple format support (PNG, SVG)
4. **Error Handling**: Robust error correction and fallback mechanisms

### Usage
```typescript
import { EnhancedQRGenerator } from '@/components/qr/EnhancedQRGenerator';

<EnhancedQRGenerator 
  businessId="business-uuid" 
  businessName="Business Name" 
/>
```

### URL Structure
QR codes redirect to: `/book/[businessId]`

### Error Correction
- Level H (High) - 30% error correction
- Handles damaged or partially obscured codes

### Best Practices
1. Test QR codes before printing
2. Maintain adequate white space around codes
3. Use high contrast colors
4. Ensure minimum size of 2cm x 2cm for physical prints

## Maintenance
- QR codes are generated client-side using the `qrcode` library
- No server-side dependencies required
- Caching handled automatically by browser
