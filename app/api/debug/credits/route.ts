import { NextRequest, NextResponse } from 'next/server';
import { debugCredits } from '@/lib/debug-credits';

// Prevent static generation for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Extract user ID from query params if provided
    const userId = req.nextUrl.searchParams.get('userId');
    
    // Get debug information
    const debugInfo = await debugCredits(userId || undefined);
    
    return NextResponse.json({
      credits: debugInfo.foundUsers?.[0]?.credits || 0,
      isAdmin: false, // You can implement admin check logic here if needed
      debug: debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in debug credits endpoint:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to debug credits',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        credits: 0,
        isAdmin: false
      },
      { status: 500 }
    );
  }
}
