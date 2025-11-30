'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Constants
const DEFAULT_EVENT_DURATION_MINUTES = 60;
const STATUS_RESET_DELAY_MS = 3000;
const MIN_DESCRIPTION_LENGTH_THRESHOLD = 10;

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null; // in minutes
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

// Helper function to check if description is essentially the same as title
const isDescriptionRedundant = (title: string, description: string): boolean => {
  if (!description || !title) return true;
  
  // If description is significantly longer than title, it likely has additional info
  if (description.length > title.length + MIN_DESCRIPTION_LENGTH_THRESHOLD) {
    return false;
  }
  
  // Normalize both strings for comparison
  const normalizeString = (str: string) => 
    str.toLowerCase()
       .replace(/\s+/g, ' ')
       .trim();
  
  const normalizedTitle = normalizeString(title);
  const normalizedDesc = normalizeString(description);
  
  // Check if description is same as title, or if they are very similar
  return normalizedDesc === normalizedTitle || 
         normalizedTitle === normalizedDesc;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [customTime, setCustomTime] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      // Play notification sound or alert
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskText: text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error parsing task:', error);
      return null;
    }
  };

  // Create event in Google Calendar
  const createCalendarEvent = async (task: Task) => {
    if (!task.dueDate) return;
    
    try {
      setCalendarSyncStatus('syncing');
      
      // Calculate end time (add estimated time or default duration)
      const startTime = new Date(task.dueDate);
      const durationMinutes = task.estimatedTime || DEFAULT_EVENT_DURATION_MINUTES;
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setTimeout(() => setCalendarSyncStatus('idle'), STATUS_RESET_DELAY_MS);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      setCalendarSyncStatus('error');
      setTimeout(() => setCalendarSyncStatus('idle'), STATUS_RESET_DELAY_MS);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    
    setIsLoading(true);
    
    const parsedTask = await parseTask(newTaskText);
    
    // Use custom time if provided and valid, otherwise use parsed time
    const parsedCustomTime = customTime ? parseInt(customTime, 10) : NaN;
    const customTimeValue = !isNaN(parsedCustomTime) && parsedCustomTime > 0 && parsedCustomTime <= 480 
      ? parsedCustomTime 
      : null;
    const estimatedTime = customTimeValue || parsedTask?.estimatedTime || null;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: parsedTask?.title || newTaskText,
      description: parsedTask?.description || newTaskText,
      priority: parsedTask?.priority || 'medium',
      estimatedTime: estimatedTime,
      dueDate: parsedTask?.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
    setCustomTime(''); // Clear custom time input
    
    // Create Google Calendar event if task has a due date
    if (newTask.dueDate) {
      await createCalendarEvent(newTask);
    }
    
    setIsLoading(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    // If deleting the active task, clear the timer context
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  // Start timer with a specific task - uses task's estimated time or default 25 min
  const startTimerForTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const durationMinutes = task?.estimatedTime || 25;
    setActiveTaskId(taskId);
    setTimerSeconds(durationMinutes * 60);
    setIsTimerRunning(true);
  };

  // Set timer to a specific preset duration
  const setTimerPreset = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-white border-red-200 shadow-sm';
      case 'medium':
        return 'bg-white border-amber-200 shadow-sm';
      case 'low':
        return 'bg-white border-emerald-200 shadow-sm';
      default:
        return 'bg-white border-gray-200 shadow-sm';
    }
  };

  // Calendar helper functions
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
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

  // Get upcoming tasks sorted by date
  const upcomingTasks = tasks
    .filter(task => task.dueDate && !task.completed)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600 font-medium">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">FocusFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-100"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile-first: Single column, stacking in specific order */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          
          {/* Add Task Section - Always first */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Adicionar Nova Tarefa
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Descreva sua tarefa... (ex: Reunião amanhã às 14h, alta prioridade)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 placeholder-gray-400 transition-shadow"
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={customTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or valid numbers within range
                        if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 480)) {
                          setCustomTime(value);
                        }
                      }}
                      placeholder="min"
                      min="1"
                      max="480"
                      className="w-20 px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 placeholder-gray-400 transition-shadow text-center"
                      disabled={isLoading}
                    />
                    <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={addTask}
                    disabled={isLoading || !newTaskText.trim()}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
                  >
                    <Plus className="h-5 w-5" />
                    {isLoading ? 'Processando...' : 'Adicionar'}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Use linguagem natural para descrever suas tarefas. Defina o tempo manualmente (em minutos) ou deixe em branco para extração automática.
              </p>
            </div>
          </div>

          {/* Timer Card - Second on mobile, sidebar on desktop */}
          <div className="order-2 lg:order-3 lg:row-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Timer className="h-5 w-5 text-indigo-600" />
                Timer Pomodoro
              </h2>
              
              <div className="text-center">
                <div className={`text-5xl sm:text-6xl font-mono font-bold mb-4 transition-colors ${
                  isTimerRunning ? 'text-indigo-600' : 'text-gray-700'
                }`}>
                  {formatTime(timerSeconds)}
                </div>
                
                {activeTaskId && (
                  <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-indigo-700 font-medium">
                      <Play className="h-3 w-3 inline mr-1" />
                      Trabalhando em: {tasks.find(t => t.id === activeTaskId)?.title || 'Tarefa'}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center gap-3 mb-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${
                      isTimerRunning
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isTimerRunning ? 'Pausar' : 'Iniciar'}
                  </button>
                  <button
                    onClick={() => {
                      setTimerSeconds(25 * 60);
                      setIsTimerRunning(false);
                      setActiveTaskId(null);
                    }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Resetar
                  </button>
                </div>
                
                {/* Improved preset buttons with better contrast */}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setTimerPreset(25)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      timerSeconds === 25 * 60 && !isTimerRunning
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    25 min
                  </button>
                  <button
                    onClick={() => setTimerPreset(5)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      timerSeconds === 5 * 60 && !isTimerRunning
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    5 min
                  </button>
                  <button
                    onClick={() => setTimerPreset(15)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      timerSeconds === 15 * 60 && !isTimerRunning
                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    15 min
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List - Third on mobile */}
          <div className="lg:col-span-2 order-3 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Minhas Tarefas
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {completedTasks}/{totalTasks} concluídas
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Nenhuma tarefa ainda.</p>
                  <p className="text-sm">Adicione sua primeira tarefa acima!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-4 transition-all hover:shadow-md ${
                        task.completed 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : getPriorityBg(task.priority)
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
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
                              className={`font-medium ${
                                task.completed
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {/* Only show description if it's meaningfully different from title */}
                            {!isDescriptionRedundant(task.title, task.description) && (
                              <p className="text-sm text-gray-500 mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                task.priority === 'high' 
                                  ? 'bg-red-100 text-red-700' 
                                  : task.priority === 'medium' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                <Flag className="h-3 w-3" />
                                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                              {task.estimatedTime && (
                                <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {task.estimatedTime} min
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!task.completed && (
                            <button
                              onClick={() => startTimerForTask(task.id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Iniciar Pomodoro para esta tarefa"
                            >
                              <Timer className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress Card - Fourth on mobile */}
          <div className="order-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Progresso de Hoje
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="font-medium">Tarefas Concluídas</span>
                    <span className="font-semibold">{completedTasks}/{totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Por Prioridade</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-gray-700 font-medium">Alta</span>
                      </span>
                      <span className="text-sm text-gray-600">{tasks.filter(t => t.priority === 'high' && !t.completed).length} pendentes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span className="text-gray-700 font-medium">Média</span>
                      </span>
                      <span className="text-sm text-gray-600">{tasks.filter(t => t.priority === 'medium' && !t.completed).length} pendentes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-gray-700 font-medium">Baixa</span>
                      </span>
                      <span className="text-sm text-gray-600">{tasks.filter(t => t.priority === 'low' && !t.completed).length} pendentes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar View - Fifth on mobile, spans full width */}
          <div className="lg:col-span-2 order-5">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Calendário
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center capitalize">
                    {formatMonthYear(calendarMonth)}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {getCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const dayTasks = getTasksForDate(date);
                  const hasTasksToday = dayTasks.length > 0;
                  const todayDate = isToday(date);
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative ${
                        todayDate
                          ? 'bg-indigo-600 text-white font-bold'
                          : hasTasksToday
                            ? 'bg-red-100 text-red-700 font-medium hover:bg-red-200 ring-2 ring-red-300'
                            : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      title={hasTasksToday ? `${dayTasks.length} tarefa(s) agendada(s)` : undefined}
                      aria-label={`${date.getDate()} ${hasTasksToday ? `, ${dayTasks.length} tarefa(s)` : ''}`}
                    >
                      <span>{date.getDate()}</span>
                      {hasTasksToday && (
                        <span className={`text-[10px] flex items-center gap-0.5 ${todayDate ? 'text-white/80' : 'text-red-600'}`}>
                          <span className="sr-only">Tarefas: </span>
                          •{dayTasks.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upcoming Tasks List */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Próximos Eventos</h3>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum evento agendado</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingTasks.map(task => {
                      const taskDate = new Date(task.dueDate!);
                      const isTodayTask = isToday(taskDate);
                      
                      return (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 p-2 rounded-lg ${
                            isTodayTask 
                              ? 'bg-red-50 border border-red-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isTodayTask ? 'bg-red-500' : 'bg-indigo-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isTodayTask ? 'text-red-700' : 'text-gray-700'
                            }`}>
                              {task.title}
                            </p>
                            <p className={`text-xs ${
                              isTodayTask ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {isTodayTask ? 'Hoje' : taskDate.toLocaleDateString('pt-BR', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                              {task.estimatedTime && ` • ${task.estimatedTime} min`}
                            </p>
                          </div>
                          {isTodayTask && (
                            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                              HOJE
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Calendar Info - Sixth on mobile */}
          <div className="order-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Google Calendar
              </h2>
              <div className="text-sm text-gray-600">
                <div className={`p-3 rounded-xl mb-3 transition-colors ${
                  calendarSyncStatus === 'syncing' 
                    ? 'bg-blue-50' 
                    : calendarSyncStatus === 'success'
                      ? 'bg-green-50'
                      : calendarSyncStatus === 'error'
                        ? 'bg-red-50'
                        : 'bg-emerald-50'
                }`}>
                  <p className={`font-semibold flex items-center gap-1 ${
                    calendarSyncStatus === 'syncing' 
                      ? 'text-blue-700' 
                      : calendarSyncStatus === 'success'
                        ? 'text-green-700'
                        : calendarSyncStatus === 'error'
                          ? 'text-red-700'
                          : 'text-emerald-700'
                  }`}>
                    {calendarSyncStatus === 'syncing' && '⏳ Sincronizando...'}
                    {calendarSyncStatus === 'success' && '✓ Evento criado!'}
                    {calendarSyncStatus === 'error' && '✕ Erro ao sincronizar'}
                    {calendarSyncStatus === 'idle' && '✓ Conectado'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    calendarSyncStatus === 'syncing' 
                      ? 'text-blue-600' 
                      : calendarSyncStatus === 'success'
                        ? 'text-green-600'
                        : calendarSyncStatus === 'error'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                  }`}>
                    {session.user?.email}
                  </p>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Tarefas com data/hora serão automaticamente adicionadas ao seu Google Calendar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
