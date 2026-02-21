import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getAuthenticatedUser } from '@/lib/supabase';

interface CreateCampaignRequest {
  title: string;
  slug: string;
  description: string;
  patient_name: string;
  status?: string;
  image_url?: string;
  story?: string;
}

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  patient_name: string;
  status: string;
  leaf_count: number;
  supporter_count: number;
  created_at: string;
  [key: string]: unknown;
}

interface CampaignsResponse {
  success: boolean;
  campaigns?: Campaign[];
  campaign?: Campaign;
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<CampaignsResponse>> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getServiceSupabase();

    const { data: campaigns = [], error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CampaignsResponse>> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateCampaignRequest = await request.json();
    const {
      title,
      slug,
      description,
      patient_name,
      status = 'draft',
      image_url,
      story,
    } = body;

    if (!title || !slug || !description || !patient_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        title,
        slug,
        description,
        patient_name,
        status,
        image_url,
        story,
        leaf_count: 0,
        supporter_count: 0,
        monthly_total_cents: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create campaign:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
