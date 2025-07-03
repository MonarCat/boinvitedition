# Boinvit for Booking - UI/UX Design System

## Design Philosophy

The Boinvit for Booking app follows a design philosophy centered on simplicity, intuitiveness, and delight. Our goal is to create an interface that feels immediately familiar to users while providing a premium, branded experience that differentiates us from generic booking solutions.

## Brand Identity

### Colors

**Primary Color Palette**
- **Primary Blue**: `#3f51b5` - Used for primary actions, main navigation elements
- **Accent Teal**: `#00bcd4` - Used for highlights, secondary actions
- **Success Green**: `#4caf50` - Used for confirmations, completed states
- **Warning Orange**: `#ff9800` - Used for pending states, alerts
- **Error Red**: `#f44336` - Used for errors, cancellations

**Neutral Palette**
- **Background Light**: `#f5f7fa` - Primary background color
- **Card White**: `#ffffff` - Card backgrounds, content areas
- **Text Dark**: `#263238` - Primary text color
- **Text Medium**: `#607d8b` - Secondary text, labels
- **Text Light**: `#b0bec5` - Placeholder text, disabled elements
- **Border Light**: `#e0e0e0` - Dividers, borders

### Typography

**Font Family**
- Primary font: Roboto (Android), SF Pro Text (iOS)
- Headings: Semi-bold weight
- Body text: Regular weight

**Text Sizes**
- Heading 1: 24sp (booking details, welcome screens)
- Heading 2: 20sp (section headers)
- Heading 3: 18sp (card titles)
- Body: 16sp (general text)
- Caption: 14sp (labels, secondary information)
- Small: 12sp (timestamps, supplementary information)

## Core UI Components

### Cards

Booking cards are a key component and follow these design principles:
- Slightly elevated appearance with subtle shadows
- Rounded corners (12dp radius)
- Clear visual hierarchy with business name prominent
- Status indicators use color and iconography
- Action buttons aligned to the right/bottom
- Consistent padding (16dp)

### Buttons

**Primary Button**
- Background: Primary Blue
- Text: White
- Height: 48dp
- Rounded corners (8dp radius)
- Clear, concise action text

**Secondary Button**
- Border: Primary Blue (2dp)
- Text: Primary Blue
- Background: Transparent
- Height: 48dp
- Rounded corners (8dp radius)

**Text Button**
- Text: Primary Blue
- No background or border
- Used for tertiary actions

**Action Chip**
- Small, pill-shaped buttons (24dp height)
- Used for quick actions on booking cards
- Color indicates action type (pay, reschedule, etc.)

### Navigation

**Bottom Tab Navigation**
- Icons with labels
- Active state uses Primary Blue
- Inactive state uses Text Medium color
- Consistent icons across the app

**Top Navigation**
- Clean header with page title
- Back button when nested
- Contextual actions when appropriate

## Interaction Design

### Loading States

- Skeleton screens instead of spinners where possible
- Animated placeholder cards for booking lists
- Progress indicators for actions (payment, rescheduling)

### Transitions

- Smooth page transitions (shared element where appropriate)
- Subtle animation for state changes
- Haptic feedback for confirmations on capable devices

### Feedback

- Success confirmations are brief but clear
- Error messages explain the issue and suggest resolution
- Toast notifications for non-critical feedback

## Screen-Specific Designs

### Home Screen

- Prominent upcoming booking card
- Quick action buttons for common tasks
- Recent business list for easy rebooking
- Clean, uncluttered layout with clear hierarchy

### Booking List Screen

- Tabbed interface for different booking states
- Pull-to-refresh functionality
- Filter/sort options accessible but not intrusive
- Empty states with helpful guidance

### Booking Detail Screen

- Prominent booking status
- Clear date and time information
- Service details with pricing
- Business information with contact options
- Action buttons appropriate to booking state
- Map view for location when relevant

### QR Scanner Screen

- Clean viewfinder with guidance overlay
- Scanning animation provides visual feedback
- Clear instructions
- Flash toggle for low-light environments
- History of scanned codes (optional)

### Profile Screen

- User information at the top
- Clear sections for different settings
- Easy access to booking preferences
- Payment methods management
- Support/help options

## Accessibility Considerations

- Color contrast meets WCAG AA standards
- Touch targets at least 48x48dp
- Support for dynamic text sizes
- Screen reader compatibility
- Sufficient spacing between interactive elements

## Mobile-Specific Optimizations

- One-handed usage considerations for key actions
- Keyboard avoidance for form inputs
- Safe area considerations for notches and home indicators
- Landscape orientation support where beneficial

## Design Language Consistency with Business App

While the Boinvit for Booking app has its own distinct identity, it maintains consistency with the Boinvit for Business app through:

- Shared color palette foundations
- Similar component styling
- Consistent iconography
- Complementary but distinct branding

This creates a recognizable ecosystem while still allowing each app to be optimized for its specific user group.
