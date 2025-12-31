'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams(); // Get ID from URL
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
  });

  // Load Session Data
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('LiveSession')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (data) {
        // Convert ISO timestamps back to input-friendly formats
        const startObj = new Date(data.startTime);
        const endObj = new Date(data.endTime);

        // Helper to format date as YYYY-MM-DD
        const dateStr = startObj.toISOString().split('T')[0];
        // Helper to format time as HH:MM
        const timeStrStart = startObj.toTimeString().slice(0, 5);
        const timeStrEnd = endObj.toTimeString().slice(0, 5);

        setFormData({
          title: data.title,
          meetingLink: data.meetingLink || '',
          date: dateStr,
          startTime: timeStrStart,
          endTime: timeStrEnd,
        });
      }
      setLoading(false);
    };
    fetchSession();
  }, [sessionId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

      const { error } = await supabase
        .from('LiveSession')
        .update({
          title: formData.title,
          startTime: startDateTime,
          endTime: endDateTime,
          meetingLink: formData.meetingLink,
        })
        .eq('id', sessionId);

      if (error) throw error;

      alert('Session updated successfully!');
      router.push('/therapist-admin/sessions');

    } catch (error: any) {
      alert('Error updating: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading Session Details...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to List
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <VideoCameraIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Session</h1>
                <p className="text-gray-500 text-sm">Update details for this broadcast.</p>
            </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic / Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
            <input
              type="url"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all ${
                saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving Changes...' : 'Update Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}