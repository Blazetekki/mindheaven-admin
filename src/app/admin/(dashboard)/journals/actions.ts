'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function deleteJournalEntry(formData: FormData) {
  // 1. Initialize INSIDE the function (Lazy Initialization)
  // This prevents the "supabaseUrl is required" error during build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Environment Variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. Run the logic
  const journalId = formData.get('id') as string || formData.get('journalId') as string;

  if (!journalId) return;

  const { error } = await supabase.from('JournalEntry').delete().eq('id', journalId);

  if (error) {
    console.error('Error deleting journal entry:', error);
  }

  revalidatePath('/admin/journals');
}