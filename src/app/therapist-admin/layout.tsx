'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Using your custom client
import Sidebar from '@/components/therapist/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // 1. Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in? Go to main login
        router.push('/admin/login');
        return;
      }

      // 2. Check if the user is actually a THERAPIST
      const { data: profile } = await supabase
        .from('Profile')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'THERAPIST') {
        // Wrong role? Log them out and kick them out
        await supabase.auth.signOut();
        alert('Access Denied. This area is for Therapists only.');
        router.replace('/admin/login');
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-teal-600 font-medium animate-pulse">Loading Portal...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* 2. ADD TOASTER HERE (Invisible until called) */}
      <Toaster position="top-right" reverseOrder={false} />

      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}