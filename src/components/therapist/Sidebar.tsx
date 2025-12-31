'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast'; // <--- 1. Import Toast
import {
  HomeIcon, VideoCameraIcon, BookOpenIcon,
  ChatBubbleLeftRightIcon, CalendarIcon, UserCircleIcon,
  ArrowLeftOnRectangleIcon, RectangleStackIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/therapist-admin', icon: HomeIcon },
  { name: 'Live Sessions', href: '/therapist-admin/sessions', icon: VideoCameraIcon },
  { name: 'My Articles', href: '/therapist-admin/articles', icon: BookOpenIcon },
  { name: 'My Modules', href: '/therapist-admin/modules', icon: RectangleStackIcon },
  { name: 'Community', href: '/therapist-admin/community', icon: ChatBubbleLeftRightIcon },
  { name: 'My Calendar', href: '/therapist-admin/calendar', icon: CalendarIcon },
  { name: 'Profile', href: '/therapist-admin/profile', icon: UserCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    // 2. Add Feedback
    const toastId = toast.loading('Signing out...');

    try {
      await supabase.auth.signOut();
      toast.success('See you soon!', { id: toastId });

      // 3. Redirect to Main Login
      router.push('/admin/login');
      router.refresh(); // Ensure the router cache clears
    } catch (error) {
      toast.error('Error signing out', { id: toastId });
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen shadow-sm z-10">

      {/* Header */}
      <div className="flex items-center justify-center h-20 border-b border-gray-100 bg-teal-700">
        <h1 className="text-xl font-bold text-white tracking-wide">Therapist Portal</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col overflow-y-auto py-6">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            // Check if current path starts with the href (for active state on sub-pages)
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors ${
                    isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all border border-transparent hover:border-red-100"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}