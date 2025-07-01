import React from 'react';

const StripeCheckout: React.FC = () => {
  return (
    <div className="py-16 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600">Upgrade your account to unlock more features</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-800 mb-4">
            We have simplified our pricing. We now offer a simple Pay As You Go model.
          </p>
          <p className="text-sm text-gray-500">
            Secure payments powered by Stripe. Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
