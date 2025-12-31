'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ForumThreadsPage() {
  const params = useParams();
  const router = useRouter();
  const forumId = params.forumId as string;

  const [forumTitle, setForumTitle] = useState('');
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Get Forum Title
      const { data: fData } = await supabase.from('Forum').select('title').eq('id', forumId).single();
      if (fData) setForumTitle(fData.title);

      // 2. Get Threads with Author Details
      const { data: tData, error } = await supabase
        .from('Thread')
        .select(`
          *,
          author:Profile!authorId (fullName, avatarUrl)
        `)
        .eq('forumId', forumId)
        .order('createdAt', { ascending: false });

      if (error) {
        toast.error('Error loading threads');
      } else {
        setThreads(tData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [forumId]);

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.push('/therapist-admin/community')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Forums
      </button>

      <div className="flex justify-between items-end mb-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">{forumTitle || 'Loading...'}</h1>
            <p className="text-gray-500">Recent discussions in this category.</p>
         </div>
      </div>

      <div className="space-y-3">
        {loading ? (
             <div className="text-center py-10 text-teal-600 animate-pulse">Loading Threads...</div>
        ) : threads.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No discussions yet.</p>
             </div>
        ) : (
            threads.map(thread => (
                <div key={thread.id} className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <Link href={`/therapist-admin/community/thread/${thread.id}`} className="flex-1 group">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-1">
                                {thread.title}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-1 mb-3">
                                {thread.originalPost}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <UserCircleIcon className="w-4 h-4" />
                                <span>Posted by {thread.author?.fullName || 'User'}</span>
                                <span>•</span>
                                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}