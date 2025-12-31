import Link from 'next/link';
import { addModule } from '@/app/admin/(dashboard)/modules/actions'; // This line was missing or incorrect

export default function NewModulePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Add New Module</h1>

        <form action={addModule} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 font-bold mb-2">Title</label>
            <input type="text" id="title" name="title" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="subtitle" className="block text-gray-300 font-bold mb-2">Subtitle (e.g., '5 Lessons')</label>
            <input type="text" id="subtitle" name="subtitle" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-300 font-bold mb-2">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-300 font-bold mb-2">Category</label>
            <select id="category" name="category" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Anxiety</option>
              <option>Stress</option>
              <option>Growth</option>
              <option>Relationships</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/modules" className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Save Module
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}