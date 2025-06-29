import { verifyPaymentAndUpdateBooking } from '@/components/payment/mobile/PaymentVerification';

export async function POST(request) {
  try {
    const { paymentReference, bookingId } = await request.json();
    
    if (!paymentReference || !bookingId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment reference and booking ID are required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await verifyPaymentAndUpdateBooking(paymentReference, bookingId);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Payment verification failed' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result.data 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
