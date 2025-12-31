import Link from 'next/link';
import { addLessonStep } from '@/app/admin/(dashboard)/modules/actions';

interface PageProps {
  params: { id: string; lessonId: string };
}

export default function NewLessonStepPage({ params }: PageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Add New Lesson Step</h1>

        <form action={addLessonStep} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {/* Hidden inputs to send the IDs */}
          <input type="hidden" name="moduleId" value={params.id} />
          <input type="hidden" name="lessonId" value={params.lessonId} />

          <div className="mb-4">
            <label htmlFor="order" className="block text-gray-300 font-bold mb-2">Step Order (e.g., 1, 2, 3)</label>
            <input type="number" id="order" name="order" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-300 font-bold mb-2">Step Type</label>
            <select id="type" name="type" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="TEXT">Text</option>
              <option value="PROMPT">Journal Prompt</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-300 font-bold mb-2">Content</label>
            <textarea id="content" name="content" rows={4} required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="promptQuestion" className="block text-gray-300 font-bold mb-2">Prompt Question (optional)</label>
            <input type="text" id="promptQuestion" name="promptQuestion" className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href={`/admin/modules/${params.id}/lessons/${params.lessonId}`} className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Save Step
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}