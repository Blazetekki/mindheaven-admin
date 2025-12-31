'use server';

import { supabaseAdmin } from '@/lib/supabasejournal';
import { revalidatePath } from 'next/cache';

export async function deleteJournalEntry(formData: FormData) {
  const journalId = formData.get('journalId') as string;
  if (!journalId) return;

  const { error } = await supabase.from('JournalEntry').delete().eq('id', journalId);

  if (error) {
    console.error('Error deleting journal entry:', error);
  }

  revalidatePath('/admin/journals');
}