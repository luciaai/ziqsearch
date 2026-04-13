import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feedback } from '@/lib/db/schema';
import { generateId } from 'ai';
import { Resend } from 'resend';
import { serverEnv } from '@/env/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const resend = new Resend(serverEnv.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, subject, message, email, name } = body;

    // Validate required fields
    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || null;
    const userEmail = email || session?.user?.email || 'anonymous@ziqsearch.com';
    const userName = name || session?.user?.name || 'Anonymous';

    // Save to database
    const feedbackId = generateId();
    await db.insert(feedback).values({
      id: feedbackId,
      userId,
      email: userEmail,
      name: userName,
      type,
      subject,
      message,
      status: 'new',
    });

    // Send email notification
    try {
      await resend.emails.send({
        from: 'Ziq Feedback <feedback@ziqsearch.com>',
        to: 'ziqsearch@gmail.com',
        replyTo: userEmail,
        subject: `[${type.toUpperCase()}] ${subject}`,
        html: `
          <h2>New Feedback Submission</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>From:</strong> ${userName} (${userEmail})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr />
          <p><small>Feedback ID: ${feedbackId}</small></p>
          <p><small>View in admin: https://www.ziqsearch.com/admin/feedback</small></p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send feedback email:', emailError);
      // Don't fail the request if email fails - feedback is still saved
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
