'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addForum(formData: FormData) {
  const forumData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string,
  };
  const { error } = await supabase.from('Forum').insert([forumData]);
  if (error) console.error('Error adding forum:', error);
  revalidatePath('/admin/community');
  redirect('/admin/community');
}

export async function deleteForum(formData: FormData) {
  const forumId = formData.get('forumId') as string;
  if (!forumId) return;
  const { error } = await supabase.from('Forum').delete().eq('id', forumId);
  if (error) console.error('Error deleting forum:', error);
  revalidatePath('/admin/community');
}

// --- ADD THIS NEW FUNCTION ---
export async function deleteThread(formData: FormData) {
  const threadId = formData.get('threadId') as string;
  const forumId = formData.get('forumId') as string;
  if (!threadId || !forumId) return;

  const { error } = await supabaseAdmin.from('Thread').delete().eq('id', threadId);
  if (error) {
    console.error('Error deleting thread:', error);
  }

  revalidatePath(`/admin/community/${forumId}`);
}

// --- ADD THIS NEW FUNCTION ---
export async function deleteComment(formData: FormData) {
  const commentId = formData.get('commentId') as string;
  const forumId = formData.get('forumId') as string;
  const threadId = formData.get('threadId') as string;
  if (!commentId) return;

  const { error } = await supabaseAdmin.from('Comment').delete().eq('id', commentId);
  if (error) console.error('Error deleting comment:', error);

  revalidatePath(`/admin/community/${forumId}/threads/${threadId}`);
}

// --- ADD THIS NEW FUNCTION ---
export async function updateForum(forumId: string, formData: FormData) {
  if (!forumId) return;

  const forumData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string,
  };

  const { error } = await supabaseAdmin.from('Forum').update(forumData).eq('id', forumId);
  if (error) {
    console.error('Error updating forum:', error);
    return;
  }

  revalidatePath('/admin/community');
  redirect('/admin/community');
}