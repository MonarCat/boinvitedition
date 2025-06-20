
# Payment System Documentation

## Overview
Multi-modal payment system supporting M-Pesa STK Push, Paystack integration, and various subscription models.

## Payment Methods

### 1. Direct M-Pesa STK Push
- **Provider**: Paystack M-Pesa API
- **Process**: Phone → STK Push → PIN → Completion
- **Use Case**: Primary method for local users

### 2. Paystack Popup Integration
- **Provider**: Paystack PopUp
- **Methods**: Cards, Bank Transfer, M-Pesa, USSD
- **Process**: Email → Popup → Method Selection → Payment

### 3. Alternative Payment Links
- **Provider**: Paystack Shop
- **Use Case**: External payment processing

## Subscription Plans

### Free Trial
- **Duration**: 14 days
- **Initialization Fee**: KES 10 (one-time)
- **Features**: Full access during trial
- **Payment Link**: https://paystack.shop/pay/4qwq0f-lo6

### Pay As You Go
- **Model**: Commission-based (7% per booking)
- **Initialization Fee**: KES 10 (one-time)
- **Split**: 93% Business, 7% Platform
- **Requirements**: Prepaid bookings only

### Subscription Plans
- **Starter**: KES 1,020/month
- **Business**: KES 2,900/month  
- **Enterprise**: KES 9,900/month
- **Payment Intervals**: Monthly, Quarterly, Bi-annual, Annual, 2-year, 3-year
- **Discounts**: Progressive discounts for longer commitments

## Auto-Split Implementation
- Paystack subaccounts created automatically
- 93% to business subaccount
- 7% to main platform account
- Real-time settlement

## Booking Restrictions
- Reschedule allowed up to 2 hours before appointment
- Pay-as-you-go requires prepayment
- No cash payments accepted for revenue tracking
