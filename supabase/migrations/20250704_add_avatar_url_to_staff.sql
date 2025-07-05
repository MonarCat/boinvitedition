-- Add avatar_url column to the staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;
