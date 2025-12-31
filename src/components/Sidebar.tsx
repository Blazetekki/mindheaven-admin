'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Modules', href: '/admin/modules' },
  { name: 'Articles', href: '/admin/articles' },
  { name: 'Community', href: '/admin/community' },
  { name: 'Journals', href: '/admin/journals' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="flex-grow p-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-yellow-500 hover:text-gray-900 ${
                isActive ? 'bg-yellow-500 text-gray-900' : ''
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}