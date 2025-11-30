/**
 * Date Validation Utility
 * Provides strict date validation to prevent invalid calendar dates
 */

/**
 * Check if a year is a leap year
 * 
 * Leap year rules:
 * - A year is a leap year if it is divisible by 4
 * - Exception: Years divisible by 100 are NOT leap years
 * - Exception to exception: Years divisible by 400 ARE leap years
 * 
 * @param year - The year to check
 * @returns true if the year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the number of days in a given month
 * @param month - Month (1-12)
 * @param year - Year (for leap year calculation)
 * @returns Number of days in the month
 */
export function getDaysInMonth(month: number, year: number): number {
  // Month is 1-indexed (1 = January, 12 = December)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  if (month < 1 || month > 12) {
    return 0;
  }
  
  // February in a leap year has 29 days
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  
  return daysInMonth[month - 1];
}

/**
 * Validates if a given date is a valid calendar date
 * This performs strict validation without relying on JavaScript Date rollover behavior
 * 
 * @param day - Day of month (1-31)
 * @param month - Month (1-12)
 * @param year - Full year (e.g., 2025)
 * @returns true if the date is valid, false otherwise
 * 
 * @example
 * isValidDate(31, 11, 2025) // false - November has only 30 days
 * isValidDate(29, 2, 2025)  // false - 2025 is not a leap year
 * isValidDate(29, 2, 2024)  // true - 2024 is a leap year
 * isValidDate(32, 1, 2025)  // false - No month has 32 days
 */
export function isValidDate(day: number, month: number, year: number): boolean {
  // Basic validation for input types and ranges
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }
  
  // Check if year is reasonable (positive)
  if (year < 1) {
    return false;
  }
  
  // Check if month is valid (1-12)
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Check if day is at least 1
  if (day < 1) {
    return false;
  }
  
  // Get the maximum days for this month and year
  const maxDays = getDaysInMonth(month, year);
  
  // Check if day is valid for this month
  if (day > maxDays) {
    return false;
  }
  
  return true;
}

/**
 * Validates a date string in DD/MM/YYYY format
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Object with validation result and parsed components
 */
export function validateDateString(dateString: string): { 
  valid: boolean; 
  day?: number; 
  month?: number; 
  year?: number; 
  error?: string;
} {
  // Match DD/MM/YYYY or DD/MM format
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
  
  if (!match) {
    return { valid: false, error: 'Invalid date format. Use DD/MM or DD/MM/YYYY' };
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
  
  if (!isValidDate(day, month, year)) {
    return { 
      valid: false, 
      day, 
      month, 
      year,
      error: 'A data inserida não existe no calendário (ex: 31 de Novembro).'
    };
  }
  
  return { valid: true, day, month, year };
}

/**
 * Validates an ISO date string (e.g., "2025-11-31T09:00:00.000Z")
 * @param isoString - ISO format date string
 * @returns Object with validation result
 */
export function validateISODateString(isoString: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!isoString) {
    return { valid: true }; // null/undefined dates are allowed (no due date)
  }
  
  try {
    const date = new Date(isoString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return { 
        valid: false, 
        error: 'A data inserida não existe no calendário (ex: 31 de Novembro).'
      };
    }
    
    // Extract components from the ISO string to validate
    // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
    const isoMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!isoMatch) {
      return { valid: true }; // Let non-standard formats pass through
    }
    
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    
    // Validate using our strict function
    if (!isValidDate(day, month, year)) {
      return { 
        valid: false, 
        error: 'A data inserida não existe no calendário (ex: 31 de Novembro).'
      };
    }
    
    // Double-check: verify the parsed date matches the input
    // This catches cases where Date() auto-corrects invalid dates
    if (date.getUTCFullYear() !== year || 
        date.getUTCMonth() + 1 !== month || 
        date.getUTCDate() !== day) {
      return { 
        valid: false, 
        error: 'A data inserida não existe no calendário (ex: 31 de Novembro).'
      };
    }
    
    return { valid: true };
  } catch {
    return { 
      valid: false, 
      error: 'A data inserida não existe no calendário (ex: 31 de Novembro).'
    };
  }
}
