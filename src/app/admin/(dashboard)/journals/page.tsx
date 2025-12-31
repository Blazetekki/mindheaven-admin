import { supabaseAdmin } from '@/lib/supabasejournal'; // Use the admin client
import Link from 'next/link';
import { deleteJournalEntry } from './actions';

export default async function ManageJournalsPage() {
  // Use the admin client to fetch ALL journal entries
  const { data: journals, error } = await supabaseAdmin
    .from('JournalEntry')
    .select('*, author:Profile(fullName)')
    .order('createdAt', { ascending: false });

  if (error) {
    return <p>Error loading journals: {error.message}</p>;
  }

  // Placeholder for professionals list
  const professionals = [
    { id: 'prof1', name: 'Dr. Adebayo' },
    { id: 'prof2', name: 'Mrs. Eze' },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Manage Journal Entries</h1>

        <div className="bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">User</th>
                <th className="p-4">Title</th>
                <th className="p-4">Content</th>
                <th className="p-4">Assign Therapist</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journals?.map((journal: any) => (
                <tr key={journal.id} className="border-b border-gray-700">
                  <td className="p-4 whitespace-nowrap">{new Date(journal.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{journal.author?.fullName || 'N/A'}</td>
                  <td className="p-4">{journal.title}</td>
                  <td className="p-4 text-gray-400">{journal.content.substring(0, 50)}...</td>
                  <td className="p-4">
                    <select className="bg-gray-700 p-2 rounded border border-gray-600">
                      <option>Select...</option>
                      {professionals.map(prof => (
                        <option key={prof.id} value={prof.id}>{prof.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                     <div className="flex gap-4 items-center">
                        <form action={deleteJournalEntry}>
                          <input type="hidden" name="journalId" value={journal.id} />
                          <button type="submit" className="text-red-400 hover:underline">Delete</button>
                        </form>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {journals?.length === 0 && <p className="p-4 text-center text-gray-500">No journal entries found.</p>}
        </div>
      </div>
    </main>
  );
}