'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CheckBadgeIcon, UserIcon, BriefcaseIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function StaffSignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('THERAPIST'); // Default to Therapist
  const [specialty, setSpecialty] = useState(''); // Only for Therapists

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Prepare Metadata based on Role
      // We set status to 'pending' so the Super Admin must approve them
      const metaData = {
        full_name: fullName,
        role: role === 'ADMIN' ? 'SEC_SUPER_8841' : 'THERAPIST', // Use your secure admin role string
        specialty: role === 'THERAPIST' ? specialty : null,
        status: 'pending'
      };

      // 2. Sign Up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metaData, // Pass metadata to be saved in auth.users
        },
      });

      if (signUpError) throw signUpError;

      // 3. Create/Update Profile Entry Manually (Ensures data is in public.Profile)
      // Note: Triggers usually handle this, but this is a fail-safe
      if (data.user) {
        const { error: profileError } = await supabase
          .from('Profile')
          .insert([
            {
              id: data.user.id,
              fullName: fullName,
              role: metaData.role,
              specialty: metaData.specialty,
              status: 'pending',
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
            }
          ]);

        // Ignore duplicate key error if trigger already created it
        if (profileError && !profileError.message.includes('duplicate')) {
             console.error('Profile creation warning:', profileError);
        }
      }

      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
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
            <h1 className="text-4xl font-bold mb-4">Join the Team</h1>
            <p className="text-lg text-indigo-200 max-w-md mx-auto">
                Create your professional account to start managing patients and content.
            </p>
            <p className="mt-8 text-sm bg-indigo-800/50 p-3 rounded-lg border border-indigo-700">
                Note: All new accounts require <strong>Super Admin approval</strong> before access is granted.
            </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">

          {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckBadgeIcon className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    Your account has been created and is <strong>pending approval</strong>.
                    Please contact the Super Admin to activate your access.
                </p>
                <Link href="/admin/login" className="inline-block bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition">
                    Return to Login
                </Link>
            </div>
          ) : (
            <>
                <div className="text-center lg:text-left mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Staff Account</h2>
                    <p className="mt-2 text-gray-600">Apply for staff access.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div
                            onClick={() => setRole('THERAPIST')}
                            className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${role === 'THERAPIST' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <UserIcon className="w-6 h-6" />
                            <span className="font-bold text-sm">Therapist</span>
                        </div>
                        <div
                            onClick={() => setRole('ADMIN')}
                            className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${role === 'ADMIN' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <BriefcaseIcon className="w-6 h-6" />
                            <span className="font-bold text-sm">Staff Admin</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            required
                            placeholder="Dr. Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            required
                            placeholder="jane@mentalclinic.com"
                        />
                    </div>

                    {/* Conditional Specialty Field */}
                    {role === 'THERAPIST' && (
                        <div className="animate-in slide-in-from-top-2 fade-in">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                            <select
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                                required
                            >
                                <option value="" disabled>Select Specialty</option>
                                <option value="Psychologist">Psychologist</option>
                                <option value="Psychiatrist">Psychiatrist</option>
                                <option value="Counselor">Counselor</option>
                                <option value="Clinical Therapist">Clinical Therapist</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-3 px-4 rounded-lg text-white transition-all duration-200
                            ${loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                    >
                        {loading ? 'Submitting Application...' : 'Apply for Account'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link href="/admin/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}