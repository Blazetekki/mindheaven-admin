'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; // This was the missing import

export async function deleteArticle(formData: FormData) {
  const articleId = formData.get('articleId') as string;
  if (!articleId) return;

  const { error } = await supabase.from('Article').delete().eq('id', articleId);
  if (error) console.error('Error deleting article:', error);

  revalidatePath('/admin/articles');
}

export async function addArticle(formData: FormData) {
  const articleData = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    imageUrl: formData.get('imageUrl') as string,
    category: formData.get('category') as string,
    readTime: parseInt(formData.get('readTime') as string, 10),
    content: formData.get('content') as string,
  };

  const { error } = await supabase.from('Article').insert([articleData]);

  if (error) {
    console.error('Error adding article:', error);
    return;
  }

  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}

export async function updateArticle(articleId: string, formData: FormData) {
    if (!articleId) return;

    const articleData = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      imageUrl: formData.get('imageUrl') as string,
      category: formData.get('category') as string,
      readTime: parseInt(formData.get('readTime') as string, 10),
      content: formData.get('content') as string,
    };

    const { error } = await supabase
      .from('Article')
      .update(articleData)
      .eq('id', articleId);

    if (error) {
      console.error('Error updating article:', error);
      return;
    }

    revalidatePath('/admin/articles');
    redirect('/admin/articles?status=success');
  }

  // --- ADD THIS deleteComment FUNCTION ---
export async function deleteComment(formData: FormData) {
  const commentId = formData.get('commentId') as string;
  const articleId = formData.get('articleId') as string;
  if (!commentId || !articleId) return;

  const { error } = await supabase.from('ArticleComment').delete().eq('id', commentId);
  if (error) {
    console.error('Error deleting comment:', error);
  }

  // Refresh the data on the comments page
  revalidatePath(`/admin/articles/${articleId}/comments`);
}