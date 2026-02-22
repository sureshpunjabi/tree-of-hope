import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface MagicLinkRequest {
  email: string;
  redirect_to: string;
}

interface MagicLinkResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<MagicLinkResponse>> {
  try {
    const body: MagicLinkRequest = await request.json();
    const { email, redirect_to } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Build the redirect URL using the request origin (works in both dev and production)
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || 'https://tree-of-hope-olive.vercel.app';
    const redirectUrl = redirect_to ? (redirect_to.startsWith('http') ? redirect_to : `${origin}${redirect_to}`) : origin;

    const supabase = getServiceSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Track analytics
    await trackServerEvent('magic_link_sent', {
      email,
    });

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to email',
    });
  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
