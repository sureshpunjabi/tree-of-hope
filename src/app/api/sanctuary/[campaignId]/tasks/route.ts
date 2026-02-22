import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateTaskRequest {
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

interface Task {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
}

interface TaskResponse {
  success: boolean;
  tasks?: Task[];
  task?: Task;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<TaskResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { campaignId } = await params;

    // Look up campaign by slug
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
      .single();
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }
    const realCampaignId = campaign.id;

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('campaign_id', realCampaignId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: tasks = [], error } = await query.order('due_date', {
      ascending: true,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<TaskResponse>> {
  try {
    const body: CreateTaskRequest = await request.json();
    const { campaignId } = await params;
    const {
      user_id,
      title,
      description,
      due_date,
      priority,
      completed = false,
    } = body;

    if (!user_id || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Look up campaign by slug
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
      .single();
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }
    const realCampaignId = campaign.id;

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        campaign_id: realCampaignId,
        user_id,
        title,
        description,
        due_date,
        priority,
        completed,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create task' },
        { status: 500 }
      );
    }

    // Track analytics
    await trackServerEvent('tool_used', {
      campaign_id: realCampaignId,
      user_id,
      tool: 'tasks',
    });

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
