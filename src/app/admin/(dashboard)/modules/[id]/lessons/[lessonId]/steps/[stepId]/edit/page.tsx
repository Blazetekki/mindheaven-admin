import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { updateLessonStep } from '../../../../../../actions';

interface PageProps {
  params: { id: string; lessonId: string; stepId: string };
}

export default async function EditLessonStepPage({ params }: PageProps) {
  // 1. Fetch the existing data for this step
  const { data: step } = await supabase
    .from('LessonStep')
    .select('*')
    .eq('id', params.stepId)
    .single();

  if (!step) {
    return <p>Lesson Step not found.</p>;
  }

  // 2. Bind all necessary IDs to the update action
  const updateStepWithIds = updateLessonStep.bind(null, params.id, params.lessonId, step.id);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Edit Lesson Step</h1>

        <form action={updateStepWithIds} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="order" className="block text-gray-300 font-bold mb-2">Step Order</label>
            <input type="number" id="order" name="order" required defaultValue={step.order} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-300 font-bold mb-2">Step Type</label>
            <select id="type" name="type" required defaultValue={step.type} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="TEXT">Text</option>
              <option value="PROMPT">Journal Prompt</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-300 font-bold mb-2">Content</label>
            <textarea id="content" name="content" rows={4} required defaultValue={step.content} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="promptQuestion" className="block text-gray-300 font-bold mb-2">Prompt Question (optional)</label>
            <input type="text" id="promptQuestion" name="promptQuestion" defaultValue={step.promptQuestion || ''} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href={`/admin/modules/${params.id}/lessons/${params.lessonId}`} className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-400">
              Update Step
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}