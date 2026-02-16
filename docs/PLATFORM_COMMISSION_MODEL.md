# Bolt-Style Commission Model - Platform Fee System

## Overview

Boinvit has been transformed into a focused salon/barbershop management SaaS with a commission-based payment model inspired by ride-hailing platforms like Bolt and Uber.

## Key Changes

### 1. Business Model
- **From:** Subscription-based SaaS
- **To:** Commission-based with hybrid option
- **Focus:** Exclusively salon, beauty parlour, and barbershop businesses
- **Removed:** All transport and other niche features

### 2. Revenue Model

#### Commission Structure
- **Rate:** 3% platform fee on all completed services
- **Payment Flow:** 
  1. Clients pay businesses directly (M-Pesa, Card, Cash)
  2. Platform fee accumulates automatically on booking completion
  3. Business clears balance periodically via Paystack

#### Balance Thresholds
- **Warning Threshold:** KES 2,000 (40% of restriction threshold)
- **Restriction Threshold:** KES 5,000
- **Action:** New bookings disabled until balance is cleared

### 3. Database Schema

#### New Tables

**platform_transactions**
- Tracks individual commission fees per booking
- Links to bookings for full audit trail
- Status: unpaid, paid, waived

**platform_payments**
- Records balance clearance payments
- Splits between platform fee and subscription fee
- Includes Paystack reference and metadata

#### Extended Tables

**businesses**
- `platform_fee_percentage` (default: 3%)
- `platform_balance` (accumulated unpaid fees)
- `account_status` (active, restricted, suspended)
- `last_platform_payment_date`

**subscriptions**
- `monthly_base_fee` (for hybrid model)
- `subscription_balance_due`
- `payment_interval` (monthly, commission, hybrid)

### 4. Payment Integration

#### Edge Functions

**clear-platform-balance**
- Initiates balance clearance payment
- Calculates total due (platform + subscription)
- Creates Paystack transaction
- Returns authorization URL

**paystack-webhook (updated)**
- Handles both booking and platform clearance payments
- Routes based on metadata `payment_type`
- Validates signatures for security
- Updates balances and marks transactions as paid

### 5. Frontend Components

**Location:** `/src/components/platform/`

- `PlatformBalanceSummary` - Main balance display card
- `PlatformBalanceBanner` - Warning banner when balance is high
- `PlatformBreakdownModal` - Detailed transaction breakdown
- `PlatformPaymentHistory` - Payment history table

**Hook:** `usePlatformBalance` - State management for platform balance

**Constants:** `/src/constants/platformConfig.ts` - Configuration values

### 6. Automatic Commission Calculation

**Database Trigger:** `trigger_add_platform_fee_on_booking_completion`

When a booking status changes to 'completed':
1. Calculates platform fee (amount × 3%)
2. Creates entry in `platform_transactions`
3. Increments `business.platform_balance`
4. All done in a single database transaction

## Security Features

- ✅ Webhook signature validation
- ✅ Row-level security (RLS) on all tables
- ✅ Audit logging for security events
- ✅ Database constraints and checks
- ✅ No direct user access to platform tables

## User Experience

### Business Owner Dashboard

1. **Platform Balance Card** (always visible)
   - Current balance with color coding
   - Green: All clear (< KES 2,000)
   - Amber: Warning (>= KES 2,000)
   - Red: Restricted (>= KES 5,000)
   
2. **Clear Balance Button**
   - One-click payment initiation
   - Redirects to Paystack
   - Automatic balance reset on success

3. **Restriction Banner**
   - Appears at top when balance is high
   - Clear call-to-action
   - Explains restriction impact

4. **Breakdown Modal**
   - Shows all unpaid transactions
   - Service amount and fee details
   - Transparent calculation

## Configuration

All configuration values are centralized in `/src/constants/platformConfig.ts`:

```typescript
export const PLATFORM_COMMISSION_RATE = 3; // 3%
export const PLATFORM_BALANCE_RESTRICTION_THRESHOLD = 5000; // KES
export const PLATFORM_BALANCE_WARNING_RATIO = 0.4; // 40%
```

## Testing Checklist

- [ ] Create test booking and mark as completed
- [ ] Verify platform fee is calculated correctly (3%)
- [ ] Check balance updates in dashboard
- [ ] Test balance clearance payment flow
- [ ] Verify webhook processes clearance payments
- [ ] Test restriction when balance > KES 5,000
- [ ] Verify warning shows at KES 2,000
- [ ] Test payment history display

## Migration Notes

### Running Migrations

Migrations are located in `/supabase/migrations/`:

1. `20260216190000_add_bolt_style_commission_model.sql`
   - Creates new tables and functions
   - Adds columns to existing tables
   - Sets up triggers and RLS policies

2. `20260216191000_remove_transport_features.sql`
   - **WARNING:** Destructive operation
   - Deletes all transport services
   - Removes transport columns
   - Backs up recommended before running

### Deployment Steps

1. Backup production database
2. Run migrations in order
3. Deploy edge functions:
   - `clear-platform-balance`
   - Updated `paystack-webhook`
4. Deploy frontend changes
5. Verify Paystack webhook URL is configured

## Monitoring

### Key Metrics to Track

- Average platform balance per business
- Payment frequency (how often businesses clear balance)
- Restriction rate (% of businesses restricted)
- Commission collection rate
- Payment success rate via Paystack

### Database Queries

```sql
-- Total unpaid platform fees
SELECT SUM(platform_balance) FROM businesses;

-- Businesses near restriction
SELECT name, platform_balance 
FROM businesses 
WHERE platform_balance >= 2000 
ORDER BY platform_balance DESC;

-- Commission by date
SELECT 
  DATE(transaction_date) as date,
  COUNT(*) as transactions,
  SUM(platform_fee_amount) as total_fees
FROM platform_transactions
WHERE status = 'unpaid'
GROUP BY DATE(transaction_date);
```

## Future Enhancements

- [ ] Automated reminders via email/SMS when balance reaches thresholds
- [ ] Bulk payment plans for high-volume businesses
- [ ] Commission rate tiers based on volume
- [ ] Monthly subscription + commission hybrid options
- [ ] Analytics dashboard for business owners showing fee breakdown
- [ ] Soft launch with select businesses before full rollout

## Support

For issues or questions:
- Check webhook logs in Supabase dashboard
- Review `platform_transactions` table for commission records
- Check `platform_payments` for payment history
- Review Paystack dashboard for payment status
