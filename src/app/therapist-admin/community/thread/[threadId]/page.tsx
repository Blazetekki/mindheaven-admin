'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon, UserCircleIcon, TrashIcon, PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch Thread + Comments
  const fetchData = async () => {
    setLoading(true);

    // 1. Thread Data
    const { data: tData } = await supabase
      .from('Thread')
      .select(`*, author:Profile!authorId (fullName, avatarUrl)`)
      .eq('id', threadId)
      .single();

    setThread(tData);

    // 2. Comments Data
    const { data: cData } = await supabase
      .from('Comment')
      .select(`*, author:Profile!authorId (fullName, avatarUrl, specialty)`)
      .eq('threadId', threadId) // Quoted "threadId"
      .order('createdAt', { ascending: true });

    setComments(cData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [threadId]);

  // Submit Reply
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { error } = await supabase.from('Comment').insert({
            content: reply,
            "threadId": threadId, // Quoted
            "authorId": user.id   // Quoted
        });

        if (!error) {
            toast.success('Reply sent');
            setReply('');
            fetchData(); // Refresh
        } else {
            toast.error('Failed to send reply');
        }
    }
    setSending(false);
  };

  // Delete Comment (Moderation)
  const handleDeleteComment = async (id: string) => {
      const { error } = await supabase.from('Comment').delete().eq('id', id);
      if (!error) {
          toast.success('Comment deleted');
          setComments(prev => prev.filter(c => c.id !== id));
      }
  };

  if (loading) return <div className="p-10 text-center text-teal-600 animate-pulse">Loading Discussion...</div>;
  if (!thread) return <div className="p-10 text-center">Thread not found.</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back
      </button>

      {/* ORIGINAL POST */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
         <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>

         <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {thread.author?.avatarUrl ? (
                    <img src={thread.author.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                    <UserCircleIcon className="w-full h-full text-gray-400" />
                )}
            </div>
            <div>
                <p className="font-bold text-gray-900 text-sm">{thread.author?.fullName}</p>
                <p className="text-xs text-gray-500">{new Date(thread.createdAt).toLocaleString()}</p>
            </div>
         </div>

         <div className="prose text-gray-800">
             {thread.originalPost}
         </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="space-y-6">
         <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Comments ({comments.length})</h3>

         {comments.map((comment) => (
             <div key={comment.id} className="flex gap-4">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden mt-1">
                    {comment.author?.avatarUrl ? (
                        <img src={comment.author.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-full h-full text-gray-400" />
                    )}
                 </div>

                 <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-4 relative group">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{comment.author?.fullName}</span>
                            {/* Highlight Therapist Replies */}
                            {comment.author?.specialty && (
                                <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                    Therapist
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>

                    {/* Delete Button */}
                    <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Comment"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                 </div>
             </div>
         ))}
      </div>

      {/* REPLY BOX */}
      <div className="mt-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky bottom-4">
         <form onSubmit={handleReply} className="flex gap-2">
            <input
               type="text"
               placeholder="Write a supportive reply..."
               className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
               value={reply}
               onChange={e => setReply(e.target.value)}
            />
            <button
               type="submit"
               disabled={sending || !reply}
               className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
               <PaperAirplaneIcon className="w-5 h-5" />
            </button>
         </form>
      </div>

    </div>
  );
}