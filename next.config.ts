/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this block to fix the Supabase import errors
  transpilePackages: [
    '@supabase/functions-js',
    '@supabase/gotrue-js',
    '@supabase/postgrest-js',
    '@supabase/realtime-js',
    '@supabase/storage-js',
    '@supabase/supabase-js',
  ],
};

export default nextConfig;