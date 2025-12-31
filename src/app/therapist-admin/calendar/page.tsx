'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO
} from 'date-fns';
import {
  ChevronLeftIcon, ChevronRightIcon, ClockIcon,
  UserCircleIcon, VideoCameraIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function TherapistCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [globalSessions, setGlobalSessions] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const start = startOfMonth(currentDate).toISOString();
        const end = endOfMonth(currentDate).toISOString();

        // A. My Appointments
        const { data: appts } = await supabase
          .from('Appointment')
          .select(`*, user:Profile!userId (fullName, phoneNumber, avatarUrl)`)
          .eq('therapistId', user.id)
          .gte('scheduledAt', start)
          .lte('scheduledAt', end);

        // B. Global Sessions
        const { data: sessions } = await supabase
          .from('LiveSession')
          .select(`*, host:Profile!hostId (fullName, avatarUrl)`)
          .gte('startTime', start)
          .lte('startTime', end)
          .eq('isActive', true);

        // C. Availability
        const { data: profile } = await supabase
          .from('Profile')
          .select('availability')
          .eq('id', user.id)
          .single();

        setMyAppointments(appts || []);
        setGlobalSessions(sessions || []);
        setAvailability(profile?.availability || {});
      }
      setLoading(false);
    };
    fetchData();
  }, [currentDate]);

  // --- 2. CALENDAR LOGIC ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date) => {
    const apps = myAppointments.filter(a => isSameDay(parseISO(a.scheduledAt), day));
    const sess = globalSessions.filter(s => isSameDay(parseISO(s.startTime), day));
    return { apps, sess };
  };

  // UPDATED: Logic to handle Default = Available
  const isDayAvailable = (date: Date) => {
    const dayName = format(date, 'EEEE').toLowerCase();
    // If it's NOT explicitly false, it is available (undefined = true)
    return availability[dayName] !== false;
  };

  const toggleAvailability = async () => {
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    // Invert the current status
    const newStatus = !isDayAvailable(selectedDate);

    const newAvail = { ...availability, [dayName]: newStatus };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('Profile').update({ availability: newAvail }).eq('id', user.id);
      setAvailability(newAvail);
    }
  };

  const { apps: selectedApps, sess: selectedSess } = getDayEvents(selectedDate);
  const dayIsAvailable = isDayAvailable(selectedDate);

  // --- 3. RENDER ---
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">

      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-teal-600">{format(currentDate, 'MMMM')}</span>
          <span className="text-gray-400">{format(currentDate, 'yyyy')}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200">
            Today
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: CALENDAR TABLE */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-[1px] border-b border-gray-200">
              {calendarDays.map((day) => {
                const { apps, sess } = getDayEvents(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isAvailable = isDayAvailable(day);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[120px] bg-white p-2 cursor-pointer transition-colors hover:bg-gray-50
                      ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''}
                      ${isSelected ? 'ring-2 ring-inset ring-teal-500 z-10' : ''}
                      ${!isAvailable && isCurrentMonth ? 'bg-gray-100' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`
                        text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-teal-600 text-white' : 'text-gray-700'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {/* Work Status Dot (Only show Red dot if explicitly OFF) */}
                      {!isAvailable && isCurrentMonth && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1 rounded">OFF</span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {sess.map((s, i) => (
                        <div key={i} className="text-[10px] bg-red-50 text-red-700 px-1 rounded border border-red-100 truncate font-medium">
                          🎥 {format(parseISO(s.startTime), 'HH:mm')} Live
                        </div>
                      ))}
                      {apps.map((a, i) => (
                        <div key={i} className="text-[10px] bg-purple-50 text-purple-700 px-1 rounded border border-purple-100 truncate font-medium">
                          📅 {format(parseISO(a.scheduledAt), 'HH:mm')} Appt
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: SIDEBAR DETAILS */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{format(selectedDate, 'EEEE')}</h2>
            <p className="text-gray-500 text-sm">{format(selectedDate, 'MMMM do')}</p>

            <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                 <span className="text-sm font-bold text-gray-700 block">Status</span>
                 <span className={`text-xs ${dayIsAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {dayIsAvailable ? 'Open for Booking' : 'Marked as Day Off'}
                 </span>
              </div>

              <button
                onClick={toggleAvailability}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border shadow-sm ${
                  dayIsAvailable
                    ? 'bg-white text-red-600 border-gray-300 hover:bg-red-50'
                    : 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700'
                }`}
              >
                {dayIsAvailable ? 'Mark as OFF' : 'Mark Available'}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Global Sessions */}
            {selectedSess.map((s) => (
              <div key={s.id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r shadow-sm">
                <div className="flex justify-between text-xs font-bold text-red-800 mb-1">
                  <span>LIVE SESSION</span>
                  <span>{format(parseISO(s.startTime), 'HH:mm')}</span>
                </div>
                <div className="text-sm font-medium text-red-900">{s.title}</div>
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <UserCircleIcon className="w-3 h-3" /> {s.host?.fullName}
                </div>
              </div>
            ))}

            {/* My Appointments */}
            {selectedApps.map((a) => (
              <div key={a.id} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:border-purple-400 transition-colors">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-700 font-bold text-sm flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" /> {format(parseISO(a.scheduledAt), 'HH:mm')}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{a.status}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                       {a.user?.avatarUrl
                         ? <img src={a.user.avatarUrl} className="w-full h-full object-cover"/>
                         : <UserCircleIcon className="w-full h-full text-gray-400"/>}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{a.user?.fullName || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">{a.user?.phoneNumber}</div>
                    </div>
                 </div>
                 {a.notes && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                        "{a.notes}"
                    </div>
                 )}
              </div>
            ))}

            {/* Empty State */}
            {selectedSess.length === 0 && selectedApps.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>No events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}