import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { feedback } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// Admin email - only this user can access
const ADMIN_EMAIL = 'esawalk@gmail.com';

async function getFeedback() {
  const allFeedback = await db
    .select()
    .from(feedback)
    .orderBy(desc(feedback.createdAt));

  return allFeedback;
}

export default async function AdminFeedbackPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  // Check if user is admin
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const feedbackList = await getFeedback();

  const newCount = feedbackList.filter((f) => f.status === 'new').length;
  const readCount = feedbackList.filter((f) => f.status === 'read').length;
  const resolvedCount = feedbackList.filter((f) => f.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">� Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage costs and user feedback</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          <Link 
            href="/admin/costs"
            className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted"
          >
            💰 Costs
          </Link>
          <Link 
            href="/admin/feedback"
            className="px-4 py-2 font-medium border-b-2 border-primary text-primary"
          >
            📬 Feedback
          </Link>
        </div>

        <p className="text-muted-foreground mb-8">View and manage user feedback submissions</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">New</div>
            <div className="text-3xl font-bold text-blue-600">{newCount}</div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Read</div>
            <div className="text-3xl font-bold text-yellow-600">{readCount}</div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Resolved</div>
            <div className="text-3xl font-bold text-green-600">{resolvedCount}</div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-card border rounded-lg overflow-hidden">
          {feedbackList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No feedback submissions yet
            </div>
          ) : (
            <div className="divide-y">
              {feedbackList.map((item) => (
                <div key={item.id} className="p-6 hover:bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'compliment'
                            ? 'bg-green-100 text-green-700'
                            : item.type === 'bug'
                              ? 'bg-red-100 text-red-700'
                              : item.type === 'feature'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.type === 'compliment' 
                          ? '💚 Compliment' 
                          : item.type === 'bug' 
                            ? '🐛 Bug' 
                            : item.type === 'feature' 
                              ? '✨ Feature' 
                              : '💬 General'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : item.status === 'read'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{item.subject}</h3>

                  <p className="text-muted-foreground mb-3 whitespace-pre-wrap">{item.message}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>From:</strong> {item.name || 'Anonymous'}
                    </div>
                    {item.email && (
                      <div>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${item.email}`} className="text-primary hover:underline">
                          {item.email}
                        </a>
                      </div>
                    )}
                    <div className="text-xs">
                      <strong>ID:</strong> {item.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
