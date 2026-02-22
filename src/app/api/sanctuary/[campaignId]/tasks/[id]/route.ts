import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    campaignId: string;
    id: string;
  }>;
}

interface TaskResponse {
  success: boolean;
  task?: Record<string, unknown>;
  error?: string;
}

// PATCH - update a task record
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<TaskResponse>> {
  try {
    const { campaignId, id } = await params;
    const body = await request.json();
    const supabase = getServiceSupabase();

    // Only allow updating specific fields
    const allowedFields = ['is_completed', 'completed_at', 'title', 'description', 'due_date'];
    const updateData: Record<string, unknown> = {};

    allowedFields.forEach((field) => {
      if (field in body) {
        updateData[field] = body[field];
      }
    });

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update task' },
        { status: 500 }
      );
    }

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - delete a task record
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<TaskResponse>> {
  try {
    const { campaignId, id } = await params;
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Failed to delete task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
