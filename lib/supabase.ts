import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create the client if we have valid credentials
// This runs at module load time, but with dynamic imports, this module
// is only loaded on the client side
const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

export { supabase };

export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
