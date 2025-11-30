import React from 'react';
import { 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Repeat
} from "lucide-react";
import { getRecurrenceLabel } from "../lib/task-utils";

// Predefined categories
const CATEGORIES = [
  { id: 'work', name: 'Trabalho', color: 'bg-blue-100 text-blue-700' },
  { id: 'personal', name: 'Pessoal', color: 'bg-purple-100 text-purple-700' },
  { id: 'study', name: 'Estudo', color: 'bg-green-100 text-green-700' },
  { id: 'health', name: 'Saúde', color: 'bg-red-100 text-red-700' },
  { id: 'finance', name: 'Finanças', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'other', name: 'Outros', color: 'bg-gray-100 text-gray-700' },
];

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null; // in minutes
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  category?: string | null;
  tags?: string[];
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  parentTaskId?: string | null;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer?: (id: string) => void;
}

// Helper function to check if description is essentially the same as title
const isDescriptionRedundant = (title: string, description: string): boolean => {
  if (!description || !title) return true;
  
  const MIN_DESCRIPTION_LENGTH_THRESHOLD = 10;
  
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

// Get category info
const getCategoryInfo = (categoryId: string | null | undefined) => {
  return CATEGORIES.find(c => c.id === categoryId) || null;
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

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit,
  onStartTimer
}) => {
  const categoryInfo = getCategoryInfo(task.category);
  
  return (
    <div
      className={`border rounded-xl p-4 transition-all hover:shadow-md ${
        task.completed 
          ? 'bg-gray-50 border-gray-200 opacity-60' 
          : getPriorityBg(task.priority)
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
            aria-label={task.completed ? "Marcar como não concluída" : "Marcar como concluída"}
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
              {task.isRecurring && task.recurrencePattern && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  <Repeat className="h-3 w-3" />
                  {getRecurrenceLabel(task.recurrencePattern)}
                </span>
              )}
              {categoryInfo && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                  {categoryInfo.name}
                </span>
              )}
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
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {!task.completed && (
            <>
              {onStartTimer && (
                <button
                  onClick={() => onStartTimer && onStartTimer(task.id)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Iniciar Pomodoro para esta tarefa"
                >
                  <Clock className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar tarefa"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir tarefa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};