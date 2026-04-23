import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { session } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('[MOBILE-SIGNOUT] Starting mobile signout');
    const cookieStore = await cookies();
    
    // Get session token before deleting
    const sessionToken = cookieStore.get('better-auth.session_token')?.value;
    console.log('[MOBILE-SIGNOUT] Session token found:', !!sessionToken);
    
    // Delete session from database if token exists
    if (sessionToken) {
      try {
        await db.delete(session).where(eq(session.token, sessionToken));
        console.log('[MOBILE-SIGNOUT] Session deleted from database');
      } catch (dbError) {
        console.error('[MOBILE-SIGNOUT] Database deletion error:', dbError);
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear all better-auth related cookies with multiple variations
    const cookiesToDelete = [
      'better-auth.session_token',
      'session_token',
      'better-auth.csrf_token',
      'better-auth.dontRememberToken',
      'authjs.session-token',
      'next-auth.session-token',
    ];

    cookiesToDelete.forEach((cookieName) => {
      // Clear from cookie store
      cookieStore.delete(cookieName);
      
      // Set in response with expired date - multiple variations for iOS
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false, // Allow client-side deletion
        secure: false, // Allow on both HTTP and HTTPS
        sameSite: 'lax',
      });
      
      // Also try with httpOnly true
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });

    console.log('[MOBILE-SIGNOUT] Cookies cleared, returning success');
    return response;
  } catch (error) {
    console.error('[MOBILE-SIGNOUT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
