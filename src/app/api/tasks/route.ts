import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { taskOperations, isSupabaseConfigured } from '../../../lib/supabase';
import { validateISODateString } from '../../../lib/date-validation';

// GET /api/tasks - Get all tasks for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        tasks: [], 
        message: 'Supabase not configured - tasks are stored locally' 
      });
    }

    const tasks = await taskOperations.getTasks(session.user.email);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        message: 'Tasks will be stored locally in browser'
      }, { status: 503 });
    }

    const body = await request.json();
    const { id, title, description, priority, estimatedTime, dueDate, category, tags, isRecurring, recurrencePattern } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate the due date if provided
    const dateValidation = validateISODateString(dueDate);
    if (!dateValidation.valid) {
      return NextResponse.json({ 
        error: dateValidation.error || 'A data inserida não existe no calendário (ex: 31 de Novembro).'
      }, { status: 400 });
    }

    const task = await taskOperations.createTask({
      id,
      user_email: session.user.email,
      title,
      description: description || '',
      priority: priority || 'medium',
      estimated_time: estimatedTime || null,
      due_date: dueDate || null,
      completed: false,
      category: category || null,
      tags: tags || [],
      is_recurring: isRecurring || false,
      recurrence_pattern: recurrencePattern || null,
      parent_task_id: null,
    });

    if (!task) {
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        message: 'Tasks will be stored locally in browser'
      }, { status: 503 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Validate the due date if being updated
    if (updates.dueDate !== undefined) {
      const dateValidation = validateISODateString(updates.dueDate);
      if (!dateValidation.valid) {
        return NextResponse.json({ 
          error: dateValidation.error || 'A data inserida não existe no calendário (ex: 31 de Novembro).'
        }, { status: 400 });
      }
    }

    // Map frontend field names to database field names
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
    if (updates.recurrencePattern !== undefined) dbUpdates.recurrence_pattern = updates.recurrencePattern;

    const task = await taskOperations.updateTask(id, session.user.email, dbUpdates);

    if (!task) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        message: 'Tasks will be stored locally in browser'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const success = await taskOperations.deleteTask(id, session.user.email);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
