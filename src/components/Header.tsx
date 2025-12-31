'use client';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login'); // Redirect to login after sign out
  };

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="flex items-center justify-end h-16 px-6">
        <Menu as="div" className="relative">
          <div>
            <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none">
              {/* Placeholder Avatar Icon */}
              <span className="text-white font-bold">A</span>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-gray-700 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a href="#" className={`${active ? 'bg-yellow-500 text-gray-900' : 'text-white'} block px-4 py-2 text-sm`}>
                      Edit Profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${active ? 'bg-yellow-500 text-gray-900' : 'text-white'} block w-full px-4 py-2 text-left text-sm`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}