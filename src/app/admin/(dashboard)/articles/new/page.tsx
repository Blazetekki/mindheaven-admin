import Link from 'next/link';
import { addArticle } from '../actions'; // We will create this action next

export default function NewArticlePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Add New Article</h1>

        <form action={addArticle} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 font-bold mb-2">Title</label>
            <input type="text" id="title" name="title" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="author" className="block text-gray-300 font-bold mb-2">Author</label>
            <input type="text" id="author" name="author" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-300 font-bold mb-2">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="category" className="block text-gray-300 font-bold mb-2">Category</label>
              <select id="category" name="category" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option>Christian</option>
                <option>Muslim</option>
                <option>Yoruba Spirituality</option>
                <option>Philosophy</option>
              </select>
            </div>
            <div className="w-1/2">
              <label htmlFor="readTime" className="block text-gray-300 font-bold mb-2">Read Time (minutes)</label>
              <input type="number" id="readTime" name="readTime" required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-300 font-bold mb-2">Content</label>
            <textarea id="content" name="content" rows={10} required className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/articles" className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Save Article
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}