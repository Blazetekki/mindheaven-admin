import Link from 'next/link';
import { addForum } from '../actions';

export default function NewForumPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Add New Forum</h1>
        <form action={addForum} className="bg-gray-800 p-8 rounded-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 font-bold mb-2">Title</label>
            <input type="text" id="title" name="title" required className="w-full p-3 bg-gray-700 rounded" />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 font-bold mb-2">Description</label>
            <textarea id="description" name="description" rows={3} required className="w-full p-3 bg-gray-700 rounded"></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="icon" className="block text-gray-300 font-bold mb-2">Icon Name (e.g., shield-outline)</label>
            <input type="text" id="icon" name="icon" required className="w-full p-3 bg-gray-700 rounded" />
          </div>
          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/community" className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded">Save Forum</button>
          </div>
        </form>
      </div>
    </main>
  );
}