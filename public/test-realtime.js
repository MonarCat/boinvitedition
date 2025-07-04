// Test script for client_business_transactions realtime subscription
async function testClientBusinessTransactions() {
  // Get the current business ID from the page context
  // This assumes you have access to the business ID in your application
  // You might need to adjust this based on how you store the business ID
  let businessId = null;
  
  // Try to get business ID from localStorage if your app stores it there
  try {
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token'));
    businessId = localStorage.getItem('current_business_id') || 
                sessionStorage.getItem('current_business_id');
    
    if (!businessId) {
      // Try to extract from URL if it's part of your routing pattern
      const urlMatch = window.location.pathname.match(/\/business\/([^\/]+)/);
      if (urlMatch) {
        businessId = urlMatch[1];
      }
    }
  } catch (error) {
    console.error('Error getting business ID:', error);
  }
  
  if (!businessId) {
    console.error('Could not determine business ID for testing. Please provide it manually.');
    return;
  }
  
  console.log('Testing realtime subscription for business_id:', businessId);
  
  // Create a test transaction
  const { data, error } = await window.supabase
    .from('client_business_transactions')
    .insert([
      {
        business_id: businessId,
        client_email: 'test@example.com',
        amount: 100,
        currency: 'KES',
        status: 'completed',
        transaction_type: 'test',
        description: 'Testing realtime subscription ' + new Date().toISOString()
      }
    ]);
  
  if (error) {
    console.error('Error creating test transaction:', error);
    return;
  }
  
  console.log('Test transaction created:', data);
  console.log('If the realtime subscription is working, you should see "REALTIME: Client business transaction change detected!" in the console soon.');
}

// Execute the test
console.log('Starting client_business_transactions realtime test...');
testClientBusinessTransactions();
