
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ContactSalesSection = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Have a question?</h2>
      <p className="text-gray-600 mb-6">
        Send us a message and we'll get back to you as soon as possible.
      </p>
      <Button size="lg" onClick={() => navigate('/contact')}>Contact Us</Button>
    </div>
  );
};
