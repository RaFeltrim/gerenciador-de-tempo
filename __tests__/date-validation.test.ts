/**
 * Date Validation Test Suite
 * Tests for strict date validation to catch invalid calendar dates
 */

import { isValidDate, isLeapYear, getDaysInMonth, validateDateString, validateISODateString } from '../src/lib/date-validation';

describe('isLeapYear', () => {
  it('should return true for leap years divisible by 4 but not 100', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2016)).toBe(true);
  });

  it('should return false for years divisible by 100 but not 400', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('should return true for years divisible by 400', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  it('should return false for non-leap years', () => {
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2019)).toBe(false);
  });
});

describe('getDaysInMonth', () => {
  it('should return correct days for each month in a non-leap year', () => {
    expect(getDaysInMonth(1, 2025)).toBe(31);  // January
    expect(getDaysInMonth(2, 2025)).toBe(28);  // February (non-leap)
    expect(getDaysInMonth(3, 2025)).toBe(31);  // March
    expect(getDaysInMonth(4, 2025)).toBe(30);  // April
    expect(getDaysInMonth(5, 2025)).toBe(31);  // May
    expect(getDaysInMonth(6, 2025)).toBe(30);  // June
    expect(getDaysInMonth(7, 2025)).toBe(31);  // July
    expect(getDaysInMonth(8, 2025)).toBe(31);  // August
    expect(getDaysInMonth(9, 2025)).toBe(30);  // September
    expect(getDaysInMonth(10, 2025)).toBe(31); // October
    expect(getDaysInMonth(11, 2025)).toBe(30); // November
    expect(getDaysInMonth(12, 2025)).toBe(31); // December
  });

  it('should return 29 days for February in a leap year', () => {
    expect(getDaysInMonth(2, 2024)).toBe(29);
    expect(getDaysInMonth(2, 2020)).toBe(29);
    expect(getDaysInMonth(2, 2000)).toBe(29);
  });

  it('should return 0 for invalid months', () => {
    expect(getDaysInMonth(0, 2025)).toBe(0);
    expect(getDaysInMonth(13, 2025)).toBe(0);
    expect(getDaysInMonth(-1, 2025)).toBe(0);
  });
});

