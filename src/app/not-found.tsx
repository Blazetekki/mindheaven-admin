import Link from 'next/link';
import { HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Visual Icon */}
      <div className="bg-white p-6 rounded-full shadow-lg mb-8 animate-bounce">
         <ExclamationTriangleIcon className="w-16 h-16 text-indigo-500" />
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HomeIcon className="w-5 h-5" />
              Return Home
            </Link>


        </div>
      </div>

      <div className="mt-12 text-sm text-gray-400">
        MentalClinic Portal &bull; System v1.0
      </div>
    </div>
  );
}