import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth-utils';
import { FeedbackAdmin } from './feedback-admin';

export default async function FeedbackAdminPage() {
  const user = await getUser();

  // Restrict access to admin emails only
  const adminEmails = ['ziqsearch@gmail.com', 'esawalk@gmail.com'];
  
  if (!user || !adminEmails.includes(user.email)) {
    redirect('/');
  }

  return <FeedbackAdmin />;
}