describe('isValidDate', () => {
  describe('Case 1: Invalid Day - November 31st', () => {
    it('should return false for 31/11/2025 (November only has 30 days)', () => {
      // November (month 11) only has 30 days
      expect(isValidDate(31, 11, 2025)).toBe(false);
    });
  });

  describe('Case 2: Leap Year Invalid - February 29th on non-leap year', () => {
    it('should return false for 29/02/2025 (2025 is not a leap year)', () => {
      // 2025 is not a leap year, so February only has 28 days
      expect(isValidDate(29, 2, 2025)).toBe(false);
    });
  });

  describe('Case 3: Leap Year Valid - February 29th on leap year', () => {
    it('should return true for 29/02/2024 (2024 is a leap year)', () => {
      // 2024 is a leap year, so February has 29 days
      expect(isValidDate(29, 2, 2024)).toBe(true);
    });
  });

  describe('Case 4: Month Overflow - Day 32', () => {
    it('should return false for 32/01/2025 (no month has 32 days)', () => {
      // No month has 32 days
      expect(isValidDate(32, 1, 2025)).toBe(false);
    });
  });

  describe('Additional edge cases', () => {
    it('should return false for invalid month (0)', () => {
      expect(isValidDate(15, 0, 2025)).toBe(false);
    });

    it('should return false for invalid month (13)', () => {
      expect(isValidDate(15, 13, 2025)).toBe(false);
    });

    it('should return false for invalid day (0)', () => {
      expect(isValidDate(0, 6, 2025)).toBe(false);
    });

    it('should return false for negative day', () => {
      expect(isValidDate(-1, 6, 2025)).toBe(false);
    });

    it('should return false for negative month', () => {
      expect(isValidDate(15, -1, 2025)).toBe(false);
    });

    it('should return false for invalid year (0)', () => {
      expect(isValidDate(15, 6, 0)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(isValidDate(15.5, 6, 2025)).toBe(false);
      expect(isValidDate(15, 6.5, 2025)).toBe(false);
      expect(isValidDate(15, 6, 2025.5)).toBe(false);
    });

    it('should return true for valid dates', () => {
      expect(isValidDate(1, 1, 2025)).toBe(true);
      expect(isValidDate(28, 2, 2025)).toBe(true);
      expect(isValidDate(30, 11, 2025)).toBe(true);
      expect(isValidDate(31, 12, 2025)).toBe(true);
    });

    it('should return false for day 30 in February even in leap year', () => {
      expect(isValidDate(30, 2, 2024)).toBe(false);
    });

    it('should return false for day 31 in months with 30 days', () => {
      expect(isValidDate(31, 4, 2025)).toBe(false);  // April
      expect(isValidDate(31, 6, 2025)).toBe(false);  // June
      expect(isValidDate(31, 9, 2025)).toBe(false);  // September
      expect(isValidDate(31, 11, 2025)).toBe(false); // November
    });
  });
});

describe('validateDateString', () => {
  it('should validate DD/MM/YYYY format correctly', () => {
    const result = validateDateString('15/06/2025');
    expect(result.valid).toBe(true);
    expect(result.day).toBe(15);
    expect(result.month).toBe(6);
    expect(result.year).toBe(2025);
  });

  it('should validate DD/MM format and use current year', () => {
    const result = validateDateString('15/06');
    expect(result.valid).toBe(true);
    expect(result.day).toBe(15);
    expect(result.month).toBe(6);
  });

  it('should return error for invalid date 31/11/2025', () => {
    const result = validateDateString('31/11/2025');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A data inserida não existe no calendário (ex: 31 de Novembro).');
  });

  it('should return error for invalid date 29/02/2025', () => {
    const result = validateDateString('29/02/2025');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A data inserida não existe no calendário (ex: 31 de Novembro).');
  });

  it('should return valid for 29/02/2024 (leap year)', () => {
    const result = validateDateString('29/02/2024');
    expect(result.valid).toBe(true);
  });

  it('should return error for invalid format', () => {
    const result = validateDateString('invalid');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid date format. Use DD/MM or DD/MM/YYYY');
  });

  it('should return error for 32/01/2025', () => {
    const result = validateDateString('32/01/2025');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A data inserida não existe no calendário (ex: 31 de Novembro).');
  });
});

describe('validateISODateString', () => {
  it('should return valid for null or undefined dates', () => {
    expect(validateISODateString(null).valid).toBe(true);
    expect(validateISODateString(undefined).valid).toBe(true);
  });

  it('should return valid for a valid ISO date', () => {
    const result = validateISODateString('2025-06-15T09:00:00.000Z');
    expect(result.valid).toBe(true);
  });

  it('should return error for invalid date 31/11/2025 in ISO format', () => {
    // Note: This would be auto-corrected by JavaScript to December 1st
    // Our validation should catch this
    const result = validateISODateString('2025-11-31T09:00:00.000Z');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A data inserida não existe no calendário (ex: 31 de Novembro).');
  });

  it('should return error for February 29th on non-leap year', () => {
    const result = validateISODateString('2025-02-29T09:00:00.000Z');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A data inserida não existe no calendário (ex: 31 de Novembro).');
  });

  it('should return valid for February 29th on leap year', () => {
    const result = validateISODateString('2024-02-29T09:00:00.000Z');
    expect(result.valid).toBe(true);
  });

  it('should return error for day 32', () => {
    const result = validateISODateString('2025-01-32T09:00:00.000Z');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('A data inserida não existe no calendário (ex: 31 de Novembro).');
  });

  it('should handle various time zones and formats', () => {
    expect(validateISODateString('2025-06-15T00:00:00Z').valid).toBe(true);
    expect(validateISODateString('2025-06-15').valid).toBe(true);
  });
});
