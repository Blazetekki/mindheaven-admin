'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  DocumentTextIcon, PhotoIcon, ArrowPathIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [authorName, setAuthorName] = useState(''); // Store the Name here
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. Fetch YOUR Profile Name
      const { data: profile } = await supabase
        .from('Profile')
        .select('fullName')
        .eq('id', user.id)
        .single();

      if (profile) setAuthorName(profile.fullName);

      // 2. Fetch Articles
      const { data, error } = await supabase
        .from('Article')
        .select('*')
        .eq('author', user.id)
        .order('createdAt', { ascending: false });

      if (error) {
        toast.error('Failed to load articles');
      } else {
        setArticles(data || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const toastId = toast.loading('Deleting...');

    const { error } = await supabase.from('Article').delete().eq('id', id);

    if (error) {
      toast.error('Error deleting: ' + error.message, { id: toastId });
    } else {
      toast.success('Article deleted', { id: toastId });
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  };

  if (loading && articles.length === 0) {
    return <div className="p-10 text-center text-teal-600 animate-pulse">Loading Library...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
          <p className="text-gray-500 mt-1">Manage your contributions.</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={fetchArticles} className="p-2 text-gray-500 hover:text-teal-600 rounded-lg">
                <ArrowPathIcon className="w-5 h-5" />
            </button>
            <Link href="/therapist-admin/articles/new" className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-sm">
                <PlusIcon className="w-5 h-5 mr-2" />
                Write New Article
            </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
          <p className="text-gray-500">Share your knowledge by writing your first article.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">

              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><PhotoIcon className="w-10 h-10 text-gray-300" /></div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 px-2 py-0.5 rounded text-xs font-bold text-teal-700 uppercase">
                  {article.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>

                {/* --- DISPLAY AUTHOR NAME HERE --- */}
                <div className="flex items-center space-x-2 mb-4">
                    <UserCircleIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                        {authorName || 'Loading...'}
                    </span>
                </div>

                <div className="text-gray-500 text-sm line-clamp-3 flex-1">
                  {/* Strip HTML tags for preview */}
                  {article.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                  <span className="text-xs text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <Link href={`/therapist-admin/articles/${article.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(article.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}