import { NextRequest } from 'next/server';

// Natural Language Processing for task parsing
// Parses Portuguese natural language to extract structured task data

interface ParsedTask {
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null;
}

function extractPriority(text: string): 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase();
  
  // High priority keywords
  const highPriorityKeywords = [
    'urgente', 'urgência', 'importante', 'crítico', 'crítica',
    'prioridade alta', 'alta prioridade', 'asap', 'imediato',
    'imediatamente', 'hoje', 'agora', '!!'
  ];
  
  // Low priority keywords
  const lowPriorityKeywords = [
    'baixa prioridade', 'prioridade baixa', 'quando possível',
    'quando puder', 'sem pressa', 'eventualmente', 'opcional'
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
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/,  // DD/MM or DD/MM/YYYY
    /dia\s+(\d{1,2})/i,                      // "dia 15"
  ];
  
  for (const pattern of datePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      if (match[2]) {
        // DD/MM format
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = match[3] ? parseInt(match[3]) : now.getFullYear();
        const date = new Date(year, month, day);
        return extractTimeFromText(date).toISOString();
      } else if (match[1]) {
        // "dia X" format - safely handle month rollover
        const day = parseInt(match[1]);
        let targetMonth = now.getMonth();
        let targetYear = now.getFullYear();
        
        // Create date and check if it's valid
        let date = new Date(targetYear, targetMonth, day);
        
        // If date is in the past, move to next month
        if (date < now) {
          targetMonth += 1;
          if (targetMonth > 11) {
            targetMonth = 0;
            targetYear += 1;
          }
          date = new Date(targetYear, targetMonth, day);
        }
        
        // Validate the day is valid for the target month
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        if (day > daysInMonth) {
          return null; // Invalid day for this month
        }
        
        return extractTimeFromText(date).toISOString();
      }
    }
  }
  
  return null;
}

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
    'reunião': 60,
    'reuniao': 60,
    'meeting': 60,
    'call': 30,
    'ligação': 30,
    'ligacao': 30,
    'email': 15,
    'e-mail': 15,
    'review': 30,
    'revisão': 30,
    'revisao': 30,
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

function extractTitle(text: string): string {
  // Remove time, date, and priority indicators for cleaner title
  let title = text;
  
  // Remove common patterns
  const patternsToRemove = [
    /\b(urgente|importante|crítico|crítica|alta prioridade|baixa prioridade)\b/gi,
    /\b(hoje|amanhã|amanha|próxima semana|proxima semana)\b/gi,
    /\b(\d+)\s*(hora|horas|h|minuto|minutos|min|pomodoro|pomodoros)\b/gi,
    /\b(às|as)\s+\d{1,2}(:\d{2})?\s*(h|horas)?\b/gi,
    /\d{1,2}\/\d{1,2}(\/\d{4})?/g,
    /!+/g,
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
    const parsedTask: ParsedTask = {
      title: extractTitle(taskText),
      description: taskText,
      dueDate: extractDate(taskText),
      priority: extractPriority(taskText),
      estimatedTime: extractTime(taskText),
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