'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Timer,
  Flag,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Tag,
  Edit3,
  X,
  Save,
  Repeat,
  RefreshCw,
  Cloud,
  ListTodo,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import { calculateNextDueDate, getRecurrenceLabel, RecurrencePattern } from '../../lib/task-utils';

// Constants
const DEFAULT_EVENT_DURATION_MINUTES = 60;
const STATUS_RESET_DELAY_MS = 3000;
const MIN_DESCRIPTION_LENGTH_THRESHOLD = 10;
const DEFAULT_TIMER_MINUTES = 25;
const DEFAULT_TIMER_SECONDS = DEFAULT_TIMER_MINUTES * 60;

// Predefined categories with gradient colors
const CATEGORIES = [
  {
    id: 'work',
    name: 'Trabalho',
    color: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'personal',
    name: 'Pessoal',
    color: 'bg-purple-100 text-purple-700',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    id: 'study',
    name: 'Estudo',
    color: 'bg-green-100 text-green-700',
    gradient: 'from-green-500 to-green-600',
  },
  {
    id: 'health',
    name: 'Saúde',
    color: 'bg-red-100 text-red-700',
    gradient: 'from-red-500 to-red-600',
  },
  {
    id: 'finance',
    name: 'Finanças',
    color: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    id: 'other',
    name: 'Outros',
    color: 'bg-gray-100 text-gray-700',
    gradient: 'from-gray-500 to-gray-600',
  },
];

interface Task {
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
  recurrencePattern?: RecurrencePattern | null;
  parentTaskId?: string | null;
  googleTaskId?: string | null;
}

interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: string;
  updated: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

