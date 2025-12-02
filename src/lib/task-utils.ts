// Shared utility functions for task management

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'weekdays';

/**
 * Calculate the next due date for a recurring task based on its recurrence pattern.
 * @param currentDueDate - The current due date of the task (ISO string or null)
 * @param pattern - The recurrence pattern ('daily', 'weekly', 'monthly', 'weekdays')
 * @returns The next due date as an ISO string, or null if pattern is invalid
 */
export function calculateNextDueDate(
  currentDueDate: string | null,
  pattern: RecurrencePattern
): string | null {
  // If no current due date, start from the beginning of tomorrow
  const baseDate = currentDueDate ? new Date(currentDueDate) : getStartOfTomorrow();
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
      // Move to next weekday (Mon-Fri)
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
      break;
    default:
      return null;
  }

  return nextDate.toISOString();
}

/**
 * Get the display label for a recurrence pattern
 */
export function getRecurrenceLabel(pattern: RecurrencePattern | null): string {
  switch (pattern) {
    case 'daily':
      return 'Diário';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensal';
    case 'weekdays':
      return 'Dias úteis';
    default:
      return '';
  }
}

/**
 * Helper to get the start of tomorrow at 9 AM (default time for tasks)
 */
function getStartOfTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}
