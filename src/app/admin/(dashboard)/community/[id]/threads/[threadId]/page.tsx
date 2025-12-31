import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { deleteComment } from '../../../actions';

export default async function ManageCommentsPage({ params }: { params: { id: string; threadId: string } }) {
  const { data: thread, error } = await supabaseAdmin
    .from('Thread')
    .select('title, comments:Comment(*, author:Profile(fullName))')
    .eq('id', params.threadId)
    .single();

  if (error || !thread) {
    return <p>Error loading thread comments.</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <Link href={`/admin/community/${params.id}`} className="text-yellow-400 hover:underline mb-6 block">&larr; Back to threads</Link>
        <h1 className="text-3xl font-bold mb-2">Moderating Comments</h1>
        <p className="text-gray-400 mb-6">For thread: "{thread.title}"</p>

        <div className="bg-gray-800 rounded-lg shadow">
          <ul className="divide-y divide-gray-700">
            {thread.comments?.map((comment: any) => (
              <li key={comment.id} className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-bold text-teal-400">{comment.author?.fullName || 'Anonymous'}</p>
                  <p className="text-gray-300 mt-1">{comment.content}</p>
                </div>
                <form action={deleteComment}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="threadId" value={params.threadId} />
                  <input type="hidden" name="forumId" value={params.id} />
                  <button type="submit" className="text-red-400 hover:underline">Delete</button>
                </form>
              </li>
            ))}
          </ul>
          {thread.comments?.length === 0 && <p className="p-4 text-center text-gray-500">No comments on this thread yet.</p>}
        </div>
      </div>
    </main>
  );
}