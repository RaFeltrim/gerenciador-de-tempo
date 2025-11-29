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
  Flag
} from "lucide-react";

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

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
        alert('Timer finished! Take a break.');
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

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    
    setIsLoading(true);
    
    const parsedTask = await parseTask(newTaskText);
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: parsedTask?.title || newTaskText,
      description: parsedTask?.description || newTaskText,
      priority: parsedTask?.priority || 'medium',
      estimatedTime: parsedTask?.estimatedTime || null,
      dueDate: parsedTask?.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
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
  };

  const startTimer = (taskId: string) => {
    setActiveTaskId(taskId);
    setShowTimer(true);
    setTimerSeconds(25 * 60);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">FocusFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Task Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Adicionar Nova Tarefa
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Descreva sua tarefa... (ex: Reunião amanhã às 14h, alta prioridade)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={addTask}
                  disabled={isLoading || !newTaskText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  {isLoading ? 'Processando...' : 'Adicionar'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Use linguagem natural para descrever suas tarefas. O sistema tentará extrair data, prioridade e tempo estimado.
              </p>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Minhas Tarefas
                </h2>
                <span className="text-sm text-gray-500">
                  {completedTasks}/{totalTasks} concluídas
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma tarefa ainda.</p>
                  <p className="text-sm">Adicione sua primeira tarefa acima!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 transition-all ${
                        task.completed 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : getPriorityBg(task.priority)
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-1 flex-shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 hover:text-indigo-500" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                task.completed
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.description !== task.title && (
                              <p className="text-sm text-gray-500 mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`flex items-center gap-1 text-xs ${getPriorityColor(task.priority)}`}>
                                <Flag className="h-3 w-3" />
                                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                              {task.estimatedTime && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {task.estimatedTime} min
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!task.completed && (
                            <button
                              onClick={() => startTimer(task.id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Iniciar timer"
                            >
                              <Timer className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Timer className="h-5 w-5 text-indigo-600" />
                Timer Pomodoro
              </h2>
              
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-indigo-600 mb-4">
                  {formatTime(timerSeconds)}
                </div>
                
                {activeTaskId && (
                  <p className="text-sm text-gray-500 mb-4">
                    Trabalhando em: {tasks.find(t => t.id === activeTaskId)?.title}
                  </p>
                )}
                
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Resetar
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setTimerSeconds(25 * 60)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    25 min
                  </button>
                  <button
                    onClick={() => setTimerSeconds(5 * 60)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    5 min
                  </button>
                  <button
                    onClick={() => setTimerSeconds(15 * 60)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    15 min
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Progresso de Hoje
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tarefas Concluídas</span>
                    <span>{completedTasks}/{totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Por Prioridade</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-600">Alta</span>
                      <span>{tasks.filter(t => t.priority === 'high' && !t.completed).length} pendentes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Média</span>
                      <span>{tasks.filter(t => t.priority === 'medium' && !t.completed).length} pendentes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Baixa</span>
                      <span>{tasks.filter(t => t.priority === 'low' && !t.completed).length} pendentes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Calendar Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Google Calendar
              </h2>
              <div className="text-sm text-gray-600">
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <p className="text-green-700 font-medium">✓ Conectado</p>
                  <p className="text-green-600 text-xs mt-1">{session.user?.email}</p>
                </div>
                <p className="text-gray-500 text-xs">
                  A sincronização com o Google Calendar estará disponível em uma próxima atualização.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
