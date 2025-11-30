import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroTimerProps {
  initialTime?: number; // in seconds
  onTimerEnd?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  initialTime = 25 * 60,
  onTimerEnd 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimerEnd) {
              onTimerEnd();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-4xl font-mono font-bold mb-6 text-gray-800">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Play className="h-5 w-5" />
            Iniciar
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Pause className="h-5 w-5" />
            Pausar
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <RotateCcw className="h-5 w-5" />
          Resetar
        </button>
      </div>
    </div>
  );
};