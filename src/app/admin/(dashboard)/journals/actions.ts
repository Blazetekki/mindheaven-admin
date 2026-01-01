'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize the Admin Client
// This defines 'supabase' so the rest of your code works.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function deleteJournalEntry(formData: FormData) {
  const journalId = formData.get('id') as string || formData.get('journalId') as string;

  if (!journalId) return;

  const { error } = await supabase.from('JournalEntry').delete().eq('id', journalId);

  if (error) {
    console.error('Error deleting journal entry:', error);
  }

  revalidatePath('/admin/journals');
}