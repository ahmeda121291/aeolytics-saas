import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Check if environment variables contain the original placeholder values
if (supabaseUrl === 'your_supabase_project_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error(
    'Supabase credentials are not configured. Please:\n' +
    '1. Replace placeholder values in your .env file with actual Supabase credentials\n' +
    '2. Get your project URL and anon key from your Supabase dashboard\n' +
    '3. Restart your development server after updating the .env file'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error(
    `Invalid Supabase URL format: "${supabaseUrl}"\n` +
    'Please ensure VITE_SUPABASE_URL is a valid URL (e.g., https://your-project.supabase.co)'
  );
}

// Check if using development placeholder credentials
const isUsingPlaceholderCredentials = 
  supabaseUrl.includes('placeholder-project-id') || 
  supabaseAnonKey.includes('placeholder-anon-key');

if (isUsingPlaceholderCredentials) {
  console.warn(
    '🚧 DEVELOPMENT MODE: Using placeholder Supabase credentials.\n' +
    'To connect to your actual Supabase project:\n' +
    '1. Go to https://app.supabase.com\n' +
    '2. Select your project\n' +
    '3. Go to Settings > API\n' +
    '4. Copy your Project URL and anon/public key\n' +
    '5. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file\n' +
    '6. Restart your development server'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});