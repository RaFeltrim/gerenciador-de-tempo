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
};