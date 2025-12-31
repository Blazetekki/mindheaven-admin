import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkayaflbojmrnsftyvbi.supabase.co'; // Paste your Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXlhZmxib2ptcm5zZnR5dmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDEwODIsImV4cCI6MjA3NDkxNzA4Mn0._3E09iRRoM0HNBoy13zNx5P09hoHOGWnGqIuEx_Rrp0'; // Paste your anon public Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
