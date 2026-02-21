import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateLeafRequest {
  author_name: string;
  message: string;
  is_public: boolean;
}

interface Leaf {
  id: string;
  campaign_id: string;
  author_name: string;
  message: string;
  position_x: number;
  position_y: number;
  is_public: boolean;
  is_hidden: boolean;
  created_at: string;
}

interface LeafResponse {
  success: boolean;
  leaves?: Leaf[];
  leaf?: Leaf;
  error?: string;
}

// Leaf placement algorithm
function calculateLeafPosition(leafIndex: number): { x: number; y: number } {
  // Spiral pattern starting from center
  const angleStep = 137.5; // Golden angle in degrees
  const radiusStep = 30; // Pixels between each leaf
  const centerX = 500;
  const centerY = 300;

  const angle = (leafIndex * angleStep * Math.PI) / 180;
  const radius = Math.sqrt(leafIndex) * radiusStep;

  const x = Math.round(centerX + radius * Math.cos(angle));
  const y = Math.round(centerY + radius * Math.sin(angle));

  return { x, y };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<LeafResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { campaignId } = await params;

    const { data: leaves = [], error } = await supabase
      .from('leaves')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_public', true)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leaves' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leaves: leaves || [],
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<LeafResponse>> {
  try {
    const body: CreateLeafRequest = await request.json();
    const { campaignId } = await params;
    const { author_name, message, is_public } = body;

    if (!author_name || !message) {
      return NextResponse.json(
        { success: false, error: 'Author name and message are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get current leaf count
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('leaf_count')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const currentLeafCount = campaignData?.leaf_count || 0;
    const { x: position_x, y: position_y } =
      calculateLeafPosition(currentLeafCount);

    // Create leaf
    const { data: leaf, error: leafError } = await supabase
      .from('leaves')
      .insert({
        campaign_id: campaignId,
        author_name,
        message,
        is_public,
        is_hidden: false,
        position_x,
        position_y,
      })
      .select()
      .single();

    if (leafError) {
      console.error('Leaf creation error:', leafError);
      return NextResponse.json(
        { success: false, error: 'Failed to create leaf' },
        { status: 500 }
      );
    }

    // Increment leaf count
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ leaf_count: currentLeafCount + 1 })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Failed to update leaf count:', updateError);
    }

    // Track analytics
    await trackServerEvent('leaf_submitted', {
      campaign_id: campaignId,
      is_public,
    });

    return NextResponse.json(
      {
        success: true,
        leaf,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating leaf:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
