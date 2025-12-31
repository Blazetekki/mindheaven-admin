'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { UserCircleIcon, PencilIcon, BriefcaseIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function TherapistProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('Profile')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Banner / Header Background */}
        <div className="h-32 bg-gradient-to-r from-teal-600 to-teal-800"></div>

        <div className="px-8 pb-8">
          {/* Avatar & Header Row */}
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>

            <Link
              href="/therapist-admin/profile/edit"
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* User Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile?.fullName || 'No Name Set'}</h1>
            <p className="text-teal-600 font-medium flex items-center mt-1">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              {profile?.specialty || 'General Therapist'}
            </p>

            {/* Bio Section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About Me</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {profile?.about || 'No bio added yet. Click "Edit Profile" to tell patients about yourself.'}
              </p>
            </div>

            {/* Contact Info Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-500 mb-1">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase font-bold tracking-wider">Phone</span>
                </div>
                <p className="text-gray-900 font-medium">{profile?.phoneNumber || 'Not provided'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-500 mb-1">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase font-bold tracking-wider">Clinic Address</span>
                </div>
                <p className="text-gray-900 font-medium">{profile?.address || 'Not provided'}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}