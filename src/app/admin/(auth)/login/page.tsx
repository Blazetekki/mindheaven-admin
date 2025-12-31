'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CheckBadgeIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Attempt to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !user) {
        throw new Error('Invalid email or password.');
      }

      // 2. Fetch Profile to check Role & Super Admin status
      const { data: profile, error: profileError } = await supabase
        .from('Profile')
        .select('role, specialty, isSuperAdmin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Could not verify staff privileges.');
      }

      // 3. Routing Logic
      if (profile?.isSuperAdmin) {
        // A. Super Admin (Developer/Owner)
        router.push('/supa');
      }
      else if (profile?.role === 'THERAPIST' || profile?.specialty) {
        // B. Therapists
        router.push('/therapist-admin');
      }
      // --- SECURITY UPDATE: CHANGED 'ADMIN' TO OBSCURE STRING ---
      else if (profile?.role === 'SEC_SUPER_8841') {
        // C. Standard Admins
        router.push('/admin/modules');
      }
      else {
        // D. Regular Users (Patients) - Kick them out
        await supabase.auth.signOut();
        throw new Error('Access Denied');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 text-center">
            <div className="mb-6 flex justify-center">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                    <CheckBadgeIcon className="w-16 h-16 text-indigo-300" />
                </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Admin Portal</h1>
            <p className="text-xl text-indigo-200 max-w-md mx-auto">
                Secure access for Therapists
            </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">Sign In</h2>
            <p className="mt-2 text-gray-600">Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserGroupIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-red-700 font-medium ml-3">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all duration-200
                ${loading
                    ? 'bg-indigo-400 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
          <div className="text-center mt-4">
              <p className="text-xs text-gray-400">Protected area. All activities are monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}