import { NextRequest } from 'next/server';
import { isValidDate } from '../../../lib/date-validation';

// Natural Language Processing for task parsing
// Parses Portuguese natural language to extract structured task data

type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'weekdays' | null;

interface ParsedTask {
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern;
}

/**
 * Extracts priority level from natural language text
 * @param text - Natural language text in Portuguese
 * @returns Priority level: 'high', 'medium', or 'low'
 * @example
 * extractPriority('Reunião urgente') // returns 'high'
 * extractPriority('Ler livro quando puder') // returns 'low'
 */
function extractPriority(text: string): 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase();

  // High priority keywords
  const highPriorityKeywords = [
    'urgente',
    'urgência',
    'importante',
    'crítico',
    'crítica',
    'prioridade alta',
    'alta prioridade',
    'asap',
    'imediato',
    'imediatamente',
    'hoje',
    'agora',
    '!!',
  ];

  // Low priority keywords
  const lowPriorityKeywords = [
    'baixa prioridade',
    'prioridade baixa',
    'quando possível',
    'quando puder',
    'sem pressa',
    'eventualmente',
    'opcional',
  ];

  for (const keyword of highPriorityKeywords) {
    if (lowerText.includes(keyword)) {
      return 'high';
    }
  }

  for (const keyword of lowPriorityKeywords) {
    if (lowerText.includes(keyword)) {
      return 'low';
    }
  }

  return 'medium';
}

/**
 * Extracts date and time from natural language text
 * Supports Portuguese relative dates (hoje, amanhã), days of week, and absolute dates
 * @param text - Natural language text in Portuguese
 * @returns ISO date string or null if no date found
 * @example
 * extractDate('Reunião hoje às 14h') // returns ISO date for today at 14:00
 * extractDate('Compromisso amanhã') // returns ISO date for tomorrow at 9:00
 * extractDate('Tarefa para quinta-feira') // returns ISO date for next Thursday
 */
function extractDate(text: string): string | null {
  const lowerText = text.toLowerCase();
  const now = new Date();

  // Helper function to extract time from text
  const extractTimeFromText = (baseDate: Date): Date => {
    // Create a new Date object to avoid mutating the input
    const result = new Date(baseDate.getTime());

    // Match patterns like "às 14h", "as 14:30", "14h30", "14:30", "às 14 horas"
    const timePatterns = [
      /(?:às|as)\s*(\d{1,2})(?::(\d{2}))?\s*(?:h|horas)?/i,
      /(\d{1,2}):(\d{2})/,
      /(\d{1,2})h(\d{2})?/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          result.setHours(hours, minutes, 0, 0);
          return result;
        }
      }
    }

    // Default to 9:00 AM if no time specified
    result.setHours(9, 0, 0, 0);
    return result;
  };

  // Check for "hoje" (today)
  if (lowerText.includes('hoje')) {
    const today = new Date(now);
    return extractTimeFromText(today).toISOString();
  }

  // Check for "amanhã" (tomorrow)
  if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return extractTimeFromText(tomorrow).toISOString();
  }

  // Check for days of the week
  const daysOfWeek = [
    { name: 'domingo', day: 0 },
    { name: 'segunda', day: 1 },
    { name: 'terça', day: 2 },
    { name: 'terca', day: 2 },
    { name: 'quarta', day: 3 },
    { name: 'quinta', day: 4 },
    { name: 'sexta', day: 5 },
    { name: 'sábado', day: 6 },
    { name: 'sabado', day: 6 },
  ];

  for (const dayInfo of daysOfWeek) {
    if (lowerText.includes(dayInfo.name)) {
      const currentDay = now.getDay();
      let daysUntil = dayInfo.day - currentDay;
      if (daysUntil <= 0) {
        daysUntil += 7;
      }
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysUntil);
      return extractTimeFromText(targetDate).toISOString();
    }
  }

  // Check for relative dates like "próxima semana" (next week)
  if (lowerText.includes('próxima semana') || lowerText.includes('proxima semana')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return extractTimeFromText(nextWeek).toISOString();
  }

  // Check for date patterns like "dia 15", "15/12", "15/12/2024"
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/, // DD/MM or DD/MM/YYYY
    /dia\s+(\d{1,2})/i, // "dia 15"
  ];

  for (const pattern of datePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      if (match[2]) {
        // DD/MM format
        const day = parseInt(match[1]);
        const month = parseInt(match[2]); // Keep 1-indexed for validation
        const year = match[3] ? parseInt(match[3]) : now.getFullYear();

        // Strict date validation - reject invalid calendar dates like 31/11
        if (!isValidDate(day, month, year)) {
          return null; // Invalid date - don't roll over to next month
        }

        const date = new Date(year, month - 1, day); // Convert to 0-indexed for Date constructor
        return extractTimeFromText(date).toISOString();
      } else if (match[1]) {
        // "dia X" format - safely handle month rollover
        const day = parseInt(match[1]);
        let targetMonth = now.getMonth() + 1; // Convert to 1-indexed for validation
        let targetYear = now.getFullYear();

        // Validate the day is valid for the target month using strict validation
        if (!isValidDate(day, targetMonth, targetYear)) {
          // Try next month
          targetMonth += 1;
          if (targetMonth > 12) {
            targetMonth = 1;
            targetYear += 1;
          }
          // If still invalid, return null
          if (!isValidDate(day, targetMonth, targetYear)) {
            return null; // Invalid day for this month
          }
        }

        // Create date (convert back to 0-indexed for Date constructor)
        let date = new Date(targetYear, targetMonth - 1, day);

        // If date is in the past, move to next month
        if (date < now) {
          targetMonth += 1;
          if (targetMonth > 12) {
            targetMonth = 1;
            targetYear += 1;
          }
          // Validate again for the new month
          if (!isValidDate(day, targetMonth, targetYear)) {
            return null; // Invalid day for this month
          }
          date = new Date(targetYear, targetMonth - 1, day);
        }

        return extractTimeFromText(date).toISOString();
      }
    }
  }

  return null;
}

