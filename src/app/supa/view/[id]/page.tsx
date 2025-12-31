'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon, TrashIcon, CalendarIcon,
  BookOpenIcon, NewspaperIcon, UserGroupIcon,
  ClockIcon, EnvelopeIcon, PhoneIcon, NoSymbolIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Profile (Select all to get email/phone)
      const { data: userProfile, error } = await supabase
        .from('Profile')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !userProfile) {
        toast.error("User not found or access denied");
        router.push('/supa');
        return;
      }
      setProfile(userProfile);

      // 2. Fetch Appointments
      const { data: appts } = await supabase
        .from('Appointment')
        .select(`*, user:Profile!userId(fullName, avatarUrl), therapist:Profile!therapistId(fullName, avatarUrl)`)
        .or(`therapistId.eq.${id},userId.eq.${id}`)
        .order('scheduledAt', { ascending: false });

      setAppointments(appts || []);

      // 3. If Therapist, fetch extra data
      if (userProfile.role === 'THERAPIST' || userProfile.specialty) {
         // Extract unique patients
         const uniquePatients = new Map();
         appts?.forEach((a: any) => {
            if (a.therapistId === id && a.user) uniquePatients.set(a.user.id, a.user);
         });
         setPatients(Array.from(uniquePatients.values()));

         // Fetch content
         const [mods, arts] = await Promise.all([
            supabase.from('Module').select('*').eq('author', id),
            supabase.from('Article').select('*').eq('author', id)
         ]);
         setModules(mods.data || []);
         setArticles(arts.data || []);
      }

      setLoading(false);
    };

    if (id) fetchData();
  }, [id, router]);

  // --- ACTIONS ---

  // 1. DELETE ACCOUNT
  const handleDeleteUser = async () => {
    if(!confirm("⚠️ DANGER: This will permanently delete this user profile and their history. This cannot be undone.\n\nAre you sure?")) return;

    setProcessing(true);
    const toastId = toast.loading("Deleting user profile...");

    try {
        // Delete from Profile (RLS allows Owner/SuperAdmin to delete)
        const { error } = await supabase.from('Profile').delete().eq('id', id);

        if (error) throw error;

        toast.success("User deleted successfully", { id: toastId });
        router.replace('/supa'); // Go back to dashboard
    } catch (err: any) {
        console.error(err);
        toast.error(`Delete failed: ${err.message}`, { id: toastId });
    } finally {
        setProcessing(false);
    }
  };

  // 2. SUSPEND / RESTORE
  const handleStatusChange = async (newStatus: 'active' | 'banned') => {
    const isBanning = newStatus === 'banned';
    if(isBanning && !confirm("Suspend this user? They will no longer be able to log in.")) return;

    setProcessing(true);
    const toastId = toast.loading(isBanning ? "Suspending..." : "Restoring access...");

    try {
        const { error } = await supabase
            .from('Profile')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) throw error;

        // Update local state
        setProfile({ ...profile, status: newStatus });
        toast.success(isBanning ? "User Suspended" : "Access Restored", { id: toastId });

    } catch (err: any) {
        toast.error(`Update failed: ${err.message}`, { id: toastId });
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600 font-bold animate-pulse">Loading Profile...</div>;

  const isTherapist = profile.role === 'THERAPIST' || profile.specialty;
  const isBanned = profile.status === 'banned';

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      {/* HEADER NAV */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
            <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
             {isBanned ? (
                 <button
                    onClick={() => handleStatusChange('active')}
                    disabled={processing}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-100 text-green-700 border border-green-200 font-bold rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
                 >
                    <CheckCircleIcon className="w-5 h-5" /> Restore Access
                 </button>
             ) : (
                 <button
                    onClick={() => handleStatusChange('banned')}
                    disabled={processing}
                    className="flex-1 sm:flex-none px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 font-bold rounded-lg hover:bg-orange-100 flex items-center justify-center gap-2"
                 >
                    <NoSymbolIcon className="w-5 h-5" /> Suspend
                 </button>
             )}

             <button
                onClick={handleDeleteUser}
                disabled={processing}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
             >
                <TrashIcon className="w-5 h-5" /> Delete
             </button>
        </div>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col lg:flex-row gap-8 relative overflow-hidden">
         {/* Banned Overlay Banner */}
         {isBanned && <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />}

         <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1">
             <img src={profile.avatarUrl || 'https://via.placeholder.com/150'} className={`w-32 h-32 rounded-full border-4 object-cover ${isBanned ? 'border-red-100 grayscale' : 'border-indigo-50'}`} />

             <div className="text-center md:text-left space-y-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isTherapist ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {isTherapist ? profile.specialty || 'Therapist' : 'User'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {profile.status || 'Active'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">ID: {profile.id.split('-')[0]}...</span>
                    </div>
                </div>

                {/* --- CONTACT INFO --- */}
                <div className="pt-2 space-y-1">
                    <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 font-medium">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        {profile.email || <span className="text-gray-400 italic">No email provided</span>}
                    </p>
                    <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 font-medium">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        {profile.phoneNumber || <span className="text-gray-400 italic">No phone provided</span>}
                    </p>
                </div>
             </div>
         </div>

         {/* Quick Stats */}
         <div className="flex gap-8 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 pl-0 lg:pl-8 justify-center lg:justify-start">
            <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sessions</p>
            </div>
            {isTherapist && (
                <>
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Patients</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{modules.length + articles.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Content</p>
                </div>
                </>
            )}
         </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COL: Schedule & Activity */}
        <div className="lg:col-span-2 space-y-8">

            {/* APPOINTMENTS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <h2 className="font-bold text-gray-900">Appointment History</h2>
                </div>
                <div className="divide-y max-h-[500px] overflow-y-auto">
                    {appointments.map(appt => (
                        <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg text-indigo-700 font-bold leading-none border border-indigo-100">
                                    <span className="text-lg">{new Date(appt.scheduledAt).getDate()}</span>
                                    <span className="uppercase text-[10px]">{new Date(appt.scheduledAt).toLocaleString('default',{month:'short'})}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {isTherapist ?
                                            (appt.user?.fullName || <span className="text-gray-400 italic">Deleted User</span>) :
                                            (appt.therapist?.fullName || <span className="text-gray-400 italic">Deleted Therapist</span>)
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <ClockIcon className="w-3 h-3" />
                                        {new Date(appt.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                                appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                appt.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {appt.status}
                            </span>
                        </div>
                    ))}
                    {appointments.length === 0 && <div className="p-8 text-center text-gray-400 italic">No appointments found.</div>}
                </div>
            </div>

            {/* PATIENTS LIST (Only for Therapists) */}
            {isTherapist && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-gray-500" />
                        <h2 className="font-bold text-gray-900">Patient Directory</h2>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                        {patients.map(p => (
                            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <img src={p.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900">{p.fullName}</p>
                                        <p className="text-xs text-gray-500">{p.phoneNumber || 'No phone'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/supa/view/${p.id}`)}
                                    className="text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    View Profile
                                </button>
                            </div>
                        ))}
                        {patients.length === 0 && <div className="p-6 text-center text-gray-400 italic">No patients yet.</div>}
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COL: Content & Metadata (Only for Therapists) */}
        {isTherapist && (
            <div className="space-y-8">

                {/* MODULES CARD */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                        <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-bold text-gray-900">Published Modules</h2>
                    </div>
                    <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                        {modules.map(m => (
                            <div key={m.id} className="p-3 border rounded-lg hover:bg-gray-50 flex gap-3 group transition-colors">
                                <img src={m.imageUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded bg-gray-200 object-cover group-hover:scale-105 transition-transform" />
                                <div>
                                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{m.title}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{m.subtitle}</p>
                                </div>
                            </div>
                        ))}
                        {modules.length === 0 && <div className="p-4 text-center text-gray-400 text-sm italic">No modules created.</div>}
                    </div>
                </div>

                {/* ARTICLES CARD */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                        <NewspaperIcon className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-bold text-gray-900">Published Articles</h2>
                    </div>
                    <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                        {articles.map(a => (
                            <div key={a.id} className="p-3 border rounded-lg hover:bg-gray-50">
                                <p className="font-bold text-sm text-gray-900">{a.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                         {articles.length === 0 && <div className="p-4 text-center text-gray-400 text-sm italic">No articles published.</div>}
                    </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
}