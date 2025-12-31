import { redirect } from 'next/navigation';

export default function HomePage() {
  // Immediately redirect the user to the admin login page
  redirect('/admin/login');
}