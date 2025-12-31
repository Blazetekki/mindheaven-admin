import Link from 'next/link';
import { addLesson } from '../../actions'; // We will create this action next

interface PageProps {
  params: { id: string }; // We get the module ID from the URL
}

export default function NewLessonPage({ params }: PageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Add New Lesson</h1>

        <form action={addLesson} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {/* Hidden input to send the moduleId */}
          <input type="hidden" name="moduleId" value={params.id} />

          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 font-bold mb-2">Lesson Title</label>
            <input type="text" id="title" name="title" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="order" className="block text-gray-300 font-bold mb-2">Order (e.g., 1, 2, 3)</label>
            <input type="number" id="order" name="order" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href={`/admin/modules/${params.id}`} className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}