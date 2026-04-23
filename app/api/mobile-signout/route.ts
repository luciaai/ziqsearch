import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true });

    // Clear all better-auth related cookies
    const cookiesToDelete = [
      'better-auth.session_token',
      'session_token',
      'better-auth.csrf_token',
      'better-auth.dontRememberToken',
    ];

    cookiesToDelete.forEach((cookieName) => {
      // Clear from cookie store
      cookieStore.delete(cookieName);
      
      // Also set in response with expired date
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });

    return response;
  } catch (error) {
    console.error('Mobile signout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
