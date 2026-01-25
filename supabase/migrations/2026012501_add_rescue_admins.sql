-- Add Rescue Administrators
-- This migration creates the rescue_admins table to allow rescue contacts
-- to manage their own rescue details and dogs

-- ========================================
-- RESCUE_ADMINS TABLE
-- ========================================

-- Create rescue_admins junction table to link users to rescues they can manage
CREATE TABLE dogadopt.rescue_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rescue_id UUID NOT NULL REFERENCES dogadopt.rescues(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(user_id, rescue_id)
);

-- Create indexes
CREATE INDEX idx_rescue_admins_user_id ON dogadopt.rescue_admins(user_id);
CREATE INDEX idx_rescue_admins_rescue_id ON dogadopt.rescue_admins(rescue_id);

-- Enable RLS
ALTER TABLE dogadopt.rescue_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rescue_admins
-- Users can view their own rescue admin assignments
CREATE POLICY "Users can view their own rescue admin assignments"
ON dogadopt.rescue_admins FOR SELECT
USING (auth.uid() = user_id);

-- Global admins can manage rescue admin assignments
CREATE POLICY "Global admins can manage rescue admins"
ON dogadopt.rescue_admins FOR ALL
USING (dogadopt.has_role(auth.uid(), 'admin'));

-- Grant permissions
GRANT SELECT ON dogadopt.rescue_admins TO authenticated;

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to check if a user is an admin of a specific rescue
-- Returns true if user is either a global admin OR a rescue admin for the given rescue
CREATE OR REPLACE FUNCTION dogadopt.is_rescue_admin(p_user_id UUID, p_rescue_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = dogadopt
AS $$
  SELECT EXISTS (
    -- Check if user is a global admin
    SELECT 1 FROM dogadopt.user_roles
    WHERE user_id = p_user_id AND role = 'admin'
  ) OR EXISTS (
    -- Check if user is a rescue admin for this specific rescue
    SELECT 1 FROM dogadopt.rescue_admins
    WHERE user_id = p_user_id AND rescue_id = p_rescue_id
  );
$$;

COMMENT ON FUNCTION dogadopt.is_rescue_admin IS 'Check if user is a global admin or rescue admin for a specific rescue';

-- ========================================
-- UPDATE RLS POLICIES FOR RESCUES
-- ========================================

-- Drop the existing "Admins can manage rescues" policy
DROP POLICY IF EXISTS "Admins can manage rescues" ON dogadopt.rescues;

-- Create new policies that allow both global admins and rescue admins to manage their rescues
CREATE POLICY "Global admins can manage all rescues"
ON dogadopt.rescues FOR ALL
USING (dogadopt.has_role(auth.uid(), 'admin'));

CREATE POLICY "Rescue admins can update their own rescue"
ON dogadopt.rescues FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dogadopt.rescue_admins
    WHERE user_id = auth.uid() AND rescue_id = dogadopt.rescues.id
  )
);

-- ========================================
-- UPDATE RLS POLICIES FOR DOGS
-- ========================================

-- Drop the existing admin policies
DROP POLICY IF EXISTS "Admins can insert dogs" ON dogadopt.dogs;
DROP POLICY IF EXISTS "Admins can update dogs" ON dogadopt.dogs;
DROP POLICY IF EXISTS "Admins can delete dogs" ON dogadopt.dogs;

-- Create new policies that allow both global admins and rescue admins to manage dogs
CREATE POLICY "Global admins can insert dogs"
ON dogadopt.dogs FOR INSERT
WITH CHECK (dogadopt.has_role(auth.uid(), 'admin'));

CREATE POLICY "Rescue admins can insert dogs for their rescue"
ON dogadopt.dogs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dogadopt.rescue_admins
    WHERE user_id = auth.uid() AND rescue_id = dogadopt.dogs.rescue_id
  )
);

CREATE POLICY "Global admins can update dogs"
ON dogadopt.dogs FOR UPDATE
USING (dogadopt.has_role(auth.uid(), 'admin'));

CREATE POLICY "Rescue admins can update their rescue's dogs"
ON dogadopt.dogs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dogadopt.rescue_admins ra
    WHERE ra.user_id = auth.uid() AND ra.rescue_id = dogadopt.dogs.rescue_id
  )
);

CREATE POLICY "Global admins can delete dogs"
ON dogadopt.dogs FOR DELETE
USING (dogadopt.has_role(auth.uid(), 'admin'));

CREATE POLICY "Rescue admins can delete their rescue's dogs"
ON dogadopt.dogs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dogadopt.rescue_admins ra
    WHERE ra.user_id = auth.uid() AND ra.rescue_id = dogadopt.dogs.rescue_id
  )
);

-- ========================================
-- POPULATE RESCUE_ADMINS FROM EXISTING DATA
-- ========================================

-- This will match rescue contact emails with existing user accounts
-- and grant them rescue admin access
-- Note: This will only work for users who have already signed up with the rescue contact email

INSERT INTO dogadopt.rescue_admins (user_id, rescue_id, granted_by, notes)
SELECT 
  u.id as user_id,
  r.id as rescue_id,
  NULL as granted_by, -- NULL since this is an automated migration
  'Auto-granted from rescue contact email during migration' as notes
FROM dogadopt.rescues r
INNER JOIN auth.users u ON LOWER(u.email) = LOWER(r.email)
WHERE r.email IS NOT NULL
ON CONFLICT (user_id, rescue_id) DO NOTHING;

-- Log how many rescue admins were created
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM dogadopt.rescue_admins;
  RAISE NOTICE 'Created % rescue admin assignments from existing users', admin_count;
END $$;
