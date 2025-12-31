'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  CalendarIcon, ClockIcon, VideoCameraIcon
} from '@heroicons/react/24/outline';

export default function SessionsListPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Sessions
  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('LiveSession')
        .select('*')
        .eq('hostId', user.id)
        .order('startTime', { ascending: true }); // Show soonest first
      setSessions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Delete Function
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this session?')) return;

    const { error } = await supabase.from('LiveSession').delete().eq('id', id);
    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      // Remove from UI immediately
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading Sessions...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Live Sessions</h1>
          <p className="text-gray-500 mt-1">View and edit your upcoming broadcasts.</p>
        </div>
        <Link
          href="/therapist-admin/sessions/new"
          className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Session
        </Link>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <VideoCameraIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No sessions scheduled</h3>
          <p className="text-gray-500">Get started by creating your first live session.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-purple-200 transition-colors">

              {/* Session Info */}
              <div className="flex-1">
                <div className="flex items-center mb-2">
                   <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-md mr-3 ${
                      new Date(session.endTime) < new Date()
                      ? 'bg-gray-100 text-gray-500' // Past
                      : 'bg-green-100 text-green-700' // Upcoming
                   }`}>
                      {new Date(session.endTime) < new Date() ? 'Finished' : 'Upcoming'}
                   </span>
                   <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
                </div>

                <div className="flex items-center text-gray-500 text-sm space-x-6">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-purple-500" />
                    {new Date(session.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2 text-purple-500" />
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <Link
                  href={`/therapist-admin/sessions/${session.id}/edit`}
                  className="flex items-center text-gray-600 hover:text-purple-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-purple-50"
                >
                  <PencilSquareIcon className="w-5 h-5 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="flex items-center text-red-500 hover:text-red-700 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <TrashIcon className="w-5 h-5 mr-1" />
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}