
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SOSButtonProps {
  onTrigger: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);

  const startPress = () => {
    setPressing(true);
    setProgress(0);
    // Vibrate if available
    if (navigator.vibrate) navigator.vibrate(50);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          triggerSOS();
          return 100;
        }
        return prev + 2; // Roughly 50ms * 50 steps = 2.5s -> tweaked for feel
      });
    }, 30);
  };

  const endPress = () => {
    setPressing(false);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const triggerSOS = () => {
    endPress();
    onTrigger();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
          pressing ? 'bg-red-600 scale-105' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/30" />
        
        {/* Progress Ring */}
        {pressing && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="164" // 2 * PI * 26
              strokeDashoffset={164 - (164 * progress) / 100}
              className="transition-all duration-75 ease-linear"
            />
          </svg>
        )}

        <AlertTriangle size={24} className="text-white animate-pulse" />
      </button>
      {pressing && (
         <div className="absolute top-16 right-0 bg-red-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-bounce">
            Hold for SOS
         </div>
      )}
    </div>
  );
};
