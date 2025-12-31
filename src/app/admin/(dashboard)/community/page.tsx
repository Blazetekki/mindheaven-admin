import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { deleteForum } from './actions';

export default async function ManageCommunityPage() {
  const { data: forums, error } = await supabaseAdmin.from('Forum').select('*, threads(count)');

  if (error) {
    return <p className="p-24 text-red-500">Error loading forums: {error.message}</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Community Forums</h1>
          <Link href="/admin/community/new">
            <button className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded">Add New Forum</button>
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4">Forum Title</th>
                <th className="p-4">Thread Count</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forums?.map((forum: any) => (
                <tr key={forum.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4">
                    <Link href={`/admin/community/${forum.id}`} className="hover:text-yellow-400 hover:underline">{forum.title}</Link>
                  </td>
                  <td className="p-4 text-gray-400">{forum.threads[0]?.count || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-4 items-center">
                      <Link href={`/admin/community/${forum.id}/edit`} className="text-green-400 hover:underline">Edit</Link>
                      <form action={deleteForum}>
                        <input type="hidden" name="forumId" value={forum.id} />
                        <button type="submit" className="text-red-400 hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {forums?.length === 0 && <p className="p-4 text-center text-gray-500">No forums found in the database.</p>}
        </div>
      </div>
    </main>
  );
}