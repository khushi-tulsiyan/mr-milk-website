import { createClient } from '@supabase/supabase-js';

// Public (anon) client. Row Level Security limits it to the signed-in
// customer's own profile and orders. Null when Supabase isn't configured,
// in which case account features are hidden and checkout works as guest.
const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
