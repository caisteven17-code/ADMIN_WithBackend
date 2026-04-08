import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL in environment variables");
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in environment variables");
}

// Use service role key for backend operations (bypasses RLS), fall back to anon key
const key = supabaseServiceKey || supabaseAnonKey!;
export const supabase = createClient(supabaseUrl, key);
