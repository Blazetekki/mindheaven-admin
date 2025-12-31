import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { updateLesson } from '../../../../actions';

interface PageProps {
  params: { id: string; lessonId: string };
}

export default async function EditLessonPage({ params }: PageProps) {
  // 1. Fetch the existing data for this lesson
  const { data: lesson } = await supabase
    .from('Lesson')
    .select('*')
    .eq('id', params.lessonId)
    .single();

  if (!lesson) {
    return <p>Lesson not found.</p>;
  }

  // 2. Bind the module and lesson IDs to the update action
  const updateLessonWithIds = updateLesson.bind(null, params.id, lesson.id);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Edit Lesson</h1>

        <form action={updateLessonWithIds} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 font-bold mb-2">Lesson Title</label>
            <input type="text" id="title" name="title" required defaultValue={lesson.title} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="order" className="block text-gray-300 font-bold mb-2">Order</label>
            <input type="number" id="order" name="order" required defaultValue={lesson.order} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href={`/admin/modules/${params.id}`} className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-400">
              Update Lesson
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}