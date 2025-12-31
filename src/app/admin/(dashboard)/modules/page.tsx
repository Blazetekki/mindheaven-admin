'use client'; // This page needs to be a client component to handle notifications

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { deleteModule } from './actions';
import toast from 'react-hot-toast';

// Define the type for a module
interface Module {
  id: string;
  title: string;
  category: string;
  subtitle: string;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // This effect checks the URL for a success message and shows a toast
  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      toast.success('Module updated successfully!');
    }
  }, [searchParams]);

  // This effect fetches the data on the client
  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('Module').select('*');
      if (data) setModules(data);
      setLoading(false);
    };
    fetchModules();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Modules</h1>
          <Link href="/admin/modules/new">
            <button className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Add New Module
            </button>
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Subtitle</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules?.map((module) => (
                <tr key={module.id} className="border-b border-gray-700 hover:bg-gray-700/ ৫০">
                  <td className="p-4">
                    <Link href={`/admin/modules/${module.id}`} className="hover:text-yellow-400 hover:underline">
                      {module.title}
                    </Link>
                  </td>
                  <td className="p-4">{module.category}</td>
                  <td className="p-4">{module.subtitle}</td>
                  <td className="p-4">
                    <div className="flex gap-4 items-center">
                      <Link href={`/admin/modules/${module.id}/edit`} className="text-green-400 hover:underline">
                        Edit
                      </Link>
                      <form action={deleteModule}>
                        <input type="hidden" name="moduleId" value={module.id} />
                        <button type="submit" className="text-red-400 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-center p-4">Loading modules...</p>}
        </div>
      </div>
    </main>
  );
}