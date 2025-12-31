'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateArticlePage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Mental Health',
    content: '',
    imageUrl: '',
    readTime: '5' // Default to string "5" to work with input, we parse later
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const toastId = toast.loading('Uploading image...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      const fileExt = file.name.split('.').pop();
      const filePath = `articles/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      toast.success('Image uploaded!', { id: toastId });

    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Please fill in the title and content');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Publishing article...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert readTime to integer
      const readTimeInt = parseInt(formData.readTime) || 5;

      const { error } = await supabase.from('Article').insert({
        title: formData.title,
        content: formData.content,
        category: formData.category,

        // --- SCHEMA MATCHING ---
        "imageUrl": formData.imageUrl, // Quoted
        "readTime": readTimeInt,       // Integer
        author: user.id,               // 'author' column
      });

      if (error) throw error;

      toast.success('Published successfully!', { id: toastId });

      setTimeout(() => {
        router.push('/therapist-admin/articles');
      }, 1000);

    } catch (error: any) {
      toast.error('Error publishing: ' + error.message, { id: toastId });
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-teal-600 animate-pulse font-medium">Loading Editor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Library
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">Write New Article</h1>
            <p className="text-gray-500 mt-1">Share insights using rich text formatting.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  placeholder="e.g. Finding Peace in Anxiety"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                   <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none bg-white cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                   >
                     <option>Mental Health</option>
                     <option>Faith & Spirit</option>
                     <option>Relationships</option>
                     <option>Mindfulness</option>
                     <option>Personal Stories</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Est. Read Time (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
                    placeholder="e.g. 5"
                    value={formData.readTime}
                    onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="h-96 pb-12">
                <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                <div className="h-full bg-white rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    modules={modules}
                    formats={formats}
                    className="h-full"
                    placeholder="Start writing your article here..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                  <div className={`
                    border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200
                    ${formData.imageUrl ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                  `}>
                    {formData.imageUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 shadow-sm group">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">Current Image</span>
                        </div>
                      </div>
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                    )}

                    <label className={`
                      cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors
                      ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                      <CloudArrowUpIcon className="w-5 h-5 mr-2 text-gray-500" />
                      {uploading ? 'Uploading...' : (formData.imageUrl ? 'Change Image' : 'Upload Image')}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
              className={`
                px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-colors
                ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}