/**
 * Extracts estimated time duration from natural language text
 * Supports hours, minutes, and pomodoros. Also infers time from task types.
 * @param text - Natural language text in Portuguese
 * @returns Estimated time in minutes or null if not found
 * @example
 * extractTime('Reunião de 2 horas') // returns 120
 * extractTime('Tarefa de 30 minutos') // returns 30
 * extractTime('Estudar 3 pomodoros') // returns 75 (3 * 25)
 */
function extractTime(text: string): number | null {
  const lowerText = text.toLowerCase();

  // Patterns for time extraction
  const patterns = [
    { regex: /(\d+)\s*(?:hora|horas|h)\b/, multiplier: 60 },
    { regex: /(\d+)\s*(?:minuto|minutos|min)\b/, multiplier: 1 },
    { regex: /(\d+)\s*(?:pomodoro|pomodoros)\b/, multiplier: 25 },
  ];

  let totalMinutes = 0;
  let found = false;

  for (const pattern of patterns) {
    const match = lowerText.match(pattern.regex);
    if (match) {
      totalMinutes += parseInt(match[1]) * pattern.multiplier;
      found = true;
    }
  }

  // Common task types with default durations
  const defaultDurations: Record<string, number> = {
    reunião: 60,
    reuniao: 60,
    meeting: 60,
    call: 30,
    ligação: 30,
    ligacao: 30,
    email: 15,
    'e-mail': 15,
    review: 30,
    revisão: 30,
    revisao: 30,
  };

  if (!found) {
    for (const [keyword, duration] of Object.entries(defaultDurations)) {
      if (lowerText.includes(keyword)) {
        return duration;
      }
    }
  }

  return found ? totalMinutes : null;
}

/**
 * Extracts recurrence pattern from natural language text
 * @param text - Natural language text in Portuguese
 * @returns Object containing isRecurring flag and recurrence pattern
 * @example
 * extractRecurrence('Reunião todo dia') // returns { isRecurring: true, pattern: 'daily' }
 * extractRecurrence('Estudar toda semana') // returns { isRecurring: true, pattern: 'weekly' }
 * extractRecurrence('Backup mensal') // returns { isRecurring: true, pattern: 'monthly' }
 */
