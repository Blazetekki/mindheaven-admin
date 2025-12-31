import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { deleteLessonStep } from '../../../actions'; // Import the new delete action

interface PageProps {
  params: { id: string, lessonId: string };
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { data: lesson, error } = await supabase
    .from('Lesson')
    .select('*, steps:LessonStep(*, "order")') // Ensure we fetch the order
    .eq('id', params.lessonId)
    .single();

  if (error || !lesson) {
    return <p>Error loading lesson details.</p>;
  }

  // Sort steps by order
  const sortedSteps = lesson.steps?.sort((a: any, b: any) => a.order - b.order);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <Link href={`/admin/modules/${params.id}`} className="text-yellow-400 hover:underline mb-6 block">&larr; Back to lesson list</Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <p className="text-gray-400">Lesson Details</p>
          </div>
          <Link href={`/admin/modules/${params.id}/lessons/${params.lessonId}/new`}>
            <button className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400">
              Add New Step
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-4">Steps</h2>
        <div className="bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4 w-16">Order</th>
                <th className="p-4">Type</th>
                <th className="p-4">Content</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSteps?.map((step: any) => (
                <tr key={step.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4">{step.order}</td>
                  <td className="p-4">{step.type}</td>
                  <td className="p-4">{step.content.substring(0, 50)}...</td>
                  <td className="p-4">
                    <div className="flex gap-4 items-center">
                      <Link href={`/admin/modules/${params.id}/lessons/${params.lessonId}/steps/${step.id}/edit`} className="text-green-400 hover:underline">
                        Edit
                      </Link>
                      <form action={deleteLessonStep}>
                        <input type="hidden" name="stepId" value={step.id} />
                        <input type="hidden" name="lessonId" value={params.lessonId} />
                        <input type="hidden" name="moduleId" value={params.id} />
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
           {lesson.steps?.length === 0 && <p className="p-4 text-center text-gray-500">No steps created yet for this lesson.</p>}
        </div>
      </div>
    </main>
  );
}