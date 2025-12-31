'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CalendarIcon, UserGroupIcon, ClockIcon,
  BellAlertIcon, PhoneIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon, TrashIcon,
  PencilIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'patients'>('overview');
  const [loading, setLoading] = useState(true);

  // Data State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  // --- STATE FOR MODALS ---
  const [selectedRequest, setSelectedRequest] = useState<any>(null); // For Pending
  const [managingAppt, setManagingAppt] = useState<any>(null);     // For Confirmed (Manage)

  // Inputs
  const [replyMessage, setReplyMessage] = useState('');
  const [manageAction, setManageAction] = useState<'edit' | 'message' | 'cancel'>('message');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [processing, setProcessing] = useState(false);

  // --- FETCH DATA ---
  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const now = new Date().toISOString();

      // 1. Pending
      const { data: pending } = await supabase
        .from('Appointment')
        .select(`*, user:Profile!Appointment_userId_fkey (id, fullName, avatarUrl, phoneNumber)`)
        .eq('therapistId', user.id)
        .eq('status', 'pending')
        .order('scheduledAt', { ascending: true });

      // 2. Confirmed
      const { data: confirmed } = await supabase
        .from('Appointment')
        .select(`*, user:Profile!Appointment_userId_fkey (id, fullName, avatarUrl, phoneNumber)`)
        .eq('therapistId', user.id)
        .eq('status', 'confirmed')
        .gte('scheduledAt', now)
        .order('scheduledAt', { ascending: true });

      // 3. Patients
      const { data: history } = await supabase
        .from('Appointment')
        .select(`user:Profile!Appointment_userId_fkey (id, fullName, avatarUrl, phoneNumber)`)
        .eq('therapistId', user.id);

      const uniquePatientsMap = new Map();
      history?.forEach((item: any) => {
        if (item.user) uniquePatientsMap.set(item.user.id, item.user);
      });

      setPendingRequests(pending || []);
      setConfirmedAppointments(confirmed || []);
      setAllPatients(Array.from(uniquePatientsMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // --- ACTIONS FOR PENDING REQUESTS ---
  const handleProcessPending = async (action: 'confirm' | 'reject') => {
    if (!selectedRequest) return;
    setProcessing(true);
    const toastId = toast.loading(action === 'confirm' ? 'Confirming...' : 'Rejecting...');

    try {
      if (action === 'confirm') {
        // Update Status
        await supabase.from('Appointment').update({
          status: 'confirmed', "therapistReply": replyMessage || 'Session confirmed.'
        }).eq('id', selectedRequest.id);

        // Notify
        await supabase.from('Notification').insert({
          "userId": selectedRequest.userId,
          title: 'Booking Confirmed',
          message: replyMessage || `Your session on ${new Date(selectedRequest.scheduledAt).toLocaleDateString()} is confirmed.`
        });
        toast.success('Confirmed!', { id: toastId });
      } else {
        // Delete
        await supabase.from('Appointment').delete().eq('id', selectedRequest.id);
        toast.success('Rejected', { id: toastId });
      }

      setSelectedRequest(null);
      setReplyMessage('');
      fetchDashboardData();

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  // --- ACTIONS FOR CONFIRMED APPOINTMENTS (Manage) ---
  const handleManageSubmit = async () => {
    if (!managingAppt) return;
    setProcessing(true);
    const toastId = toast.loading('Processing...');

    try {
        if (manageAction === 'message') {
            // Just Send Notification
            await supabase.from('Notification').insert({
                "userId": managingAppt.userId,
                title: 'Message from Therapist',
                message: replyMessage
            });
            toast.success('Message Sent', { id: toastId });

        } else if (manageAction === 'cancel') {
            // Delete Appointment & Notify
            await supabase.from('Appointment').delete().eq('id', managingAppt.id);

            await supabase.from('Notification').insert({
                "userId": managingAppt.userId,
                title: 'Appointment Cancelled',
                message: replyMessage || `Your appointment on ${new Date(managingAppt.scheduledAt).toLocaleDateString()} was cancelled.`
            });
            toast.success('Appointment Cancelled', { id: toastId });

        } else if (manageAction === 'edit') {
            // Update Time
            const newDateTime = new Date(`${newDate}T${newTime}:00`).toISOString();

            const { error } = await supabase.from('Appointment')
                .update({ scheduledAt: newDateTime })
                .eq('id', managingAppt.id);

            if (error) {
                if (error.code === '23505') throw new Error('Time slot already taken.');
                throw error;
            }

            await supabase.from('Notification').insert({
                "userId": managingAppt.userId,
                title: 'Appointment Rescheduled',
                message: `Your appointment has been moved to ${newDate} at ${newTime}.`
            });
            toast.success('Rescheduled successfully', { id: toastId });
        }

        setManagingAppt(null);
        setReplyMessage('');
        fetchDashboardData();

    } catch (err: any) {
        toast.error(err.message, { id: toastId });
    } finally {
        setProcessing(false);
    }
  };

  // Open Manage Modal
  const openManageModal = (appt: any, action: 'edit' | 'message' | 'cancel') => {
    setManagingAppt(appt);
    setManageAction(action);
    setReplyMessage('');

    // Pre-fill date/time if editing
    if (action === 'edit') {
        const dt = new Date(appt.scheduledAt);
        setNewDate(dt.toISOString().split('T')[0]);
        setNewTime(dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false}));
    }
  };

  if (loading) return <div className="p-10 text-teal-600 animate-pulse text-center">Loading Portal...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">

      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapist Portal</h1>
          <p className="text-gray-500">Manage your bookings and patients.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'overview' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border'}`}>Overview</button>
           <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'requests' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border'}`}>
             Requests {pendingRequests.length > 0 && <span className="bg-white text-orange-600 px-1.5 rounded-full text-xs">{pendingRequests.length}</span>}
           </button>
           <button onClick={() => setActiveTab('patients')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'patients' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>Patients</button>
        </div>
      </div>

      {/* === TAB 1: OVERVIEW === */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setActiveTab('requests')} className="bg-orange-50 p-6 rounded-xl border border-orange-100 cursor-pointer hover:shadow-md transition-all">
              <div className="flex justify-between">
                 <div><h3 className="text-orange-800 font-bold">Pending Requests</h3><p className="text-3xl font-bold text-orange-900 mt-2">{pendingRequests.length}</p></div>
                 <BellAlertIcon className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between">
                 <div><h3 className="text-gray-500 font-bold">Upcoming Sessions</h3><p className="text-3xl font-bold text-gray-900 mt-2">{confirmedAppointments.length}</p></div>
                 <CalendarIcon className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <div onClick={() => setActiveTab('patients')} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md">
              <div className="flex justify-between">
                 <div><h3 className="text-gray-500 font-bold">Total Patients</h3><p className="text-3xl font-bold text-gray-900 mt-2">{allPatients.length}</p></div>
                 <UserGroupIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* SCHEDULE AT A GLANCE (UPDATED WITH ACTIONS) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Schedule at a Glance</h3>
             </div>
             <div className="divide-y divide-gray-100">
               {confirmedAppointments.slice(0, 5).map(appt => (
                 <div key={appt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 group">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-lg bg-teal-50 flex flex-col items-center justify-center text-teal-700 border border-teal-100">
                          <span className="text-xs font-bold uppercase">{new Date(appt.scheduledAt).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{new Date(appt.scheduledAt).getDate()}</span>
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">{appt.user?.fullName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                             <ClockIcon className="w-4 h-4" />
                             {new Date(appt.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </div>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openManageModal(appt, 'edit')} title="Reschedule" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => openManageModal(appt, 'message')} title="Message" className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-full"><ChatBubbleLeftRightIcon className="w-5 h-5" /></button>
                        <button onClick={() => openManageModal(appt, 'cancel')} title="Cancel" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"><XMarkIcon className="w-5 h-5" /></button>
                    </div>
                 </div>
               ))}
               {confirmedAppointments.length === 0 && <div className="p-8 text-center text-gray-400">No upcoming sessions.</div>}
             </div>
          </div>
        </div>
      )}

      {/* === TAB 2 & 3: REQUESTS & PATIENTS (Standard) === */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50"><h2 className="text-lg font-bold text-orange-900 flex items-center gap-2"><BellAlertIcon className="w-5 h-5" /> Booking Notices</h2></div>
           {pendingRequests.length === 0 ? (
             <div className="p-12 text-center text-gray-500">No pending booking requests.</div>
           ) : (
             <div className="divide-y divide-gray-100">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-6 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <img src={req.user?.avatarUrl || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full bg-gray-200" />
                        <div>
                           <h4 className="font-bold text-gray-900">{req.user?.fullName || 'Unknown'}</h4>
                           <p className="text-sm text-gray-500">{new Date(req.scheduledAt).toLocaleString()}</p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedRequest(req)} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg text-sm">Review</button>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
           <h2 className="text-lg font-bold text-gray-900 mb-4">Patient Directory</h2>
           <div className="space-y-2">
             {allPatients.map(p => (
                <div key={p.id} className="p-3 border rounded flex items-center gap-3">
                    <img src={p.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full bg-gray-200" />
                    <div><p className="font-bold">{p.fullName}</p><p className="text-sm text-gray-500">{p.phoneNumber}</p></div>
                </div>
             ))}
           </div>
        </div>
      )}

      {/* --- MODAL 1: PENDING REQUEST REVIEW --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
               <h3 className="font-bold text-orange-900">Review Request</h3>
               <button onClick={() => setSelectedRequest(null)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
               <p className="text-gray-600"><strong>Patient:</strong> {selectedRequest.user?.fullName}</p>
               <p className="text-gray-600"><strong>Time:</strong> {new Date(selectedRequest.scheduledAt).toLocaleString()}</p>

               <div>
                  <label className="text-sm font-bold text-gray-700">Reply Message (Optional)</label>
                  <textarea rows={2} className="w-full p-2 border rounded mt-1" placeholder="e.g. Confirmed, see you then." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} />
               </div>

               <div className="flex gap-3 pt-2">
                  <button onClick={() => handleProcessPending('reject')} disabled={processing} className="flex-1 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Reject</button>
                  <button onClick={() => handleProcessPending('confirm')} disabled={processing} className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Confirm</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: MANAGE CONFIRMED SESSION --- */}
      {managingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`p-4 border-b flex justify-between items-center ${manageAction === 'cancel' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
               <h3 className={`font-bold capitalize ${manageAction === 'cancel' ? 'text-red-900' : 'text-gray-900'}`}>{manageAction} Session</h3>
               <button onClick={() => setManagingAppt(null)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="p-6 space-y-4">
               <p className="text-sm text-gray-500">Patient: <span className="font-bold text-gray-900">{managingAppt.user?.fullName}</span></p>

               {manageAction === 'edit' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500">New Date</label><input type="date" className="w-full p-2 border rounded" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-gray-500">New Time</label><input type="time" className="w-full p-2 border rounded" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
                 </div>
               )}

               {(manageAction === 'message' || manageAction === 'cancel') && (
                 <div>
                    <label className="text-sm font-bold text-gray-700">
                        {manageAction === 'cancel' ? 'Reason for Cancellation' : 'Message to Patient'}
                    </label>
                    <textarea
                        rows={3}
                        className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={manageAction === 'cancel' ? "e.g. Something urgent came up..." : "e.g. Please bring your notes..."}
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                    />
                 </div>
               )}

               <button
                  onClick={handleManageSubmit}
                  disabled={processing}
                  className={`w-full py-3 font-bold text-white rounded-lg shadow-sm mt-2 ${
                    manageAction === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                    manageAction === 'message' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
               >
                  {processing ? 'Processing...' : manageAction === 'cancel' ? 'Confirm Cancellation' : manageAction === 'edit' ? 'Update Schedule' : 'Send Message'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}