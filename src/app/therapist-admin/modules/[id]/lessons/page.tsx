'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon, TrashIcon, BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ModuleLessonsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;

  const [moduleTitle, setModuleTitle] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch Module Info & Lessons
  const fetchData = async () => {
    setLoading(true);

    // Get Module Title
    const { data: moduleData } = await supabase.from('Module').select('title').eq('id', moduleId).single();
    if (moduleData) setModuleTitle(moduleData.title);

    // Get Lessons (Matches schema "moduleId" and "order")
    const { data: lessonData, error } = await supabase
      .from('Lesson')
      .select('*')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true });

    if (error) toast.error('Error loading lessons');
    else setLessons(lessonData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  // Create New Lesson
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setCreating(true);

    try {
      const nextOrder = lessons.length + 1;

      const { data, error } = await supabase.from('Lesson').insert({
        title: newLessonTitle,
        "moduleId": moduleId,
        "order": nextOrder
      }).select();

      if (error) throw error;

      toast.success('Lesson created!');
      setNewLessonTitle('');
      setLessons([...lessons, data[0]]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  // Delete Lesson
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson and all its steps?')) return;

    const { error } = await supabase.from('Lesson').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted');
      setLessons(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.push('/therapist-admin/modules')} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Modules
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          <span className="text-gray-400 font-normal">Module:</span> {moduleTitle}
        </h1>
        <p className="text-gray-500 mt-1">Manage the lessons for this module.</p>
      </div>

      {/* Add Lesson Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Add New Lesson</h3>
        <form onSubmit={handleCreateLesson} className="flex gap-4">
          <input
            type="text"
            placeholder="e.g. Lesson 1: Understanding Triggers"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={creating || !newLessonTitle}
            className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Adding...' : 'Add Lesson'}
          </button>
        </form>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10 text-gray-400">Loading lessons...</div>
        ) : lessons.length === 0 ? (
           <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
             <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
             <p className="text-gray-500">No lessons yet.</p>
           </div>
        ) : (
          lessons.map((lesson, index) => (
            <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between group hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{lesson.title}</h4>
                  <p className="text-xs text-gray-500">
                     Created {new Date(lesson.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/therapist-admin/modules/${moduleId}/lessons/${lesson.id}`}
                  className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Edit Content
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                <button onClick={() => handleDelete(lesson.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}