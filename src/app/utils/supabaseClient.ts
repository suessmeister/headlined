// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const NEXT_PUBLIC_SUPABASE_URL = "https://jtatenmkirjneiwtkgyn.supabase.co";
const NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YXRlbm1raXJqbmVpd3RrZ3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTY3MTksImV4cCI6MjA2MTQzMjcxOX0.WBP_vFaRBeeDNDJyXDn5THcaBEf0YCZfXoqX66-buAI";



export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);