function extractRecurrence(text: string): { isRecurring: boolean; pattern: RecurrencePattern } {
  const lowerText = text.toLowerCase();

  // Daily patterns (Portuguese and English)
  const dailyPatterns = [
    'todo dia',
    'todos os dias',
    'diariamente',
    'diário',
    'diaria',
    'every day',
    'daily',
    'cada dia',
  ];

  // Weekly patterns
  const weeklyPatterns = [
    'toda semana',
    'todas as semanas',
    'semanalmente',
    'semanal',
    'every week',
    'weekly',
    'cada semana',
  ];

  // Monthly patterns
  const monthlyPatterns = [
    'todo mês',
    'todos os meses',
    'mensalmente',
    'mensal',
    'every month',
    'monthly',
    'cada mês',
  ];

  // Weekdays patterns
  const weekdaysPatterns = [
    'dias úteis',
    'dias uteis',
    'dia útil',
    'dia util',
    'de segunda a sexta',
    'segunda a sexta',
    'weekdays',
    'todos os dias úteis',
    'todos os dias uteis',
  ];

  // Specific day patterns (treat as weekly recurrence)
  const specificDayPatterns = [
    'toda segunda',
    'toda terça',
    'toda terca',
    'toda quarta',
    'toda quinta',
    'toda sexta',
    'todo sábado',
    'todo sabado',
    'todo domingo',
    'todas as segundas',
    'todas as terças',
    'todas as tercas',
    'todas as quartas',
    'todas as quintas',
    'todas as sextas',
    'todos os sábados',
    'todos os sabados',
    'todos os domingos',
    'every monday',
    'every tuesday',
    'every wednesday',
    'every thursday',
    'every friday',
    'every saturday',
    'every sunday',
  ];

  for (const pattern of dailyPatterns) {
    if (lowerText.includes(pattern)) {
      return { isRecurring: true, pattern: 'daily' };
    }
  }

  for (const pattern of weekdaysPatterns) {
    if (lowerText.includes(pattern)) {
      return { isRecurring: true, pattern: 'weekdays' };
    }
  }

  for (const pattern of weeklyPatterns) {
    if (lowerText.includes(pattern)) {
      return { isRecurring: true, pattern: 'weekly' };
    }
  }

  for (const pattern of specificDayPatterns) {
    if (lowerText.includes(pattern)) {
      return { isRecurring: true, pattern: 'weekly' };
    }
  }

  for (const pattern of monthlyPatterns) {
    if (lowerText.includes(pattern)) {
      return { isRecurring: true, pattern: 'monthly' };
    }
  }

  return { isRecurring: false, pattern: null };
}

/**
 * Extracts clean task title by removing metadata (dates, times, priorities, etc.)
 * @param text - Natural language text in Portuguese
 * @returns Cleaned and formatted task title
 * @example
 * extractTitle('Reunião urgente hoje às 14h') // returns 'Reunião'
 * extractTitle('Estudar 2 horas') // returns 'Estudar'
 */
function extractTitle(text: string): string {
  // Remove time, date, priority, and recurrence indicators for cleaner title
  let title = text;

  // Remove common patterns
  const patternsToRemove = [
    /\b(urgente|importante|crítico|crítica|alta prioridade|baixa prioridade)\b/gi,
    /\b(hoje|amanhã|amanha|próxima semana|proxima semana)\b/gi,
    /\b(\d+)\s*(hora|horas|h|minuto|minutos|min|pomodoro|pomodoros)\b/gi,
    /\b(às|as)\s+\d{1,2}(:\d{2})?\s*(h|horas)?\b/gi,
    /\d{1,2}\/\d{1,2}(\/\d{4})?/g,
    /!+/g,
    // Recurrence patterns
    /\b(todo dia|todos os dias|diariamente|diário|diaria)\b/gi,
    /\b(toda semana|todas as semanas|semanalmente|semanal)\b/gi,
    /\b(todo mês|todos os meses|mensalmente|mensal)\b/gi,
    /\b(dias úteis|dias uteis|dia útil|dia util)\b/gi,
    /\b(de segunda a sexta|segunda a sexta)\b/gi,
    /\b(toda segunda|toda terça|toda terca|toda quarta|toda quinta|toda sexta)\b/gi,
    /\b(todo sábado|todo sabado|todo domingo)\b/gi,
    /\b(todas as segundas|todas as terças|todas as tercas|todas as quartas)\b/gi,
    /\b(todas as quintas|todas as sextas|todos os sábados|todos os sabados|todos os domingos)\b/gi,
    /\b(every day|daily|every week|weekly|every month|monthly|weekdays)\b/gi,
    /\b(cada dia|cada semana|cada mês)\b/gi,
  ];

  for (const pattern of patternsToRemove) {
    title = title.replace(pattern, '');
  }

  // Clean up extra spaces and trim
  title = title.replace(/\s+/g, ' ').trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // If title is too short after cleanup, use original
  if (title.length < 3) {
    title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
  }

  return title;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskText } = body;

    if (!taskText || typeof taskText !== 'string') {
      return new Response(JSON.stringify({ error: 'Task text is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse the natural language task
    const recurrence = extractRecurrence(taskText);
    const parsedTask: ParsedTask = {
      title: extractTitle(taskText),
      description: taskText,
      dueDate: extractDate(taskText),
      priority: extractPriority(taskText),
      estimatedTime: extractTime(taskText),
      isRecurring: recurrence.isRecurring,
      recurrencePattern: recurrence.pattern,
    };

    return new Response(JSON.stringify(parsedTask), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error parsing task:', error);
    return new Response(JSON.stringify({ error: 'Failed to parse task' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
