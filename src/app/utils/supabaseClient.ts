// utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON;

if (!NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}
if (!NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON environment variable");
}

export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL as string,
  NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);
