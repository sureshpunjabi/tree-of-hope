import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getAuthenticatedUser } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface PreBuildRequest {
  bridge_id: string;
  patient_name: string;
  title: string;
  story: string;
}

interface PreBuildResponse {
  success: boolean;
  campaign?: Record<string, unknown>;
  error?: string;
}

// Leaf placement algorithm
function calculateLeafPosition(leafIndex: number): { x: number; y: number } {
  const angleStep = 137.5;
  const radiusStep = 30;
  const centerX = 500;
  const centerY = 300;

  const angle = (leafIndex * angleStep * Math.PI) / 180;
  const radius = Math.sqrt(leafIndex) * radiusStep;

  const x = Math.round(centerX + radius * Math.cos(angle));
  const y = Math.round(centerY + radius * Math.sin(angle));

  return { x, y };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PreBuildResponse>> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: PreBuildRequest = await request.json();
    const { bridge_id, patient_name, title, story } = body;

    if (!bridge_id || !patient_name || !title || !story) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get bridge campaign for reference
    const { data: bridge, error: bridgeError } = await supabase
      .from('bridge_campaigns')
      .select('*')
      .eq('id', bridge_id)
      .single();

    if (bridgeError || !bridge) {
      return NextResponse.json(
        { success: false, error: 'Bridge not found' },
        { status: 404 }
      );
    }

    // Create campaign in 'draft' status
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        title,
        slug,
        description: story,
        patient_name,
        status: 'draft',
        story,
        leaf_count: 0,
        supporter_count: 0,
        monthly_total_cents: 0,
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      console.error('Failed to create campaign:', campaignError);
      return NextResponse.json(
        { success: false, error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    // Update bridge to link campaign and set status to 'pre_built'
    const { error: updateError } = await supabase
      .from('bridge_campaigns')
      .update({
        campaign_id: campaign.id,
        status: 'pre_built',
      })
      .eq('id', bridge_id);

    if (updateError) {
      console.error('Failed to update bridge:', updateError);
    }

    // Create 3 seed leaves
    const seedMessages = [
      {
        author_name: 'Tree of Hope',
        message: 'Wishing you strength and healing on this journey.',
      },
      {
        author_name: 'Tree of Hope',
        message: 'Your story matters. We are here to support you.',
      },
      {
        author_name: 'Tree of Hope',
        message: 'May this tree grow with love and hope for your recovery.',
      },
    ];

    for (let i = 0; i < seedMessages.length; i++) {
      const { x: position_x, y: position_y } = calculateLeafPosition(i);
      await supabase.from('leaves').insert({
        campaign_id: campaign.id,
        author_name: seedMessages[i].author_name,
        message: seedMessages[i].message,
        is_public: true,
        is_hidden: false,
        position_x,
        position_y,
      });
    }

    // Update campaign leaf count
    await supabase
      .from('campaigns')
      .update({ leaf_count: 3 })
      .eq('id', campaign.id);

    // Track analytics
    await trackServerEvent('bridge_pre_built', {
      bridge_id,
      campaign_id: campaign.id,
      patient_name,
    });

    return NextResponse.json(
      {
        success: true,
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error pre-building bridge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
