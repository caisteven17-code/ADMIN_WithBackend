# Add verification_status Column to Digital Donor Profiles

## The Problem
The backend is querying for `verification_status` in the `digital_donor_profiles` table, but this column doesn't exist.

## The Solution

Run this SQL in Supabase SQL Editor:

```sql
-- Add verification_status column to digital_donor_profiles table if it doesn't exist
ALTER TABLE digital_donor_profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Add other required columns if missing
ALTER TABLE digital_donor_profiles 
ADD COLUMN IF NOT EXISTS verified_by uuid;

ALTER TABLE digital_donor_profiles 
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

ALTER TABLE digital_donor_profiles 
ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE digital_donor_profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_digital_donor_verification_status 
ON digital_donor_profiles(verification_status);
```

## Steps to Execute

1. Go to https://app.supabase.com/
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL above
6. Click **Run**
7. Wait for success message
8. Refresh your app

## Verify it Worked

After running the SQL:
1. Go to **Tables** in left sidebar
2. Click on `digital_donor_profiles`
3. Check the columns tab - you should see:
   - `verification_status` (text)
   - `verified_by` (uuid)
   - `verified_at` (timestamp)
   - `rejection_reason` (text)
   - `updated_at` (timestamp)

Then refresh your dashboard - the digital donors list should load!
