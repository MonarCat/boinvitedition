
-- Add service_images column to services table to store image URLs
ALTER TABLE public.services 
ADD COLUMN service_images TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN public.services.service_images IS 'Array of image URLs for the service';
