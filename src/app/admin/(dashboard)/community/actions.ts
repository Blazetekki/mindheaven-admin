'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Helper to get the admin client safely
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing Supabase Admin Keys");
  return createClient(url, key);
}

export async function addForum(formData: FormData) {
  const supabaseAdmin = getAdminClient();
  const forumData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string,
  };

  const { error } = await supabaseAdmin.from('Forum').insert([forumData]);
  if (error) console.error('Error adding forum:', error);
  revalidatePath('/admin/community');
  redirect('/admin/community');
}

export async function deleteForum(formData: FormData) {
  const supabaseAdmin = getAdminClient();
  const forumId = formData.get('forumId') as string;
  if (!forumId) return;

  const { error } = await supabaseAdmin.from('Forum').delete().eq('id', forumId);
  if (error) console.error('Error deleting forum:', error);
  revalidatePath('/admin/community');
}

export async function deleteThread(formData: FormData) {
  const supabaseAdmin = getAdminClient();
  const threadId = formData.get('threadId') as string;
  const forumId = formData.get('forumId') as string;
  if (!threadId || !forumId) return;

  const { error } = await supabaseAdmin.from('Thread').delete().eq('id', threadId);
  if (error) console.error('Error deleting thread:', error);
  revalidatePath(`/admin/community/${forumId}`);
}

export async function deleteComment(formData: FormData) {
  const supabaseAdmin = getAdminClient();
  const commentId = formData.get('commentId') as string;
  const forumId = formData.get('forumId') as string;
  const threadId = formData.get('threadId') as string;
  if (!commentId) return;

  const { error } = await supabaseAdmin.from('Comment').delete().eq('id', commentId);
  if (error) console.error('Error deleting comment:', error);
  revalidatePath(`/admin/community/${forumId}/threads/${threadId}`);
}

export async function updateForum(forumId: string, formData: FormData) {
  const supabaseAdmin = getAdminClient();
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