'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast'; // Import Toast

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const [formData, setFormData] = useState({
    fullName: '',
    specialty: '',
    about: '',
    phoneNumber: '',
    address: '',
    avatarUrl: ''
  });

  // Load initial data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('Profile').select('*').eq('id', user.id).single();
        if (data) {
          setFormData({
            fullName: data.fullName || '',
            specialty: data.specialty || '',
            about: data.about || '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            avatarUrl: data.avatarUrl || ''
          });
        }
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setLoading(true);
    const toastId = toast.loading('Uploading new photo...');
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, avatarUrl: data.publicUrl }));

      toast.success('Photo uploaded!', { id: toastId });
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Saving profile changes...');

    const { error } = await supabase
      .from('Profile')
      .update({
        fullName: formData.fullName,
        specialty: formData.specialty,
        about: formData.about,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        avatarUrl: formData.avatarUrl,
        updatedAt: new Date()
      })
      .eq('id', userId);

    if (error) {
      toast.error('Error saving: ' + error.message, { id: toastId });
    } else {
      toast.success('Profile updated successfully!', { id: toastId });
      setTimeout(() => {
        router.push('/therapist-admin/profile');
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Profile
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Details</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No Photo</span>
              )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <CloudArrowUpIcon className="w-5 h-5 mr-2 text-gray-500" />
                    Upload New Photo
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialty (e.g., Clinical Psychologist)</label>
              <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="e.g. Anxiety Specialist" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">About Me (Bio)</label>
            <textarea name="about" rows={4} value={formData.about} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Tell patients about your experience and approach..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Clinic Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}