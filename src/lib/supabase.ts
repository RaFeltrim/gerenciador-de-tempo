import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - configure via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Create a single supabase client for interacting with your database
// Only create if credentials are available
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// For backwards compatibility - will be null if not configured
export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Database types
export interface DbTask {
  id: string;
  user_email: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimated_time: number | null;
  due_date: string | null;
  completed: boolean;
  category: string | null;
  tags: string[];
  is_recurring: boolean;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'weekdays' | null;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
}

// Task CRUD operations
export const taskOperations = {
  // Get all tasks for a user
  async getTasks(userEmail: string): Promise<DbTask[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    
    return data || [];
  },

  // Create a new task
  async createTask(task: Omit<DbTask, 'created_at' | 'updated_at'>): Promise<DbTask | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    
    const { data, error } = await client
      .from('tasks')
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    
    return data;
  },

  // Update a task
  async updateTask(id: string, userEmail: string, updates: Partial<DbTask>): Promise<DbTask | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    
    const { data, error } = await client
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_email', userEmail)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return null;
    }
    
    return data;
  },

  // Delete a task
  async deleteTask(id: string, userEmail: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    
    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_email', userEmail);
    
    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }
    
    return true;
  },

  // Toggle task completion
  async toggleTaskCompletion(id: string, userEmail: string, completed: boolean): Promise<DbTask | null> {
    return this.updateTask(id, userEmail, { completed });
  },

  // Complete a recurring task and create next occurrence
  async completeRecurringTask(task: DbTask): Promise<{ completedTask: DbTask | null; nextTask: DbTask | null }> {
    const client = getSupabaseClient();
    if (!client) return { completedTask: null, nextTask: null };

    // Mark current task as completed
    const completedTask = await this.updateTask(task.id, task.user_email, { completed: true });
    if (!completedTask) return { completedTask: null, nextTask: null };

    // If not recurring or no pattern, just return the completed task
    if (!task.is_recurring || !task.recurrence_pattern) {
      return { completedTask, nextTask: null };
    }

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(task.due_date, task.recurrence_pattern);
    if (!nextDueDate) return { completedTask, nextTask: null };

    // Create new task instance for next occurrence
    const nextTask = await this.createTask({
      id: crypto.randomUUID(),
      user_email: task.user_email,
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimated_time: task.estimated_time,
      due_date: nextDueDate,
      completed: false,
      category: task.category,
      tags: task.tags,
      is_recurring: true,
      recurrence_pattern: task.recurrence_pattern,
      parent_task_id: task.parent_task_id || task.id, // Link to original master task
    });

    return { completedTask, nextTask };
  },
};

// Helper function to calculate next due date based on recurrence pattern
export function calculateNextDueDate(currentDueDate: string | null, pattern: 'daily' | 'weekly' | 'monthly' | 'weekdays'): string | null {
  const baseDate = currentDueDate ? new Date(currentDueDate) : new Date();
  const nextDate = new Date(baseDate);

  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'weekdays':
      // Move to next weekday
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
      break;
    default:
      return null;
  }

  return nextDate.toISOString();
}