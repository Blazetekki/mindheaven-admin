'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import 'react-quill-new/dist/quill.snow.css';

// Dynamic Import to prevent SSR errors with the Editor
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams(); // Get the ID from the URL
  const articleId = params.id as string;

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true); // Start true to fetch data
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Mental Health',
    content: '',
    imageUrl: '',
    readTime: '5 min'
  });

  // 1. Fetch Existing Data on Mount
  useEffect(() => {
    setIsMounted(true);
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('Article')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) {
        toast.error('Could not load article');
        router.push('/therapist-admin/articles');
        return;
      }

      if (data) {
        setFormData({
          title: data.title,
          category: data.category,
          content: data.content,
          imageUrl: data.imageUrl || '',
          readTime: data.readTime || '5 min'
        });
      }
      setLoading(false);
    };

    fetchArticle();
  }, [articleId, router]);

  // Toolbar Config
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

  // Image Upload Logic (Same as Create Page)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const toastId = toast.loading('Uploading new image...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `articles/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      toast.success('Image updated!', { id: toastId });

    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Update Logic (UPDATE instead of INSERT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
        toast.error('Please fill in title and content');
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Saving changes...');

    try {
      const { error } = await supabase
        .from('Article')
        .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            imageUrl: formData.imageUrl,
            readTime: formData.readTime,
            updatedAt: new Date() // Good practice to track edits
        })
        .eq('id', articleId); // Target specific article

      if (error) throw error;

      toast.success('Article updated!', { id: toastId });
      setTimeout(() => {
        router.push('/therapist-admin/articles');
      }, 1000);

    } catch (error: any) {
      toast.error('Error updating: ' + error.message, { id: toastId });
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (loading && !formData.title) {
      return (
        <div className="flex h-screen items-center justify-center text-teal-600 animate-pulse">
            Loading Article Data...
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Library
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleUpdate} className="p-8 space-y-8">

          <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
                <p className="text-gray-500 mt-1">Make changes to your existing content.</p>
            </div>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Editing Mode
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                     <option>Personal Stories</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Est. Read Time</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-teal-500 outline-none"
                    value={formData.readTime}
                    onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
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
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                  <div className={`
                    border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors
                    ${formData.imageUrl ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                  `}>
                    {formData.imageUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 shadow-sm">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                    )}

                    <label className={`
                        cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                      <CloudArrowUpIcon className="w-5 h-5 mr-2 text-gray-500" />
                      {uploading ? 'Uploading...' : 'Change Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
            <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className={`
                px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-colors
                ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}