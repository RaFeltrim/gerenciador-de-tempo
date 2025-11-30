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
    <div className="flex flex-col items-center p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm">
      <div className="text-4xl font-mono font-bold mb-8 text-gray-800">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium shadow-lg shadow-indigo-500/20"
          >
            <Play className="h-5 w-5" />
            Iniciar
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-lg shadow-red-500/20"
          >
            <Pause className="h-5 w-5" />
            Pausar
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium shadow-sm"
        >
          <RotateCcw className="h-5 w-5" />
          Resetar
        </button>
      </div>
    </div>
  );
};