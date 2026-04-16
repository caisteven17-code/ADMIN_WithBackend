# Fix Status Constraint for Digital Donor Profiles

## The Problem
The `digital_donor_profiles` table has a CHECK constraint on the `status` column that is preventing updates. The constraint `digital_donor_profiles_status_check` is rejecting the value we're trying to set.

## Solution 1: Restart Backend Server
**IMPORTANT:** The code has been updated to use `'approved'` instead of `'verified'`, but you need to restart your backend server for the changes to take effect.

```bash
# Stop your backend server (Ctrl+C in the terminal where it's running)
# Then restart it
cd backend
npm run start:dev
```

## Solution 2: Check and Update Database Constraint

Run this SQL in Supabase SQL Editor to check the current constraint:

```sql
-- Check the current constraint definition
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'digital_donor_profiles_status_check';
```

If the constraint doesn't allow `'approved'`, run this to fix it:

```sql
-- Drop the old constraint
ALTER TABLE digital_donor_profiles 
DROP CONSTRAINT IF EXISTS digital_donor_profiles_status_check;

-- Add new constraint with correct values
ALTER TABLE digital_donor_profiles 
ADD CONSTRAINT digital_donor_profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));
```

## Solution 3: If you want to use 'verified' instead

If you prefer to keep using `'verified'` as the approved status, update the constraint:

```sql
-- Drop the old constraint
ALTER TABLE digital_donor_profiles 
DROP CONSTRAINT IF EXISTS digital_donor_profiles_status_check;

-- Add new constraint with 'verified' instead of 'approved'
ALTER TABLE digital_donor_profiles 
ADD CONSTRAINT digital_donor_profiles_status_check 
CHECK (status IN ('pending', 'verified', 'rejected'));
```

Then you'll need to change the code back to use `'verified'`.

## Verify It Worked

After making changes, test with this query:

```sql
-- Try to update a test record
UPDATE digital_donor_profiles 
SET status = 'approved' 
WHERE id = 'YOUR_TEST_ID';

-- Check if it worked
SELECT id, name, status FROM digital_donor_profiles WHERE id = 'YOUR_TEST_ID';
```

## Recommended Approach

1. **First, restart your backend server** - this is the most likely fix
2. If that doesn't work, check the constraint in Supabase
3. Update the constraint to allow the values your code is using
