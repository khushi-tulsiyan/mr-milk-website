const { createClient } = require('@supabase/supabase-js');

// Server-side client using the service role key: bypasses RLS, so it must
// never be exposed to the browser. Returns null when Supabase isn't configured.
let client;
function getSupabase() {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
  if (!client) console.warn('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set; orders will not be stored');
  return client;
}

// Resolves the signed-in customer from "Authorization: Bearer <access token>".
async function getUserId(req) {
  const supabase = getSupabase();
  const header = req.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!supabase || !token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user?.id || null;
}

module.exports = { getSupabase, getUserId };
