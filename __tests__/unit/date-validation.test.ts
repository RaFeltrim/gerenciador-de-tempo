import { isValidDate, isLeapYear, getDaysInMonth } from '../../src/lib/date-validation';

describe('Date Validation Functions', () => {
  describe('isLeapYear', () => {
    it('should return true for leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
    });

    it('should return false for non-leap years', () => {
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for each month', () => {
      expect(getDaysInMonth(1, 2025)).toBe(31); // January
      expect(getDaysInMonth(2, 2025)).toBe(28); // February (non-leap year)
      expect(getDaysInMonth(2, 2024)).toBe(29); // February (leap year)
      expect(getDaysInMonth(4, 2025)).toBe(30); // April
    });

    it('should return 0 for invalid months', () => {
      expect(getDaysInMonth(0, 2025)).toBe(0);
      expect(getDaysInMonth(13, 2025)).toBe(0);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(1, 1, 2025)).toBe(true); // January 1st
      expect(isValidDate(29, 2, 2024)).toBe(true); // February 29th (leap year)
      expect(isValidDate(31, 12, 2025)).toBe(true); // December 31st
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate(31, 11, 2025)).toBe(false); // November has only 30 days
      expect(isValidDate(29, 2, 2025)).toBe(false); // 2025 is not a leap year
      expect(isValidDate(32, 1, 2025)).toBe(false); // No month has 32 days
      expect(isValidDate(0, 1, 2025)).toBe(false); // Day must be at least 1
      expect(isValidDate(1, 0, 2025)).toBe(false); // Month must be 1-12
      expect(isValidDate(1, 13, 2025)).toBe(false); // Month must be 1-12
      expect(isValidDate(1, 1, -1)).toBe(false); // Year must be positive
    });

    it('should return false for non-integer inputs', () => {
      expect(isValidDate(1.5, 1, 2025)).toBe(false);
      expect(isValidDate(1, 1.5, 2025)).toBe(false);
      expect(isValidDate(1, 1, 2025.5)).toBe(false);
    });
  });
});
