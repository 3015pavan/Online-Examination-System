import React, { useState, useEffect } from 'react';

const ExamTimer = ({ duration, onTimeEnd, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLowTime = timeLeft < 300; // 5 minutes

  return (
    <div
      className={`text-center p-4 rounded-lg font-bold text-2xl ${
        isLowTime
          ? 'bg-red-100 text-red-600 animate-pulse'
          : 'bg-blue-100 text-blue-600'
      }`}
    >
      ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default ExamTimer;
