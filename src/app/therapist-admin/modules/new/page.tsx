'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreateModulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'Mental Health',
    imageUrl: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const toastId = toast.loading('Uploading...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login required');

      const fileExt = file.name.split('.').pop();
      const filePath = `modules/${user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      toast.success('Image uploaded', { id: toastId });
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
        toast.error('Please add a Title and Image');
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating module...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('Module').insert({
        title: formData.title,
        subtitle: formData.subtitle,
        category: formData.category,
        "imageUrl": formData.imageUrl, // Quoted column name
        author: user.id
      });

      if (error) throw error;

      toast.success('Module created!', { id: toastId });
      setTimeout(() => router.push('/therapist-admin/modules'), 1000);

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Modules
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Module</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Image Upload */}
          <div className="flex justify-center mb-6">
             <div className="w-full">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                <div className={`
                    border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center text-center bg-gray-50 transition-colors
                    ${formData.imageUrl ? 'border-teal-500' : 'border-gray-300'}
                `}>
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <PhotoIcon className="w-12 h-12 text-gray-300 mb-2" />
                            <span className="text-gray-400 text-sm">No image selected</span>
                        </div>
                    )}
                </div>
                <div className="mt-3 text-center">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                        {uploading ? 'Uploading...' : 'Choose Image'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Module Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
              placeholder="e.g. Overcoming Anxiety"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle / Description</label>
            <textarea
              rows={3}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
              placeholder="A brief overview of this module..."
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
             <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none bg-white"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
             >
               <option>Mental Health</option>
               <option>Faith & Spirit</option>
               <option>Relationships</option>
               <option>Mindfulness</option>
               <option>Personal Growth</option>
             </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}