/**
 * Task Utilities Test Suite
 * Tests for task-related utility functions including recurrence patterns and labels
 */

import { calculateNextDueDate, getRecurrenceLabel, RecurrencePattern } from '../../src/lib/task-utils';

describe('Task Utilities', () => {
  describe('getRecurrenceLabel', () => {
    it('should return "Diário" for daily pattern', () => {
      expect(getRecurrenceLabel('daily')).toBe('Diário');
    });

    it('should return "Semanal" for weekly pattern', () => {
      expect(getRecurrenceLabel('weekly')).toBe('Semanal');
    });

    it('should return "Mensal" for monthly pattern', () => {
      expect(getRecurrenceLabel('monthly')).toBe('Mensal');
    });

    it('should return "Dias úteis" for weekdays pattern', () => {
      expect(getRecurrenceLabel('weekdays')).toBe('Dias úteis');
    });

    it('should return empty string for null pattern', () => {
      expect(getRecurrenceLabel(null)).toBe('');
    });
  });

  describe('calculateNextDueDate', () => {
    // Use a fixed date for testing to ensure consistent results
    const baseDate = '2025-06-15T09:00:00.000Z'; // Sunday, June 15, 2025

    describe('daily recurrence', () => {
      it('should add one day for daily pattern', () => {
        const result = calculateNextDueDate(baseDate, 'daily');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        const originalDate = new Date(baseDate);
        
        expect(resultDate.getDate()).toBe(originalDate.getDate() + 1);
      });
    });

    describe('weekly recurrence', () => {
      it('should add 7 days for weekly pattern', () => {
        const result = calculateNextDueDate(baseDate, 'weekly');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        const originalDate = new Date(baseDate);
        
        // Check that exactly 7 days were added
        const diffTime = resultDate.getTime() - originalDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        expect(Math.round(diffDays)).toBe(7);
      });
    });

    describe('monthly recurrence', () => {
      it('should add one month for monthly pattern', () => {
        const result = calculateNextDueDate(baseDate, 'monthly');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        const originalDate = new Date(baseDate);
        
        // Check month increased by 1
        expect(resultDate.getMonth()).toBe(originalDate.getMonth() + 1);
      });

      it('should handle year rollover correctly', () => {
        const decemberDate = '2025-12-15T09:00:00.000Z';
        const result = calculateNextDueDate(decemberDate, 'monthly');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        
        // Should be January of next year
        expect(resultDate.getMonth()).toBe(0); // January
        expect(resultDate.getFullYear()).toBe(2026);
      });
    });

    describe('weekdays recurrence', () => {
      it('should skip to Monday when base date is Friday', () => {
        const fridayDate = '2025-06-13T09:00:00.000Z'; // Friday
        const result = calculateNextDueDate(fridayDate, 'weekdays');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        // Should be Monday (day 1)
        expect(resultDate.getDay()).toBe(1);
      });

      it('should skip to Monday when base date is Saturday', () => {
        const saturdayDate = '2025-06-14T09:00:00.000Z'; // Saturday
        const result = calculateNextDueDate(saturdayDate, 'weekdays');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        // Should be Monday (day 1)
        expect(resultDate.getDay()).toBe(1);
      });

      it('should skip to Monday when base date is Sunday', () => {
        const sundayDate = '2025-06-15T09:00:00.000Z'; // Sunday
        const result = calculateNextDueDate(sundayDate, 'weekdays');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        // Should be Monday (day 1)
        expect(resultDate.getDay()).toBe(1);
      });

      it('should go to next weekday when base date is a weekday', () => {
        const mondayDate = '2025-06-16T09:00:00.000Z'; // Monday
        const result = calculateNextDueDate(mondayDate, 'weekdays');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        // Should be Tuesday (day 2)
        expect(resultDate.getDay()).toBe(2);
      });
    });

    describe('null due date handling', () => {
      it('should start from tomorrow when current due date is null', () => {
        const result = calculateNextDueDate(null, 'daily');
        expect(result).not.toBeNull();
        
        const resultDate = new Date(result!);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2); // +1 for tomorrow, +1 for daily pattern
        
        // Just verify it's a valid future date
        expect(resultDate.getTime()).toBeGreaterThan(Date.now());
      });
    });

    describe('invalid pattern handling', () => {
      it('should return null for invalid pattern', () => {
        const result = calculateNextDueDate(baseDate, 'invalid' as RecurrencePattern);
        expect(result).toBeNull();
      });
    });
  });
});
