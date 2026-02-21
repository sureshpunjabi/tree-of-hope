import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';
import { cookies } from 'next/headers';

interface VerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<VerifyResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('next') || '/';

    if (!token_hash || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing token_hash or type' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'invite' | 'email_change',
    });

    if (error) {
      console.error('OTP verification error:', error);
      await trackServerEvent('magic_link_opened', {
        success: false,
        error: error.message,
      });
      await trackServerEvent('sign_in_failed', {
        reason: error.message,
      });
      return NextResponse.json(
        { success: false, error: error.message, redirectUrl: '/' },
        { status: 400 }
      );
    }

    // Track successful events
    await trackServerEvent('magic_link_opened', {
      success: true,
    });
    await trackServerEvent('sign_in_success', {
      user_id: data.user?.id,
    });

    // Set auth cookies
    if (data.session) {
      const cookieStore = await cookies();
      cookieStore.set('auth-token', data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      redirectUrl: next,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify email', redirectUrl: '/' },
      { status: 500 }
    );
  }
}
