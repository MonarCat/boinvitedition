
import React from 'react';
import { Route } from 'react-router-dom';
import BusinessSlugResolver from '@/components/business/BusinessSlugResolver';

export const SlugRoutes = () => {
  return (
    <Route path="/:slug" element={<BusinessSlugResolver />} />
  );
};
