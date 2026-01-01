'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Helper to get the admin client safely inside functions
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing Supabase Admin Keys");
  return createClient(url, key);
}

export async function addModule(formData: FormData) {
  const supabase = getAdminClient();
  const moduleData = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    imageUrl: formData.get('imageUrl') as string,
    category: formData.get('category') as string,
  };
  const { error } = await supabase.from('Module').insert([moduleData]);
  if (error) console.error('Error adding module:', error);
  revalidatePath('/admin/modules');
  redirect('/admin/modules');
}

export async function updateModule(moduleId: string, formData: FormData) {
  const supabase = getAdminClient();
  if (!moduleId) return;
  const moduleData = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    imageUrl: formData.get('imageUrl') as string,
    category: formData.get('category') as string,
  };
  const { error } = await supabase.from('Module').update(moduleData).eq('id', moduleId);
  if (error) console.error('Error updating module:', error);
  revalidatePath('/admin/modules');
  revalidatePath(`/admin/modules/${moduleId}`);
  redirect('/admin/modules?status=success');
}

export async function deleteModule(formData: FormData) {
  const supabase = getAdminClient();
  const moduleId = formData.get('moduleId') as string;
  if (!moduleId) return;
  const { error } = await supabase.from('Module').delete().eq('id', moduleId);
  if (error) console.error('Error deleting module:', error);
  revalidatePath('/admin/modules');
}

export async function addLesson(formData: FormData) {
  const supabase = getAdminClient();
  const moduleId = formData.get('moduleId') as string;
  const lessonData = {
    title: formData.get('title') as string,
    order: parseInt(formData.get('order') as string, 10),
    moduleId: moduleId,
  };
  const { error } = await supabase.from('Lesson').insert([lessonData]);
  if (error) console.error('Error adding lesson:', error);
  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/modules/${moduleId}`);
}

export async function deleteLesson(formData: FormData) {
  const supabase = getAdminClient();
  const lessonId = formData.get('lessonId') as string;
  const moduleId = formData.get('moduleId') as string;
  if (!lessonId || !moduleId) return;
  const { error } = await supabase.from('Lesson').delete().eq('id', lessonId);
  if (error) console.error('Error deleting lesson:', error);
  revalidatePath(`/admin/modules/${moduleId}`);
}

export async function addLessonStep(formData: FormData) {
  const supabase = getAdminClient();
  const moduleId = formData.get('moduleId') as string;
  const lessonId = formData.get('lessonId') as string;
  const stepData = {
    order: parseInt(formData.get('order') as string, 10),
    type: formData.get('type') as string,
    content: formData.get('content') as string,
    promptQuestion: (formData.get('promptQuestion') as string) || null,
    lessonId: lessonId,
  };
  const { error } = await supabase.from('LessonStep').insert([stepData]);
  if (error) console.error('Error adding lesson step:', error);
  const path = `/admin/modules/${moduleId}/lessons/${lessonId}`;
  revalidatePath(path);
  redirect(path);
}

export async function updateLesson(moduleId: string, lessonId: string, formData: FormData) {
  const supabase = getAdminClient();
  if (!lessonId || !moduleId) return;

  const lessonData = {
    title: formData.get('title') as string,
    order: parseInt(formData.get('order') as string, 10),
  };

  const { error } = await supabase
    .from('Lesson')
    .update(lessonData)
    .eq('id', lessonId);

  if (error) {
    console.error('Error updating lesson:', error);
    return;
  }

  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/modules/${moduleId}`);
}

export async function deleteLessonStep(formData: FormData) {
  const supabase = getAdminClient();
  const stepId = formData.get('stepId') as string;
  const lessonId = formData.get('lessonId') as string;
  const moduleId = formData.get('moduleId') as string;

  if (!stepId || !lessonId || !moduleId) {
    console.error('Missing ID for delete step action');
    return;
  }

  const { error } = await supabase.from('LessonStep').delete().eq('id', stepId);

  if (error) {
    console.error('Error deleting lesson step:', error);
    return;
  }

  revalidatePath(`/admin/modules/${moduleId}/lessons/${lessonId}`);
}

export async function updateLessonStep(moduleId: string, lessonId: string, stepId: string, formData: FormData) {
  const supabase = getAdminClient();
  if (!stepId || !lessonId || !moduleId) return;

  const stepData = {
    order: parseInt(formData.get('order') as string, 10),
    type: formData.get('type') as string,
    content: formData.get('content') as string,
    promptQuestion: formData.get('promptQuestion') as string || null,
  };

  const { error } = await supabase
    .from('LessonStep')
    .update(stepData)
    .eq('id', stepId);

  if (error) {
    console.error('Error updating lesson step:', error);
    return;
  }

  const path = `/admin/modules/${moduleId}/lessons/${lessonId}`;
  revalidatePath(path);
  redirect(path);
}