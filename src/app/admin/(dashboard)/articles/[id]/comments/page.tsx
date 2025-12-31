import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { deleteComment } from '../../actions';

interface PageProps {
  params: { id: string }; // Article ID
}

export default async function ManageCommentsPage({ params }: PageProps) {
  const { data: comments, error } = await supabase
    .from('ArticleComment')
    .select('*, author:Profile(fullName)')
    .eq('articleId', params.id);

  if (error) {
    return <p>Error loading comments: {error.message}</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <Link href={`/admin/articles`} className="text-yellow-400 hover:underline mb-6 block">&larr; Back to articles</Link>
        <h1 className="text-3xl font-bold mb-6">Manage Comments</h1>

        <div className="bg-gray-800 rounded-lg shadow">
          <ul className="divide-y divide-gray-700">
            {comments?.map((comment: any) => (
              <li key={comment.id} className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-bold text-teal-400">{comment.author?.fullName || 'Anonymous'}</p>
                  <p className="text-gray-300 mt-1">{comment.content}</p>
                </div>
                <form action={deleteComment}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="articleId" value={params.id} />
                  <button type="submit" className="text-red-400 hover:underline">Delete</button>
                </form>
              </li>
            ))}
          </ul>
          {comments?.length === 0 && <p className="p-4 text-center text-gray-500">No comments yet.</p>}
        </div>
      </div>
    </main>
  );
}