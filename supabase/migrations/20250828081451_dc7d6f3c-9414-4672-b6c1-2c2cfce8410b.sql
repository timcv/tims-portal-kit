-- Add type field to tickets table
ALTER TABLE public.tickets 
ADD COLUMN type text DEFAULT 'Support';

-- Add a check constraint to ensure only valid types
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_type_check 
CHECK (type IN ('Support', 'Economy', 'Other'));