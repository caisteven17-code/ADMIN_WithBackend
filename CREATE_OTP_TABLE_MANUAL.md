# Create OTP Sessions Table - Manual Setup

Since the table doesn't exist, you need to create it manually in Supabase:

## Steps:

1. Go to https://app.supabase.com/
2. Sign in and select your project
3. Go to **SQL Editor** (left sidebar)
4. Create a new query
5. Copy and paste this SQL:

```sql
-- Create otp_sessions table
CREATE TABLE IF NOT EXISTS public.otp_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  otp text NOT NULL,
  created_at_ms int8 NOT NULL,
  expires_at_ms int8 NOT NULL,
  used bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_otp_sessions_email ON public.otp_sessions(email);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_expires_at_ms ON public.otp_sessions(expires_at_ms);

-- Disable RLS so the app can read/write
ALTER TABLE public.otp_sessions DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated users
GRANT ALL ON public.otp_sessions TO anon;
GRANT ALL ON public.otp_sessions TO authenticated;
```

6. Click **Run** button
7. Wait for it to complete
8. Go back to the app and try logging in again

## Verify it worked:
- The table should appear in the **Tables** section in the left sidebar
- You should be able to login successfully

---

**If you can't access SQL Editor:**
- Ask your Supabase project admin for access to run SQL migrations
- Or use Supabase dashboard to create the table through the UI
1 Hidden Terminal
can you do the expire time to create time plus 20 minutes?

Done! Changed OTP expiration to 20 minutes from creation time. The email template is also updated to reflect this.


