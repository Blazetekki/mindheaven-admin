import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { deleteThread } from '../actions';

export default async function ForumDetailPage({ params }: { params: { id: string } }) {
  const { data: forum, error } = await supabaseAdmin
    .from('Forum')
    .select('*, threads:Thread(*, author:Profile(fullName))')
    .eq('id', params.id)
    .single();

  if (error || !forum) {
    return <p>Error loading forum details.</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl">
        <Link href="/admin/community" className="text-yellow-400 hover:underline mb-6 block">&larr; Back to Forums</Link>
        <h1 className="text-3xl font-bold mb-6">Moderating Forum: {forum.title}</h1>

        <div className="bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4">Thread Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forum.threads?.map((thread: any) => (
                <tr key={thread.id} className="border-b border-gray-700">
                  <td className="p-4">{thread.title}</td>
                  <td className="p-4 text-gray-400">{thread.author?.fullName || 'N/A'}</td>
                  <td className="p-4 text-gray-400">{new Date(thread.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-4 items-center">
                      <Link href={`/admin/community/${params.id}/threads/${thread.id}`} className="text-blue-400 hover:underline">
    View Comments
  </Link>
                      <form action={deleteThread}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <input type="hidden" name="forumId" value={params.id} />
                        <button type="submit" className="text-red-400 hover:underline">Delete Post</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {forum.threads?.length === 0 && <p className="p-4 text-center text-gray-500">No threads in this forum yet.</p>}
        </div>
      </div>
    </main>
  );
}