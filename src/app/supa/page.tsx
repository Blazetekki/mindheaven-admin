'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  UsersIcon, BriefcaseIcon, CheckBadgeIcon,
  ChartBarIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon, ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users' | 'appointments'>('overview');
  const [loading, setLoading] = useState(true);

  // Data State
  const [stats, setStats] = useState({ users: 0, therapists: 0, pending: 0, appointments: 0 });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // State to track role changes locally before saving
  const [roleEdits, setRoleEdits] = useState<{[key: string]: string}>({});

  // --- FETCH DATA ---
  const fetchAdminData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Security Check
    const { data: currentUser } = await supabase.from('Profile').select('isSuperAdmin, role').eq('id', user?.id).single();

    // Authorization: Allow 'DEV_OWNER_7752' OR legacy 'isSuperAdmin' boolean
    const isAuthorized = currentUser?.isSuperAdmin || currentUser?.role === 'DEV_OWNER_7752';

    if (!isAuthorized) {
        toast.error('Unauthorized');
        router.push('/');
        return;
    }

    // 2. Fetch Data (No sorting to prevent column errors)
    const [profiles, appts] = await Promise.all([
        supabase.from('Profile').select('*'),
        supabase.from('Appointment').select('id') // Just counting appointments for stats
    ]);

    const allProfiles = profiles.data || [];

    // Process Data
    // "Pending" captures anyone with status='pending'
    const pending = allProfiles.filter(p => p.status === 'pending');

    // Count stats based on roles
    const usersCount = allProfiles.filter(p => !p.specialty && p.role !== 'THERAPIST' && p.role !== 'SEC_SUPER_8841').length;
    const therapistsCount = allProfiles.filter(p => p.role === 'THERAPIST' || p.specialty).length;

    setStats({
        users: usersCount,
        therapists: therapistsCount,
        pending: pending.length,
        appointments: appts.data?.length || 0
    });

    setPendingUsers(pending);
    setAllUsers(allProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- ACTIONS ---

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Navigate to the detailed view page
  const handleViewUser = (id: string) => {
    router.push(`/supa/view/${id}`);
  };

  // Update local state for dropdowns
  const handleRoleSelect = (userId: string, newRole: string) => {
    setRoleEdits(prev => ({ ...prev, [userId]: newRole }));
  };

  // Approve User & Save Role
  const handleApproveAndSave = async (user: any) => {
    const toastId = toast.loading('Updating user...');

    // Use the selected role, or fallback to their current role (defaulting to THERAPIST if missing)
    const finalRole = roleEdits[user.id] || user.role || 'THERAPIST';

    // Prepare updates
    const updates: any = { status: 'active', role: finalRole };

    // Data Cleanup: If Therapist, ensure specialty exists. If Admin/User, remove it.
    if (finalRole === 'THERAPIST') {
        if (!user.specialty) updates.specialty = 'General Therapist';
    } else {
        updates.specialty = null;
    }

    try {
        await supabase.from('Profile').update(updates).eq('id', user.id);
        toast.success(`User active as ${finalRole}`, { id: toastId });
        fetchAdminData(); // Refresh list
    } catch (err) {
        toast.error('Failed to update', { id: toastId });
    }
  };

  const handleBanUser = async (id: string, e: any) => {
    e.stopPropagation(); // Prevent clicking the row
    if(!confirm('Are you sure? This will suspend their access.')) return;
    await supabase.from('Profile').update({ status: 'banned' }).eq('id', id);
    toast.error('User Suspended');
    fetchAdminData();
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600 font-bold animate-pulse">Loading Super Admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">

      {/* SIDEBAR */}
      <div className="w-64 bg-indigo-900 text-white p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
         <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
            <span className="bg-white text-indigo-900 w-8 h-8 flex items-center justify-center rounded-lg text-sm shadow">S</span>
            SupaAdmin
         </h1>

         <nav className="space-y-2 flex-1">
            <NavItem label="Overview" icon={ChartBarIcon} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem label="Approvals" icon={CheckBadgeIcon} active={activeTab === 'approvals'} count={stats.pending} onClick={() => setActiveTab('approvals')} />
            <NavItem label="User Directory" icon={UsersIcon} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
         </nav>

         <div className="pt-6 border-t border-indigo-800 space-y-4">
            <div>
                <p className="text-xs text-indigo-300 uppercase font-bold">Logged in as</p>
                <p className="font-bold">Owner</p>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Sign Out
            </button>
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* TOP BAR (Mobile Check) */}
        <div className="md:hidden mb-6 flex justify-between items-center">
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('overview')} className="px-4 py-2 bg-indigo-900 text-white rounded">Stats</button>
                <button onClick={() => setActiveTab('approvals')} className="px-4 py-2 bg-indigo-900 text-white rounded">Approvals</button>
            </div>
            <button onClick={handleSignOut} className="bg-red-100 p-2 rounded-full text-red-600"><ArrowLeftOnRectangleIcon className="w-6 h-6" /></button>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
                <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.users} icon={UsersIcon} color="bg-blue-500" />
                    <StatCard title="Total Therapists" value={stats.therapists} icon={BriefcaseIcon} color="bg-purple-500" />
                    <StatCard title="Pending Approval" value={stats.pending} icon={CheckBadgeIcon} color="bg-orange-500" />
                    <StatCard title="Global Appts" value={stats.appointments} icon={ChartBarIcon} color="bg-teal-500" />
                </div>
            </div>
        )}

        {/* --- APPROVALS TAB --- */}
        {activeTab === 'approvals' && (
            <div className="animate-in slide-in-from-right-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Pending Approvals</h2>
                {pendingUsers.length === 0 ? (
                    <div className="p-16 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                        <CheckBadgeIcon className="w-16 h-16 text-green-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                        <p>No pending accounts.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <img src={user.avatarUrl || 'https://via.placeholder.com/50'} className="w-16 h-16 rounded-full bg-gray-200" />
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{user.fullName}</h3>
                                        <p className="text-gray-500 text-sm">{user.email}</p>
                                        <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                                            Requesting: {user.role === 'SEC_SUPER_8841' ? 'Staff Admin' : user.specialty || 'Therapist'}
                                        </span>
                                    </div>
                                </div>

                                {/* ROLE SELECTOR & ACTIONS */}
                                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-bold text-gray-400 mb-1 ml-1">Assign Role</label>
                                        <select
                                            value={roleEdits[user.id] || user.role || 'THERAPIST'}
                                            onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                                        >
                                            <option value="THERAPIST">Therapist</option>
                                            <option value="SEC_SUPER_8841">Staff Admin</option>
                                            <option value="user">Standard User</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleBanUser(user.id, e)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-bold text-sm">Reject</button>
                                        <button
                                            onClick={() => handleApproveAndSave(user)}
                                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow flex items-center gap-2"
                                        >
                                            <CheckIcon className="w-5 h-5" /> Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- USERS DIRECTORY TAB (CLICKABLE ROWS) --- */}
        {activeTab === 'users' && (
            <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Global Directory</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Search profiles..." className="pl-10 pr-4 py-2 border rounded-lg w-64" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-500">Name</th>
                                <th className="p-4 text-sm font-bold text-gray-500">Role</th>
                                <th className="p-4 text-sm font-bold text-gray-500">Status</th>
                                <th className="p-4 text-sm font-bold text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {allUsers.map(u => (
                                <tr
                                    key={u.id}
                                    onClick={() => handleViewUser(u.id)} // <--- CLICK TO VIEW
                                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                            {u.avatarUrl && <img src={u.avatarUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 underline-offset-4 group-hover:underline">{u.fullName}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                        {/* IN-LINE ROLE CHANGER */}
                                        <select
                                            value={roleEdits[u.id] || (u.role ? u.role : 'user')}
                                            onChange={(e) => {
                                                handleRoleSelect(u.id, e.target.value);
                                            }}
                                            className="text-xs font-bold border-none bg-transparent focus:ring-0 cursor-pointer hover:bg-gray-100 rounded px-1 py-1"
                                        >
                                            <option value="user">User</option> {/* DEFAULT TOP */}
                                            <option value="DEV_OWNER_7752">Super Admin</option>
                                            <option value="SEC_SUPER_8841">Staff Admin</option>
                                            <option value="THERAPIST">Therapist</option>
                                        </select>

                                        {/* Save Button appears if role changed */}
                                        {roleEdits[u.id] && roleEdits[u.id] !== u.role && (
                                            <button
                                                onClick={() => handleApproveAndSave(u)}
                                                className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${u.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {u.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={(e) => handleBanUser(u.id, e)} className="text-red-300 hover:text-red-600 p-2"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

// Helper Components
const NavItem = ({ label, icon: Icon, active, count, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all ${active ? 'bg-indigo-800 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800/50'}`}>
    <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-bold">{label}</span>
    </div>
    {count > 0 && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
     <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white shadow-md`}>
        <Icon className="w-6 h-6" />
     </div>
     <div>
        <p className="text-gray-500 text-sm font-bold">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
     </div>
  </div>
);