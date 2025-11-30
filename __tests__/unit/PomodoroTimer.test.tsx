/**
 * PomodoroTimer Component Test Suite
 * Tests for the Pomodoro timer functionality
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PomodoroTimer } from '../../src/components/PomodoroTimer';
import '@testing-library/jest-dom';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Play: () => <span data-testid="play-icon">Play</span>,
  Pause: () => <span data-testid="pause-icon">Pause</span>,
  RotateCcw: () => <span data-testid="reset-icon">Reset</span>,
}));

describe('PomodoroTimer Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render with default 25 minutes', () => {
      render(<PomodoroTimer />);
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('should render with custom initial time', () => {
      render(<PomodoroTimer initialTime={5 * 60} />); // 5 minutes
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    it('should render Iniciar button initially', () => {
      render(<PomodoroTimer />);
      expect(screen.getByText('Iniciar')).toBeInTheDocument();
    });

    it('should render Resetar button', () => {
      render(<PomodoroTimer />);
      expect(screen.getByText('Resetar')).toBeInTheDocument();
    });

    it('should render play icon when not running', () => {
      render(<PomodoroTimer />);
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('should start counting down when Iniciar is clicked', () => {
      render(<PomodoroTimer initialTime={10} />); // 10 seconds
      
      expect(screen.getByText('00:10')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      act(() => {
        jest.advanceTimersByTime(1000); // Advance 1 second
      });
      
      expect(screen.getByText('00:09')).toBeInTheDocument();
    });

    it('should show Pausar button when timer is running', () => {
      render(<PomodoroTimer initialTime={10} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      expect(screen.getByText('Pausar')).toBeInTheDocument();
    });

    it('should stop counting when Pausar is clicked', () => {
      render(<PomodoroTimer initialTime={10} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      act(() => {
        jest.advanceTimersByTime(2000); // Advance 2 seconds
      });
      
      expect(screen.getByText('00:08')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Pausar'));
      
      act(() => {
        jest.advanceTimersByTime(2000); // Advance 2 more seconds
      });
      
      // Timer should still show 8 seconds (not counting)
      expect(screen.getByText('00:08')).toBeInTheDocument();
    });

    it('should reset timer when Resetar is clicked', () => {
      render(<PomodoroTimer initialTime={10} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      act(() => {
        jest.advanceTimersByTime(3000); // Advance 3 seconds
      });
      
      expect(screen.getByText('00:07')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Resetar'));
      
      expect(screen.getByText('00:10')).toBeInTheDocument();
    });

    it('should stop running when Resetar is clicked during countdown', () => {
      render(<PomodoroTimer initialTime={10} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      fireEvent.click(screen.getByText('Resetar'));
      
      expect(screen.getByText('Iniciar')).toBeInTheDocument();
    });
  });

  describe('Timer Completion', () => {
    it('should call onTimerEnd when timer reaches 0', () => {
      const mockOnTimerEnd = jest.fn();
      render(<PomodoroTimer initialTime={2} onTimerEnd={mockOnTimerEnd} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      act(() => {
        jest.advanceTimersByTime(2000); // Advance 2 seconds to reach 0
      });
      
      expect(mockOnTimerEnd).toHaveBeenCalledTimes(1);
    });

    it('should stop running when timer reaches 0', () => {
      render(<PomodoroTimer initialTime={2} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
      expect(screen.getByText('Iniciar')).toBeInTheDocument();
    });

    it('should display 00:00 when completed', () => {
      render(<PomodoroTimer initialTime={1} />);
      
      fireEvent.click(screen.getByText('Iniciar'));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('should format single digit minutes correctly', () => {
      render(<PomodoroTimer initialTime={5 * 60} />);
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    it('should format double digit minutes correctly', () => {
      render(<PomodoroTimer initialTime={15 * 60} />);
      expect(screen.getByText('15:00')).toBeInTheDocument();
    });

    it('should format seconds correctly', () => {
      render(<PomodoroTimer initialTime={65} />); // 1:05
      expect(screen.getByText('01:05')).toBeInTheDocument();
    });

    it('should format mixed time correctly', () => {
      render(<PomodoroTimer initialTime={12 * 60 + 34} />); // 12:34
      expect(screen.getByText('12:34')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short timer (1 second)', () => {
      render(<PomodoroTimer initialTime={1} />);
      expect(screen.getByText('00:01')).toBeInTheDocument();
    });

    it('should handle long timer (60 minutes)', () => {
      render(<PomodoroTimer initialTime={60 * 60} />);
      expect(screen.getByText('60:00')).toBeInTheDocument();
    });

    it('should handle 0 initial time', () => {
      render(<PomodoroTimer initialTime={0} />);
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });
});
