import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feedback } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/auth-utils';

// GET - Fetch all feedback
export async function GET() {
  try {
    const user = await getUser();
    const adminEmails = ['ziqsearch@gmail.com', 'esawalk@gmail.com'];
    
    if (!user || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allFeedback = await db
      .select()
      .from(feedback)
      .orderBy(feedback.createdAt);

    return NextResponse.json(allFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

// PATCH - Update feedback status
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser();
    const adminEmails = ['ziqsearch@gmail.com', 'esawalk@gmail.com'];
    
    if (!user || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    await db
      .update(feedback)
      .set({ status })
      .where(eq(feedback.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

// DELETE - Delete feedback
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    const adminEmails = ['ziqsearch@gmail.com', 'esawalk@gmail.com'];
    
    if (!user || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db
      .delete(feedback)
      .where(eq(feedback.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
