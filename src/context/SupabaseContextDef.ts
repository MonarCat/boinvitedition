import { createContext } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Define the type for our context value
export interface SupabaseContextType {
  supabase: SupabaseClient<Database>;
}

// Create the context with undefined as default value
export const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);
