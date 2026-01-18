-- Make dog image field optional with default value
-- This allows dogs to be created without an image, using a default placeholder

ALTER TABLE dogadopt.dogs 
  ALTER COLUMN image DROP NOT NULL,
  ALTER COLUMN image SET DEFAULT '/dog-coming-soon.svg';

-- Update any existing dogs with NULL images to use the default
UPDATE dogadopt.dogs 
SET image = '/dog-coming-soon.svg' 
WHERE image IS NULL;

-- Add a comment to document the default behavior
COMMENT ON COLUMN dogadopt.dogs.image IS 'Dog image URL. Defaults to /dog-coming-soon.svg if not provided';
