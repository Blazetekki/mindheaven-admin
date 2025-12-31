import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { deleteLesson } from '../actions';

interface PageProps {
  params: { id: string };
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { data: module, error } = await supabase
    .from('Module')
    .select('*, lessons:Lesson(*)')
    .order('order', { foreignTable: 'Lesson', ascending: true }) // Sort lessons by order
    .eq('id', params.id)
    .single();

  if (error || !module) {
    return <p>Error loading module details.</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <Link href="/admin/modules" className="text-yellow-400 hover:underline mb-6 block">&larr; Back to all modules</Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{module.title}</h1>
            <p className="text-gray-400">{module.category}</p>
          </div>
          <Link href={`/admin/modules/${module.id}/new`}>
            <button className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Add New Lesson
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-4">Lessons</h2>
        <div className="bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4 w-16">Order</th>
                <th className="p-4">Title</th>
                <th className="p-4">Created At</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {module.lessons?.map((lesson: any) => (
                <tr key={lesson.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4">{lesson.order}</td>
                  <td className="p-4">
                     <Link href={`/admin/modules/${module.id}/lessons/${lesson.id}`} className="hover:text-yellow-400 hover:underline">
                        {lesson.title}
                     </Link>
                  </td>
                  <td className="p-4">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-4 items-center">
                      <Link href={`/admin/modules/${module.id}/lessons/${lesson.id}/edit`} className="text-green-400 hover:underline">
                        Edit
                      </Link>
                      <form action={deleteLesson}>
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="moduleId" value={module.id} />
                        <button type="submit" className="text-red-400 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {module.lessons?.length === 0 && <p className="p-4 text-center text-gray-500">No lessons created yet.</p>}
        </div>
      </div>
    </main>
  );
}