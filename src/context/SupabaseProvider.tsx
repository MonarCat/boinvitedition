import React from 'react';
import { SupabaseContext } from './SupabaseContextDef';
import { supabase } from '@/lib/supabase';

// Create the Provider component
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Provide the Supabase client to all children
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
