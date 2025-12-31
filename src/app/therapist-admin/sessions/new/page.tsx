'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast'; // Import Toast

export default function CreateSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Scheduling session...');

    try {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 2. Format Dates (Combine Date + Time)
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

      // 3. Insert into Database
      const { error } = await supabase.from('LiveSession').insert({
        title: formData.title,
        hostId: user.id,
        startTime: startDateTime,
        endTime: endDateTime,
        meetingLink: formData.meetingLink,
        isActive: true
      });

      if (error) throw error;

      toast.success('Session published successfully!', { id: toastId });

      // Wait a moment for the user to read the toast
      setTimeout(() => {
        router.push('/therapist-admin/sessions');
      }, 1000);

    } catch (error: any) {
      toast.error('Error creating session: ' + error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <VideoCameraIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Schedule Live Session</h1>
                <p className="text-gray-500 text-sm">This will broadcast to all users on the mobile app.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic / Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Coping with Work Stress"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Link (Zoom / Teams / Meet)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    type="url"
                    required
                    placeholder="https://zoom.us/j/123456789"
                    className="block w-full rounded-md border border-gray-300 px-3 py-3 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
            </div>
            <p className="mt-2 text-xs text-gray-500">
                Users will be redirected to this link when they click "Join Now" in the app.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'
              }`}
            >
              {loading ? 'Publishing...' : 'Publish Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}