import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { updateModule } from '../../actions';

interface PageProps {
  params: { id: string };
}

export default async function EditModulePage({ params }: PageProps) {
  // 1. Fetch the existing data for this module
  const { data: module } = await supabase
    .from('Module')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!module) {
    return <p>Module not found.</p>;
  }

  // 2. Bind the module's ID to the update action
  const updateModuleWithId = updateModule.bind(null, module.id);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Edit Module</h1>

        {/* 3. The form calls the bound action */}
        <form action={updateModuleWithId} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 font-bold mb-2">Title</label>
            {/* 4. Use 'defaultValue' to pre-fill the form */}
            <input type="text" id="title" name="title" required defaultValue={module.title} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="subtitle" className="block text-gray-300 font-bold mb-2">Subtitle</label>
            <input type="text" id="subtitle" name="subtitle" required defaultValue={module.subtitle} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-300 font-bold mb-2">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" required defaultValue={module.imageUrl} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-300 font-bold mb-2">Category</label>
            <select id="category" name="category" required defaultValue={module.category} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Anxiety</option>
              <option>Stress</option>
              <option>Growth</option>
              <option>Relationships</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/modules" className="text-gray-400 hover:text-white">Cancel</Link>
            <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-400">
              Update Module
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}