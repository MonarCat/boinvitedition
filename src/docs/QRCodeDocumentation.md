
# Boinvit QR Code System Documentation

## Overview
The QR Code system in Boinvit allows businesses to generate scannable codes that redirect customers to their public booking page, streamlining the appointment booking process.

## Architecture

### Components
- **BoinvitQRGenerator**: Main QR generation component with complete functionality
- **BusinessQRGenerator**: Business-specific wrapper that handles business data fetching

### Key Features
1. **Reliable QR Generation**: Single component architecture prevents conflicts
2. **Boinvit Branding**: Professional branding with business customization
3. **Error Handling**: Comprehensive error management and user feedback
4. **Multiple Export Options**: Download, share, and URL copying
5. **Responsive Design**: Works across all device sizes
6. **Auto-generation**: QR codes generate automatically when component loads

### Technical Implementation
```typescript
import { BoinvitQRGenerator } from '@/components/qr/BoinvitQRGenerator';

<BoinvitQRGenerator 
  businessId="business-uuid" 
  businessName="Business Name" 
/>
```

### URL Structure
QR codes redirect to: `${window.location.origin}/book/[businessId]`

### Features
- **Canvas Rendering**: High-quality QR codes with custom branding
- **Customizable Messages**: Optional custom text on QR codes
- **Download Support**: PNG format downloads with proper naming
- **Share Integration**: Native sharing API with fallback support
- **URL Copying**: Clipboard integration with fallback for older browsers
- **Real-time Generation**: Instant QR code creation and updates

### Error Correction
- Level M (Medium) - 15% error correction capability
- Handles damaged or partially obscured codes
- Robust error handling with user-friendly messages

### Best Practices
1. **Reliability**: Single component prevents conflicts
2. **Performance**: Efficient canvas rendering and image generation
3. **Accessibility**: Clear instructions and error messages
4. **Branding**: Consistent Boinvit branding across all QR codes
5. **User Experience**: Intuitive interface with helpful guidance

### Troubleshooting
- QR codes generate automatically on component mount
- Error messages provide clear guidance for resolution
- Console logging helps with debugging
- Fallback mechanisms ensure functionality across browsers

## Maintenance
- No external dependencies beyond the qrcode library
- Self-contained component reduces maintenance overhead
- Clear separation of concerns between business logic and QR generation
- Comprehensive error handling prevents application crashes

## Support
The new QR code system is designed to be error-free and reliable. If issues occur:
1. Check browser console for detailed error messages
2. Verify business ID is valid and business exists
3. Ensure stable internet connection
4. Try regenerating the QR code using the button
5. Contact support if problems persist
