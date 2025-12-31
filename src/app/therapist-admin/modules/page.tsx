'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  PlusIcon, RectangleStackIcon, PhotoIcon,
  PencilSquareIcon, TrashIcon, ListBulletIcon,
  UserCircleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ModulesListPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [authorName, setAuthorName] = useState('Therapist'); // Default name
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. Fetch Your Name from Profile
      const { data: profile } = await supabase
        .from('Profile')
        .select('fullName')
        .eq('id', user.id)
        .single();

      if (profile?.fullName) {
        setAuthorName(profile.fullName);
      }

      // 2. Fetch Your Modules
      const { data, error } = await supabase
        .from('Module')
        .select('*')
        .eq('author', user.id) // Ensure SQL 'ALTER TABLE' was run
        .order('createdAt', { ascending: false });

      if (error) {
        // console.error(error);
        toast.error('Error loading modules');
      } else {
        setModules(data || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this module? All lessons inside it will be lost.')) return;
    const toastId = toast.loading('Deleting...');

    const { error } = await supabase.from('Module').delete().eq('id', id);

    if (error) {
      toast.error('Error: ' + error.message, { id: toastId });
    } else {
      toast.success('Module deleted', { id: toastId });
      setModules(prev => prev.filter(m => m.id !== id));
    }
  };

  if (loading && modules.length === 0) {
    return <div className="p-10 text-center text-teal-600 animate-pulse">Loading Library...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning Modules</h1>
          <p className="text-gray-500 mt-1">Create courses and series for your patients.</p>
        </div>
        <div className="flex gap-3">
          <button
             onClick={fetchModules}
             className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
             title="Refresh"
          >
             <ArrowPathIcon className="w-5 h-5" />
          </button>
          <Link
            href="/therapist-admin/modules/new"
            className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Module
          </Link>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <RectangleStackIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No modules yet</h3>
          <p className="text-gray-500">Create a module to start adding lessons.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">

              {/* Cover Image */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {mod.imageUrl ? (
                  <img src={mod.imageUrl} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full"><PhotoIcon className="w-10 h-10 text-gray-300" /></div>
                )}
                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-teal-700 uppercase shadow-sm">
                  {mod.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{mod.title}</h3>

                {/* Author Name Display */}
                <div className="flex items-center gap-1.5 mb-3">
                   <UserCircleIcon className="w-4 h-4 text-gray-400" />
                   <span className="text-xs font-medium text-gray-500">By {authorName}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                  {mod.subtitle || 'No subtitle provided.'}
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/therapist-admin/modules/${mod.id}/lessons`}
                    className="flex items-center justify-center w-full py-2.5 bg-teal-50 text-teal-700 font-bold text-sm rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <ListBulletIcon className="w-5 h-5 mr-2" />
                    Manage Lessons
                  </Link>

                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-xs text-gray-400 font-medium">
                        {new Date(mod.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-1">
                        <Link href={`/therapist-admin/modules/${mod.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Edit">
                            <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(mod.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors" title="Delete">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
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