// src/lib/supabase-admin.js
// This is ONLY for backend Node.js scripts (like import-data.js)

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '❌ Missing Supabase credentials!\n' +
    'Make sure .env.local has:\n' +
    '  - NEXT_PUBLIC_SUPABASE_URL\n' +
    '  - SUPABASE_SERVICE_ROLE_KEY'
  );
}

// Create admin client with SERVICE ROLE key (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase: supabaseAdmin };