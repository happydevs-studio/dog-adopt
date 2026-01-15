-- Fix type mismatch between rescues table and API functions
-- Migration: 2026011504_fix_rescue_column_types.sql
-- Issue: dogadopt_api.get_rescues() expects TEXT but table has VARCHAR types

-- The API functions declare return types as TEXT, but the table columns are VARCHAR
-- PostgreSQL requires exact type matching in function return types
-- Solution: Change VARCHAR columns to TEXT for consistency

-- Change phone from VARCHAR(50) to TEXT
ALTER TABLE dogadopt.rescues 
  ALTER COLUMN phone TYPE TEXT;

-- Change charity_number from VARCHAR(50) to TEXT  
ALTER TABLE dogadopt.rescues 
  ALTER COLUMN charity_number TYPE TEXT;

-- Change postcode from VARCHAR(20) to TEXT
ALTER TABLE dogadopt.rescues 
  ALTER COLUMN postcode TYPE TEXT;

-- Change email from VARCHAR(255) to TEXT
ALTER TABLE dogadopt.rescues 
  ALTER COLUMN email TYPE TEXT;

-- Note: TEXT columns in PostgreSQL have no performance penalty compared to VARCHAR
-- and provide more flexibility. The database will still use TOAST for large values.

COMMENT ON COLUMN dogadopt.rescues.phone IS 'Primary contact phone number (updated to TEXT for API consistency)';
COMMENT ON COLUMN dogadopt.rescues.email IS 'Primary contact email address (updated to TEXT for API consistency)';
COMMENT ON COLUMN dogadopt.rescues.postcode IS 'UK postcode for location-based searches (updated to TEXT for API consistency)';
COMMENT ON COLUMN dogadopt.rescues.charity_number IS 'UK Charity Commission registration number (updated to TEXT for API consistency)';
