/**
 * Common API response types used across the application
 */

/**
 * Standard error response structure
 */
export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Standard success response structure
 */
export interface ApiSuccess<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Task API response types
 */
export interface TaskResponse {
  task: Task;
}

export interface TasksResponse {
  tasks: Task[];
  message?: string;
}

/**
 * Task structure from API
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  category?: string | null;
  tags?: string[];
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'weekdays' | null;
  parentTaskId?: string | null;
  googleTaskId?: string | null;
}

/**
 * Parsed task response from NLP API
 */
export interface ParsedTask {
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null;
  isRecurring: boolean;
  recurrencePattern: 'daily' | 'weekly' | 'monthly' | 'weekdays' | null;
}

/**
 * Google Calendar event structure
 */
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

/**
 * Google Task structure
 */
export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: string;
  updated: string;
}

/**
 * Calendar API response
 */
export interface CalendarResponse {
  events: CalendarEvent[];
}

/**
 * Google Tasks API response
 */
export interface GoogleTasksResponse {
  tasks: GoogleTask[];
}
