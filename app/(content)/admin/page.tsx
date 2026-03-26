import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth-utils';
import { AdminDashboard } from './admin-dashboard';

export default async function AdminPage() {
  const user = await getUser();

  // Restrict access to admin emails only
  const adminEmails = ['ziqsearch@gmail.com', 'esawalk@gmail.com'];
  
  if (!user || !adminEmails.includes(user.email)) {
    redirect('/');
  }

  return <AdminDashboard />;
}
