'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ChatBubbleLeftRightIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ForumsListPage() {
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // 1. Fetch Forums
  const fetchForums = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Forum')
      .select('*')
      .order('createdAt', { ascending: true });

    if (error) toast.error('Error loading forums');
    else setForums(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchForums();
  }, []);

  // 2. Create Forum
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setCreating(true);
    const toastId = toast.loading('Creating forum...');

    try {
      const { error } = await supabase.from('Forum').insert({
        title: newTitle,
        description: newDesc,
        icon: 'ChatBubbleLeftRightIcon'
      });

      if (error) throw error;

      toast.success('Forum created!', { id: toastId });
      setNewTitle('');
      setNewDesc('');
      fetchForums();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Community Forums</h1>

      {/* Create Forum Box */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Create New Category</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-3">
             <input
                type="text"
                placeholder="Forum Title (e.g. Anxiety Support)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
             />
             <input
                type="text"
                placeholder="Description (Optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
             />
          </div>
          <button
             type="submit"
             disabled={creating || !newTitle}
             className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 h-fit self-start md:self-center"
          >
             {creating ? 'Creating...' : 'Create Forum'}
          </button>
        </form>
      </div>

      {/* Forums List */}
      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-10 text-teal-600 animate-pulse">Loading...</div>
        ) : forums.length === 0 ? (
             <div className="text-center py-10 text-gray-400">No forums yet. Create one above.</div>
        ) : (
            forums.map(forum => (
                <div key={forum.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between hover:border-teal-300 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{forum.title}</h3>
                            <p className="text-gray-500 text-sm">{forum.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                           href={`/therapist-admin/community/${forum.id}`}
                           className="flex items-center text-sm font-bold text-teal-600 hover:underline"
                        >
                           View Threads <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}