// Helper function to check if description is essentially the same as title
const isDescriptionRedundant = (title: string, description: string): boolean => {
  if (!description || !title) return true;
  if (description.length > title.length + MIN_DESCRIPTION_LENGTH_THRESHOLD) {
    return false;
  }
  const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedTitle = normalizeString(title);
  const normalizedDesc = normalizeString(description);
  return normalizedDesc === normalizedTitle || normalizedTitle === normalizedDesc;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Refs to store latest session data
  const sessionRef = useRef(session);
  const statusRef = useRef(status);

  // Update refs when session or status changes
  useEffect(() => {
    sessionRef.current = session;
    statusRef.current = status;
  }, [session, status]);

  // Core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [googleTasks, setGoogleTasks] = useState<GoogleTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // UI state
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');
  const [customTime, setCustomTime] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [activeTab, setActiveTab] = useState<'local' | 'google'>('local');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');

  // Fetch Google Tasks
  const fetchGoogleTasks = useCallback(async () => {
    // Only fetch if we have a valid session
    console.log('Checking session for Google Tasks:', {
      status: statusRef.current,
      accessToken: !!sessionRef.current?.accessToken,
    });
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) {
      console.log('Skipping Google Tasks fetch - not authenticated');
      return;
    }

    try {
      console.log('Fetching Google Tasks...');
      const response = await fetch('/api/google-tasks');
      console.log('Google Tasks response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setGoogleTasks(data.tasks || []);
        console.log('Google Tasks fetched successfully:', data.tasks?.length || 0);
      } else {
        console.error('Failed to fetch Google Tasks:', response.status);
        // Handle unauthorized specifically
        if (response.status === 401) {
          console.log('Session expired or invalid, signing out...');
          signOut({ callbackUrl: '/' });
        }
      }
    } catch (error) {
      console.error('Error fetching Google Tasks:', error);
    }
  }, []);

  // Fetch Calendar Events
  const fetchCalendarEvents = useCallback(async () => {
    // Only fetch if we have a valid session
    console.log('Checking session for Calendar Events:', {
      status: statusRef.current,
      accessToken: !!sessionRef.current?.accessToken,
    });
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) {
      console.log('Skipping Calendar Events fetch - not authenticated');
      return;
    }

    try {
      console.log('Fetching Calendar Events...');
      const response = await fetch('/api/calendar?maxResults=20');
      console.log('Calendar Events response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data.events || []);
        console.log('Calendar Events fetched successfully:', data.events?.length || 0);
      } else {
        console.error('Failed to fetch Calendar Events:', response.status);
        // Handle unauthorized specifically
        if (response.status === 401) {
          console.log('Session expired or invalid, signing out...');
          signOut({ callbackUrl: '/' });
        }
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  }, []);

  // Sync all Google data
  const syncGoogleData = async () => {
    // Only sync if we have a valid session
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) return;

    setIsSyncing(true);
    try {
      await Promise.all([fetchGoogleTasks(), fetchCalendarEvents()]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load tasks from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('focusflow_tasks');
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          console.error('Error loading tasks from localStorage:', e);
        }
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Fetch Google data only when session is fully authenticated
  useEffect(() => {
    console.log('Session status changed:', status);
    console.log('Session data:', session ? 'Available' : 'Not available');
    console.log('Access token:', session?.accessToken ? 'Available' : 'Not available');

    // Update refs when session or status changes
    sessionRef.current = session;
    statusRef.current = status;

    // Don't do anything while authentication is loading
    if (status === 'loading') {
      console.log('Session still loading, waiting...');
      return;
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting...');
      router.push('/');
      return;
    }

    // Only fetch data when fully authenticated with a valid access token
    if (status === 'authenticated' && session?.accessToken) {
      console.log('Session authenticated, fetching Google data...');
      // Add a small delay to ensure everything is properly initialized
      const timer = setTimeout(() => {
        fetchGoogleTasks();
        fetchCalendarEvents();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [status, session, router, fetchGoogleTasks, fetchCalendarEvents]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (typeof window !== 'undefined') {
        alert('Timer finalizado! Hora de uma pausa.');
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const parseTask = async (text: string) => {
    try {
      const response = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskText: text }),
      });
      if (!response.ok) throw new Error('Failed to parse task');
      return await response.json();
    } catch (error) {
      console.error('Error parsing task:', error);
      return null;
    }
  };

  const createCalendarEvent = async (task: Task) => {
    // Check if we have a valid session before making the request
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) {
      console.log('Cannot create calendar event - not authenticated');
      return;
    }

    if (!task.dueDate) return;

    try {
      setCalendarSyncStatus('syncing');
      const startTime = new Date(task.dueDate);
      const durationMinutes = task.estimatedTime || DEFAULT_EVENT_DURATION_MINUTES;
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create calendar event');
      }

      setCalendarSyncStatus('success');
      fetchCalendarEvents();
      setTimeout(() => setCalendarSyncStatus('idle'), STATUS_RESET_DELAY_MS);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      setCalendarSyncStatus('error');
      setTimeout(() => setCalendarSyncStatus('idle'), STATUS_RESET_DELAY_MS);
    }
  };

  const createGoogleTask = async (task: Task) => {
    // Check if we have a valid session before making the request
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) {
      console.log('Cannot create Google task - not authenticated');
      return null;
    }

    try {
      const response = await fetch('/api/google-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          notes: task.description,
          due: task.dueDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchGoogleTasks();
        return data.task;
      }
    } catch (error) {
      console.error('Error creating Google Task:', error);
    }
    return null;
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    setIsLoading(true);

    const parsedTask = await parseTask(newTaskText);
    const parsedCustomTime = customTime ? parseInt(customTime, 10) : NaN;
    const customTimeValue =
      !isNaN(parsedCustomTime) && parsedCustomTime > 0 && parsedCustomTime <= 480
        ? parsedCustomTime
        : null;
    const estimatedTime = customTimeValue || parsedTask?.estimatedTime || null;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: parsedTask?.title || newTaskText,
      description: parsedTask?.description || newTaskText,
      priority: parsedTask?.priority || 'medium',
      estimatedTime: estimatedTime,
      dueDate: parsedTask?.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      category: selectedCategory || null,
      tags: tags,
      isRecurring: parsedTask?.isRecurring || isRecurring,
      recurrencePattern: parsedTask?.recurrencePattern || (isRecurring ? recurrencePattern : null),
      parentTaskId: null,
      googleTaskId: null,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    setCustomTime('');
    setSelectedCategory('');
    setTagInput('');
    setIsRecurring(false);
    setRecurrencePattern('daily');
    setShowQuickAdd(false);

    // Sync with Google Calendar and Tasks
    if (newTask.dueDate) {
      await createCalendarEvent(newTask);
    }
    await createGoogleTask(newTask);

    setIsLoading(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const taskToToggle = prev.find(t => t.id === id);
      if (!taskToToggle) return prev;

      if (!taskToToggle.completed && taskToToggle.isRecurring && taskToToggle.recurrencePattern) {
        const nextDueDate = calculateNextDueDate(
          taskToToggle.dueDate,
          taskToToggle.recurrencePattern
        );
        const nextTask: Task = {
          id: crypto.randomUUID(),
          title: taskToToggle.title,
          description: taskToToggle.description,
          priority: taskToToggle.priority,
          estimatedTime: taskToToggle.estimatedTime,
          dueDate: nextDueDate,
          completed: false,
          createdAt: new Date().toISOString(),
          category: taskToToggle.category,
          tags: taskToToggle.tags,
          isRecurring: true,
          recurrencePattern: taskToToggle.recurrencePattern,
          parentTaskId: taskToToggle.parentTaskId || taskToToggle.id,
          googleTaskId: null,
        };

        return prev
          .map(task => (task.id === id ? { ...task, completed: true } : task))
          .concat(nextTask);
      }

      return prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task));
    });
  };

  const toggleGoogleTask = async (taskId: string, currentStatus: string) => {
    // Check if we have a valid session before making the request
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) {
      console.log('Cannot toggle Google task - not authenticated');
      return;
    }

    try {
      const newStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
      await fetch('/api/google-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      fetchGoogleTasks();
    } catch (error) {
      console.error('Error toggling Google Task:', error);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
    if (typeof window !== 'undefined') {
      const updatedTasks = tasks.filter(task => task.id !== id);
      if (updatedTasks.length === 0) {
        localStorage.removeItem('focusflow_tasks');
      }
    }
  };

  const deleteGoogleTask = async (taskId: string) => {
    // Check if we have a valid session before making the request
    if (statusRef.current !== 'authenticated' || !sessionRef.current?.accessToken) {
      console.log('Cannot delete Google task - not authenticated');
      return;
    }

    try {
      await fetch(`/api/google-tasks?taskId=${taskId}`, { method: 'DELETE' });
      fetchGoogleTasks();
    } catch (error) {
      console.error('Error deleting Google Task:', error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimatedTime: task.estimatedTime,
      dueDate: task.dueDate,
      category: task.category,
      tags: task.tags,
      isRecurring: task.isRecurring,
      recurrencePattern: task.recurrencePattern,
    });
  };

  const saveEdit = () => {
    if (!editingTaskId) return;
    setTasks(prev =>
      prev.map(task => (task.id === editingTaskId ? { ...task, ...editForm } : task))
    );
    setEditingTaskId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({});
  };

  const getCategoryInfo = (categoryId: string | null | undefined) => {
    return CATEGORIES.find(c => c.id === categoryId) || null;
  };

  const startTimerForTask = (taskId: string) => {
    // Set timer to default Pomodoro time (25 minutes) instead of task duration
    const totalSecs = DEFAULT_TIMER_SECONDS;
    setActiveTaskId(taskId);
    setTimerSeconds(totalSecs);
    setTimerTotalSeconds(totalSecs);
    setIsTimerRunning(false); // Don't start automatically, let user start manually
  };

  const setTimerPreset = (minutes: number) => {
    const totalSecs = minutes * 60;
    setTimerSeconds(totalSecs);
    setTimerTotalSeconds(totalSecs);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700',
        };
      case 'medium':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700',
        };
      case 'low':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-700',
        };
      default:
        return {
          border: 'border-l-gray-300',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
        };
    }
  };

  // Calendar helper functions
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const hasTasksOnDate = (date: Date): boolean => {
    const localTasks = tasks.some(task => task.dueDate && isSameDay(new Date(task.dueDate), date));
    const googleTasksMatch = googleTasks.some(
      task => task.due && isSameDay(new Date(task.due), date)
    );
    const calendarEventsMatch = calendarEvents.some(event => {
      const eventDate = event.start.dateTime || event.start.date;
      return eventDate && isSameDay(new Date(eventDate), date);
    });
    return localTasks || googleTasksMatch || calendarEventsMatch;
  };

  interface CalendarDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    hasEvent: boolean;
  }

  const getCalendarDays = (): CalendarDay[] => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0);
    const daysFromPrevMonth = prevMonthLastDay.getDate();

    const days: CalendarDay[] = [];

    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysFromPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, dayNumber: day, isCurrentMonth: false, hasEvent: hasTasksOnDate(date) });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, dayNumber: day, isCurrentMonth: true, hasEvent: hasTasksOnDate(date) });
    }

    // Always fill to 42 cells (6 weeks) - add days from next month
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, dayNumber: day, isCurrentMonth: false, hasEvent: hasTasksOnDate(date) });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-indigo-600 font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  // Filter events to only show those starting from now onwards
  const now = new Date();
  const upcomingEvents = calendarEvents
    .filter(event => {
      const eventStartDate = event.start.dateTime || event.start.date;
      if (!eventStartDate) return false;
      return new Date(eventStartDate) >= now;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FocusFlow</h1>
                <p className="text-xs text-gray-500">Seu assistente de produtividade</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sync Button */}
              <button
                onClick={syncGoogleData}
                disabled={isSyncing}
                className={`p-2 rounded-xl transition-all ${
                  isSyncing ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Sincronizar com Google"
              >
                <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-white/50 rounded-xl">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-indigo-100"
                  />
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-2xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <ListTodo className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                <p className="text-xs text-gray-500">Tarefas Locais</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                <p className="text-xs text-gray-500">Concluídas</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Cloud className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{googleTasks.length}</p>
                <p className="text-xs text-gray-500">Google Tasks</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <CalendarDays className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{calendarEvents.length}</p>
                <p className="text-xs text-gray-500">Eventos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Responsive layout */}
        <div className="dashboard-grid grid lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Task Card */}
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Nova Tarefa
                </h2>
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showQuickAdd ? 'Simplificar' : 'Mais opções'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addTask()}
                    placeholder="Ex: Reunião com cliente amanhã às 14h, alta prioridade"
                    className="w-full input-modern pr-12 h-12" // Added h-12 for better input height
                    disabled={isLoading}
                  />
                  <Zap className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={addTask}
                  disabled={isLoading || !newTaskText.trim()}
                  className="btn-primary flex items-center justify-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                  {isLoading ? 'Criando...' : 'Adicionar'}
                </button>
              </div>

              {showQuickAdd && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        value={customTime}
                        onChange={e => {
                          const value = e.target.value;
                          if (
                            value === '' ||
                            (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 480)
                          ) {
                            setCustomTime(value);
                          }
                        }}
                        placeholder="Duração (min)"
                        className="w-full input-modern pr-10 text-sm h-12" // Added h-12
                        min="1"
                        max="480"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="category"
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="input-modern text-sm h-12" // Added h-12
                    >
                      <option value="">Categoria...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <input
                        type="text"
                        name="tags"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        placeholder="Tags (vírgula)"
                        className="w-full input-modern pr-10 text-sm h-12" // Added h-12
                      />
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isRecurring"
                        checked={isRecurring}
                        onChange={e => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Tarefa recorrente</span>
                    </label>
                    {isRecurring && (
                      <select
                        name="recurrencePattern"
                        value={recurrencePattern}
                        onChange={e => setRecurrencePattern(e.target.value as RecurrencePattern)}
                        className="input-modern text-sm h-10 flex-1"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="weekdays">Dias úteis</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    )}
                  </div>
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500">
                💡 Use linguagem natural - nossa IA extrai automaticamente data, hora, prioridade e
                duração.
              </p>
            </div>

            {/* Tasks Tabs */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('local')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'local'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListTodo className="h-4 w-4 inline mr-2" />
                  Minhas Tarefas ({tasks.filter(t => !t.completed).length})
                </button>
                <button
                  onClick={() => setActiveTab('google')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'google'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Cloud className="h-4 w-4 inline mr-2" />
                  Google Tasks ({googleTasks.filter(t => t.status !== 'completed').length})
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'local' ? (
                  // Local Tasks
                  tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListTodo className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">Nenhuma tarefa ainda</h3>
                      <p className="text-sm text-gray-500">
                        Comece adicionando sua primeira tarefa acima!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => {
                        const categoryInfo = getCategoryInfo(task.category);
                        const priorityStyles = getPriorityStyles(task.priority);
                        const isEditing = editingTaskId === task.id;

                        if (isEditing) {
                          return (
                            <div
                              key={task.id}
                              className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200"
                            >
                              <div className="space-y-4">
                                <input
                                  type="text"
                                  name="title"
                                  value={editForm.title || ''}
                                  onChange={e =>
                                    setEditForm({ ...editForm, title: e.target.value })
                                  }
                                  className="w-full input-modern font-medium h-12"
                                  placeholder="Título"
                                />
                                <textarea
                                  value={editForm.description || ''}
                                  onChange={e =>
                                    setEditForm({ ...editForm, description: e.target.value })
                                  }
                                  className="w-full input-modern resize-none"
                                  rows={2}
                                  placeholder="Descrição"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Prioridade
                                    </label>
                                    <select
                                      value={editForm.priority || 'medium'}
                                      onChange={e =>
                                        setEditForm({
                                          ...editForm,
                                          priority: e.target.value as Task['priority'],
                                        })
                                      }
                                      className="input-modern text-sm w-full"
                                    >
                                      <option value="high">Alta</option>
                                      <option value="medium">Média</option>
                                      <option value="low">Baixa</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Categoria
                                    </label>
                                    <select
                                      value={editForm.category || ''}
                                      onChange={e =>
                                        setEditForm({
                                          ...editForm,
                                          category: e.target.value || null,
                                        })
                                      }
                                      className="input-modern text-sm w-full"
                                    >
                                      <option value="">Sem categoria</option>
                                      {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                          {cat.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Duração (min)
                                    </label>
                                    <input
                                      type="number"
                                      value={editForm.estimatedTime || ''}
                                      onChange={e =>
                                        setEditForm({
                                          ...editForm,
                                          estimatedTime: e.target.value
                                            ? parseInt(e.target.value)
                                            : null,
                                        })
                                      }
                                      placeholder="min"
                                      className="input-modern text-sm w-full"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <X className="h-4 w-4 inline mr-1" />
                                    Cancelar
                                  </button>
                                  <button onClick={saveEdit} className="btn-primary text-sm">
                                    <Save className="h-4 w-4 inline mr-1" />
                                    Salvar
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={task.id}
                            data-testid="task-item"
                            className={`task-card border-l-4 ${priorityStyles.border} ${task.completed ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400 hover:text-indigo-500" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
                                >
                                  {task.title}
                                </h3>
                                {!isDescriptionRedundant(task.title, task.description) && (
                                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className={`badge ${priorityStyles.badge}`}>
                                    <Flag className="h-3 w-3" />
                                    {task.priority === 'high'
                                      ? 'Alta'
                                      : task.priority === 'medium'
                                        ? 'Média'
                                        : 'Baixa'}
                                  </span>
                                  {task.isRecurring && task.recurrencePattern && (
                                    <span className="badge bg-violet-100 text-violet-700">
                                      <Repeat className="h-3 w-3" />
                                      {getRecurrenceLabel(task.recurrencePattern)}
                                    </span>
                                  )}
                                  {categoryInfo && (
                                    <span className={`badge ${categoryInfo.color}`}>
                                      {categoryInfo.name}
                                    </span>
                                  )}
                                  {task.estimatedTime && (
                                    <span className="badge bg-gray-100 text-gray-600">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedTime} min
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="badge bg-gray-100 text-gray-600">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {!task.completed && (
                                  <>
                                    <button
                                      data-testid="timer-button"
                                      onClick={() => startTimerForTask(task.id)}
                                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title="Iniciar Timer"
                                    >
                                      <Timer className="h-4 w-4" />
                                    </button>
                                    <button
                                      data-testid="edit-button"
                                      onClick={() => startEditing(task)}
                                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Editar"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  data-testid="delete-button"
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : // Google Tasks
                googleTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Cloud className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Nenhuma tarefa no Google Tasks
                    </h3>
                    <p className="text-sm text-gray-500">
                      Suas tarefas do Google Tasks aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {googleTasks.map(gTask => (
                      <div
                        key={gTask.id}
                        className={`task-card p-4 ${gTask.status === 'completed' ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleGoogleTask(gTask.id, gTask.status)}
                            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                          >
                            {gTask.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 hover:text-indigo-500" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium ${gTask.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}
                            >
                              {gTask.title}
                            </h3>
                            {gTask.notes && (
                              <p className="text-sm text-gray-500 mt-1">{gTask.notes}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="badge bg-purple-100 text-purple-700">
                                <Cloud className="h-3 w-3" />
                                Google Tasks
                              </span>
                              {gTask.due && (
                                <span className="badge bg-gray-100 text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(gTask.due).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => deleteGoogleTask(gTask.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Timer, Calendar, Events - Responsive sidebar */}
          <div className="sidebar-right space-y-6">
            {/* Timer Card */}
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Timer className="h-5 w-5 text-indigo-600" />
                Pomodoro Timer
              </h2>

              <div className="text-center">
                {/* Timer Ring */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="352"
                      strokeDashoffset={352 - 352 * (timerSeconds / timerTotalSeconds)}
                      className="text-indigo-600 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className={`absolute text-3xl font-mono font-bold ${isTimerRunning ? 'text-indigo-600' : 'text-gray-700'}`}
                  >
                    {formatTime(timerSeconds)}
                  </span>
                </div>

                {activeTaskId && (
                  <div className="bg-indigo-50 rounded-lg p-2 mb-4">
                    <p className="text-xs text-indigo-700 font-medium truncate">
                      <Play className="h-3 w-3 inline mr-1" />
                      {tasks.find(t => t.id === activeTaskId)?.title || 'Tarefa'}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-2 mb-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                      isTimerRunning ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-primary'
                    }`}
                  >
                    {isTimerRunning ? (
                      <Pause className="h-4 w-4 inline mr-1" />
                    ) : (
                      <Play className="h-4 w-4 inline mr-1" />
                    )}
                    {isTimerRunning ? 'Pausar' : 'Iniciar'}
                  </button>
                  <button
                    onClick={() => {
                      setTimerSeconds(DEFAULT_TIMER_SECONDS);
                      setTimerTotalSeconds(DEFAULT_TIMER_SECONDS);
                      setIsTimerRunning(false);
                      setActiveTaskId(null);
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex justify-center gap-2">
                  {[25, 5, 15].map(min => (
                    <button
                      key={min}
                      onClick={() => setTimerPreset(min)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        timerSeconds === min * 60 && !isTimerRunning
                          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {min}min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                  Calendário
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center capitalize">
                    {formatMonthYear(calendarMonth)}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                    {day}
                  </div>
                ))}
                {getCalendarDays().map(calendarDay => {
                  const { date, dayNumber, isCurrentMonth, hasEvent } = calendarDay;
                  const todayDate = isToday(date);

                  return (
                    <div
                      key={date.toISOString()}
                      className={`calendar-day text-xs text-center py-1 ${
                        !isCurrentMonth
                          ? 'text-gray-400 opacity-40'
                          : todayDate
                            ? 'today'
                            : hasEvent
                              ? 'has-event text-gray-700 font-medium'
                              : 'text-gray-600'
                      }`}
                    >
                      {dayNumber}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Próximos Eventos
              </h2>

              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum evento próximo</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const eventDate = event.start.dateTime
                      ? new Date(event.start.dateTime)
                      : new Date(event.start.date || '');
                    const isTodayEvent = isToday(eventDate);

                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-xl ${isTodayEvent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isTodayEvent ? 'bg-red-500' : 'bg-indigo-500'}`}
                          />
                          <p
                            className={`text-sm font-medium truncate ${isTodayEvent ? 'text-red-700' : 'text-gray-700'}`}
                          >
                            {event.summary}
                          </p>
                        </div>
                        <p
                          className={`text-xs mt-1 ml-4 ${isTodayEvent ? 'text-red-600' : 'text-gray-500'}`}
                        >
                          {isTodayEvent
                            ? 'Hoje'
                            : eventDate.toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                          {event.start.dateTime &&
                            ` • ${eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Connection Status */}
            <div className="glass rounded-2xl p-6 card-hover">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Conexões
              </h2>

              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl ${calendarSyncStatus === 'syncing' ? 'bg-blue-50' : calendarSyncStatus === 'success' ? 'bg-emerald-50' : calendarSyncStatus === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`h-4 w-4 ${calendarSyncStatus === 'error' ? 'text-red-600' : 'text-emerald-600'}`}
                    />
                    <span
                      className={`text-sm font-medium ${calendarSyncStatus === 'error' ? 'text-red-700' : 'text-emerald-700'}`}
                    >
                      Google Calendar
                    </span>
                    <span
                      className={`ml-auto text-xs ${calendarSyncStatus === 'error' ? 'text-red-600' : 'text-emerald-600'}`}
                    >
                      {calendarSyncStatus === 'syncing'
                        ? 'Sincronizando...'
                        : calendarSyncStatus === 'error'
                          ? 'Erro'
                          : 'Conectado'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Google Tasks</span>
                    <span className="ml-auto text-xs text-emerald-600">Conectado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
