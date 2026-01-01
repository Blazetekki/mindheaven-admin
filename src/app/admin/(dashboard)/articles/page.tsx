'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { deleteArticle } from './actions';
import ViewArticleModal from './ViewArticleModal';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  content: string;
}

// 1. Move all logic into this inner component
function ArticlesContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const searchParams = useSearchParams();

  // Show a success toast if the URL has ?status=success
  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      toast.success('Article updated successfully!');
    }
  }, [searchParams]);

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data } = await supabase.from('Article').select('*').order('createdAt', { ascending: false });
      if (data) setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const handleViewClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Articles</h1>
            <Link href="/admin/articles/new">
              <button className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
                Add New Article
              </button>
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles?.map((article) => (
                  <tr key={article.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">{article.title}</td>
                    <td className="p-4">{article.category}</td>
                    <td className="p-4">{article.author}</td>
                    <td className="p-4">
                      <div className="flex gap-4 items-center">
                        <button onClick={() => handleViewClick(article)} className="text-blue-400 hover:underline">
                          View
                        </button>
                        <Link href={`/admin/articles/${article.id}/comments`} className="text-purple-400 hover:underline">
                          Comments
                        </Link>
                        <Link href={`/admin/articles/${article.id}/edit`} className="text-green-400 hover:underline">
                          Edit
                        </Link>
                        <form action={deleteArticle}>
                          <input type="hidden" name="articleId" value={article.id} />
                          <button type="submit" className="text-red-400 hover:underline">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <p className="text-center p-4">Loading articles...</p>}
          </div>
        </div>
      </main>

      <ViewArticleModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} article={selectedArticle} />
    </>
  );
}

// 2. Export the wrapper component with Suspense
export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white p-24">Loading...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}